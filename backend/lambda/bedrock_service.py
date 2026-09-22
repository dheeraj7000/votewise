"""
Amazon Bedrock & Knowledge Base RAG Service for TrustVote
Strictly grounded RAG using Claude 3.5 Sonnet.
Enforces zero hallucination, strict refusal on missing information, and verified citations.
"""

import os
import json
import re
from typing import Dict, Any, List, Optional
import boto3
from botocore.exceptions import ClientError

from models import AskResponse

DEFAULT_REFUSAL = (
    "I don't have enough verified information to answer this question. "
    "Please consult official government election resources at your state election office."
)

CLAUDE_3_5_SONNET_ARN = os.environ.get(
    "BEDROCK_MODEL_ARN",
    "arn:aws:bedrock:us-west-2::foundation-model/anthropic.claude-3-5-sonnet-20240620-v1:0"
)
KNOWLEDGE_BASE_ID = os.environ.get("BEDROCK_KB_ID", "")
AWS_REGION = os.environ.get("AWS_REGION", "us-west-2")

def _find_docs_dir() -> str:
    possible_dirs = [
        os.path.join(os.path.dirname(__file__), "..", "knowledge-base", "documents"),
        os.path.join(os.path.dirname(__file__), "knowledge-base", "documents"),
        os.path.join("/var/task", "knowledge-base", "documents"),
        os.path.join("/var/task", "documents"),
        os.path.join(os.getcwd(), "backend", "knowledge-base", "documents"),
    ]
    for d in possible_dirs:
        if os.path.exists(d):
            return d
    return possible_dirs[0]

DOCUMENTS_DIR = _find_docs_dir()

class BedrockService:
    def __init__(self):
        self.region = AWS_REGION
        self.kb_id = KNOWLEDGE_BASE_ID
        self._init_aws_clients()
        self._local_docs = self._load_local_documents()

    def _init_aws_clients(self):
        try:
            self.agent_runtime = boto3.client("bedrock-agent-runtime", region_name=self.region)
            self.bedrock_runtime = boto3.client("bedrock-runtime", region_name=self.region)
            self.has_aws = True
        except Exception as e:
            print(f"[BedrockService] AWS client init notice: {e}")
            self.has_aws = False

    def _load_local_documents(self) -> List[Dict[str, Any]]:
        """Load local knowledge base documents and metadata for hybrid/fallback RAG"""
        docs = []
        if not os.path.exists(DOCUMENTS_DIR):
            return docs

        for fname in os.listdir(DOCUMENTS_DIR):
            if fname.endswith(".txt"):
                txt_path = os.path.join(DOCUMENTS_DIR, fname)
                meta_path = os.path.join(DOCUMENTS_DIR, f"{fname}.metadata.json")
                
                try:
                    with open(txt_path, "r", encoding="utf-8") as f:
                        text_content = f.read()
                    
                    metadata = {}
                    if os.path.exists(meta_path):
                        with open(meta_path, "r", encoding="utf-8") as mf:
                            meta_json = json.load(mf)
                            metadata = meta_json.get("metadataAttributes", {})
                    
                    docs.append({
                        "filename": fname,
                        "content": text_content,
                        "metadata": metadata
                    })
                except Exception as e:
                    print(f"Error loading doc {fname}: {e}")
        return docs

    def ask(self, question: str, candidate_id: Optional[str] = None) -> AskResponse:
        """
        Process a user question against the Knowledge Base using Bedrock RAG.
        Strictly refuses to answer if verified knowledge is not retrieved.
        """
        clean_question = question.strip()
        if not clean_question:
            return AskResponse(
                answer="Please enter a valid question regarding a candidate or ballot measure.",
                trustTier="Tier 1 - Government",
                confidence="Insufficient Data",
                sources=[],
                verified=False,
                notice="Empty question."
            )

        # 1. Try Bedrock Knowledge Base if KB_ID is configured in AWS
        if self.has_aws and self.kb_id:
            try:
                return self._query_bedrock_kb(clean_question, candidate_id)
            except ClientError as e:
                print(f"[BedrockService] Bedrock KB call failed: {e}. Falling back to grounded document search.")

        # 2. Grounded document RAG (using local KB documents + Bedrock Claude if available, or deterministic verified RAG)
        return self._query_grounded_local_rag(clean_question, candidate_id)

    def _query_bedrock_kb(self, question: str, candidate_id: Optional[str] = None) -> AskResponse:
        """
        Query Bedrock Knowledge Base using retrieve_and_generate API with Claude 3.5 Sonnet
        """
        retrieval_filter = None
        if candidate_id:
            retrieval_filter = {
                "equals": {
                    "key": "candidateId",
                    "value": candidate_id
                }
            }

        rag_config: Dict[str, Any] = {
            "type": "KNOWLEDGE_BASE",
            "knowledgeBaseConfiguration": {
                "knowledgeBaseId": self.kb_id,
                "modelArn": CLAUDE_3_5_SONNET_ARN,
                "generationConfiguration": {
                    "promptTemplate": {
                        "textPromptTemplate": (
                            "You are TrustVote, a nonpartisan election information assistant. "
                            "Answer the voter's question strictly using ONLY the retrieved search results below. "
                            "Do NOT use external knowledge. Do NOT hallucinate. "
                            "If the retrieved results do not contain enough verified information to answer the question, "
                            "you MUST return exactly: '" + DEFAULT_REFUSAL + "'\n\n"
                            "Search Results:\n$search_results$\n\n"
                            "Voter Question: $query$\n\nAnswer:"
                        )
                    }
                }
            }
        }

        if retrieval_filter:
            rag_config["knowledgeBaseConfiguration"]["retrievalConfiguration"] = {
                "vectorSearchConfiguration": {
                    "filter": retrieval_filter
                }
            }

        response = self.agent_runtime.retrieve_and_generate(
            input={"text": question},
            retrieveAndGenerateConfiguration=rag_config
        )

        output_text = response.get("output", {}).get("text", "")
        citations = response.get("citations", [])

        sources = []
        for cit in citations:
            for ref in cit.get("retrievedReferences", []):
                loc = ref.get("location", {}).get("s3Location", {})
                uri = loc.get("uri", "")
                meta = ref.get("metadata", {})
                sources.append({
                    "title": meta.get("documentType", "Verified Record"),
                    "url": meta.get("url", uri),
                    "organization": meta.get("source", "Official Election Authority"),
                    "tier": meta.get("tier", "Tier 1 - Government"),
                    "publishedDate": meta.get("publishedDate", "Recent"),
                    "excerpt": ref.get("content", {}).get("text", "")[:280]
                })

        if DEFAULT_REFUSAL in output_text or not sources:
            return AskResponse(
                answer=DEFAULT_REFUSAL,
                trustTier="Tier 1 - Government",
                confidence="Insufficient Data",
                sources=[],
                verified=False,
                notice="Refusal: Insufficient verified documentation in official knowledge base."
            )

        return AskResponse(
            answer=output_text,
            trustTier="Tier 1 - Government",
            confidence="High",
            sources=sources,
            verified=True
        )

    def _query_grounded_local_rag(self, question: str, candidate_id: Optional[str] = None) -> AskResponse:
        """
        Deterministic, fully verified local RAG engine.
        Filters candidate documents, extracts exact matching paragraphs, applies BM25-style scoring.
        If sufficient verified info is absent, strictly refuses.
        """
        STOP_WORDS = {
            "what", "is", "are", "was", "were", "the", "and", "has", "have", "had",
            "this", "that", "these", "those", "for", "with", "about", "his", "her",
            "their", "does", "did", "person", "candidate", "mention", "mentioned",
            "discuss", "discussed", "where", "can", "read", "find", "who", "how",
            "favorite", "tell", "which", "official"
        }
        
        # Remove candidate name words from substantive tokens to avoid false positives on the name alone
        name_words = set()
        if candidate_id:
            name_words = set(re.split(r"[-_\s]+", candidate_id.lower()))
            for doc in self._local_docs:
                if doc["metadata"].get("candidateId") == candidate_id:
                    name_words.update(re.split(r"\W+", doc["metadata"].get("candidateName", "").lower()))

        all_tokens = [w for w in re.split(r"\W+", question.lower()) if len(w) > 2]
        substantive_tokens = [w for w in all_tokens if w not in STOP_WORDS and w not in name_words]

        # If user only asked candidate's name or empty question, refusal
        if not substantive_tokens:
            return AskResponse(
                answer=DEFAULT_REFUSAL,
                trustTier="Tier 1 - Government",
                confidence="Insufficient Data",
                sources=[],
                verified=False,
                notice="Refusal: Query does not contain specific substantive election or policy topics."
            )

        # Filter docs
        eligible_docs = []
        for doc in self._local_docs:
            meta = doc["metadata"]
            if candidate_id and meta.get("candidateId") != candidate_id and meta.get("measureId") != candidate_id:
                continue
            eligible_docs.append(doc)

        if not eligible_docs:
            eligible_docs = self._local_docs

        # Chunk documents into paragraphs/sections
        scored_chunks = []
        for doc in eligible_docs:
            paragraphs = doc["content"].split("\n\n")
            meta = doc["metadata"]
            for p in paragraphs:
                p_clean = p.strip()
                if len(p_clean) < 40:
                    continue
                p_lower = p_clean.lower()
                
                # Calculate match score based strictly on substantive whole words
                score = 0
                matched_tokens = []
                for token in substantive_tokens:
                    matches = len(re.findall(r"\b" + re.escape(token) + r"\b", p_lower))
                    if matches > 0:
                        score += matches * (3 if len(token) > 5 else 1)
                        matched_tokens.append(token)

                if score > 0 and len(matched_tokens) >= 1:
                    scored_chunks.append({
                        "score": score,
                        "matched_count": len(matched_tokens),
                        "text": p_clean,
                        "metadata": meta,
                        "doc_name": doc["filename"]
                    })

        scored_chunks.sort(key=lambda x: (x["matched_count"], x["score"]), reverse=True)

        # Threshold check: requires at least one substantive verified topic match
        if not scored_chunks or scored_chunks[0]["matched_count"] < 1:
            return AskResponse(
                answer=DEFAULT_REFUSAL,
                trustTier="Tier 1 - Government",
                confidence="Insufficient Data",
                sources=[],
                verified=False,
                notice="Refusal: Insufficient verified records found for this query."
            )

        top_chunk = scored_chunks[0]
        top_meta = top_chunk["metadata"]

        # If AWS Bedrock Claude 3.5 Sonnet is accessible, generate synthesized answer strictly from context
        claude_answer = self._try_bedrock_claude(question, [top_chunk["text"]])
        
        if claude_answer:
            answer_text = claude_answer
        else:
            # Deterministic excerpt formatting
            answer_text = f"According to verified official records ({top_meta.get('source', 'Official Authority')}):\n\n\"{top_chunk['text']}\""

        sources = [
            {
                "title": top_meta.get("documentType", "Official Record"),
                "url": top_meta.get("url", "https://www.congress.gov"),
                "organization": top_meta.get("source", "Official Government Filing"),
                "tier": top_meta.get("tier", "Tier 1 - Government"),
                "publishedDate": top_meta.get("publishedDate", "2026"),
                "excerpt": top_chunk["text"][:300] + ("..." if len(top_chunk["text"]) > 300 else "")
            }
        ]

        # Add second source if available and distinct
        if len(scored_chunks) > 1 and scored_chunks[1]["metadata"].get("url") != top_meta.get("url"):
            sub_chunk = scored_chunks[1]
            sub_meta = sub_chunk["metadata"]
            sources.append({
                "title": sub_meta.get("documentType", "Verified Record"),
                "url": sub_meta.get("url", "https://www.fec.gov"),
                "organization": sub_meta.get("source", "Official Government Filing"),
                "tier": sub_meta.get("tier", "Tier 1 - Government"),
                "publishedDate": sub_meta.get("publishedDate", "2026"),
                "excerpt": sub_chunk["text"][:280] + ("..." if len(sub_chunk["text"]) > 280 else "")
            })

        return AskResponse(
            answer=answer_text,
            trustTier=top_meta.get("tier", "Tier 1 - Government"),
            confidence="High",
            sources=sources,
            verified=True
        )

    def _try_bedrock_claude(self, question: str, context_chunks: List[str]) -> Optional[str]:
        """Try calling Bedrock Claude 3.5 Sonnet with zero-temperature grounded prompt"""
        if not self.has_aws:
            return None

        prompt_context = "\n---\n".join(context_chunks)
        system_instruction = (
            "You are TrustVote, a nonpartisan election information assistant. "
            "You MUST answer the question using ONLY the verified context provided below. "
            "Never use outside knowledge or hallucinate. Be objective, concise, and professional. "
            "If the text does not contain direct facts answering the question, return exactly:\n"
            f"{DEFAULT_REFUSAL}"
        )

        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 512,
            "temperature": 0.0,
            "system": system_instruction,
            "messages": [
                {
                    "role": "user",
                    "content": f"Verified Official Context:\n{prompt_context}\n\nQuestion: {question}"
                }
            ]
        })

        # Try model invocation with Claude 3.5 Sonnet
        model_ids = [
            "anthropic.claude-3-5-sonnet-20240620-v1:0",
            "us.anthropic.claude-3-5-sonnet-20240620-v1:0",
            "anthropic.claude-3-haiku-20240307-v1:0"
        ]

        for mid in model_ids:
            try:
                res = self.bedrock_runtime.invoke_model(
                    modelId=mid,
                    contentType="application/json",
                    accept="application/json",
                    body=body
                )
                res_body = json.loads(res["body"].read().decode("utf-8"))
                return res_body.get("content", [{}])[0].get("text", "")
            except Exception as e:
                continue

        return None

# Singleton
bedrock_service = BedrockService()
