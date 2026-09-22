# TrustVote System Architecture

> **Guiding Principle:** *Dashboard First, AI Second.*
> TrustVote is designed as an interactive, nonpartisan public election information dashboard. AI acts exclusively as an on-demand, secondary side-panel assistant with strict retrieval-augmented generation (RAG) and zero-hallucination refusal guarantees.

---

## 1. High-Level Architecture Diagram

```mermaid
flowchart TD
    subgraph Client["Voter Client (Desktop / Mobile)"]
        Browser["Next.js 15 Web Application\n(React 19, TypeScript, Tailwind CSS)"]
        Dashboard["Verified Election Dashboard\n(Cards, Timeline, Statements, FEC)"]
        SidePanel["Ask TrustVote\n(Collapsible AI Assistant)"]
        Browser --> Dashboard
        Browser --> SidePanel
    end

    subgraph Hosting["Edge & CDN"]
        CF["Amazon CloudFront / AWS Amplify"]
        CF --> Browser
    end

    subgraph API["Application Services"]
        APIGW["Amazon API Gateway (HTTP API)"]
        Lambda["AWS Lambda Router (Python 3.12)\n• /search\n• /candidate/{id}\n• /measure/{id}\n• /ask"]
    end

    subgraph DataStore["Structured Storage"]
        Dynamo["Amazon DynamoDB\n(Profiles, Timelines, Actions)"]
        CandidateJSON["S3 / Static Structured Storage\n(candidates.json, ballot-measures.json)"]
    end

    subgraph RAG["Retrieval-Augmented Generation (RAG) Engine"]
        BedrockAgent["Amazon Bedrock Knowledge Bases"]
        AOSS["Amazon OpenSearch Serverless\n(Vector Index - Embeddings)"]
        S3Docs["Amazon S3 Verified Document Lake\n(.txt/.pdf + .metadata.json)"]
        Claude["Anthropic Claude 3.5 Sonnet\n(Amazon Bedrock, temp=0.0)"]
    end

    Dashboard -- "GET /search, /candidate/{id}" --> APIGW
    SidePanel -- "POST /ask (Natural Language)" --> APIGW
    APIGW --> Lambda

    Lambda -- "Fast structured read" --> Dynamo
    Lambda -- "Read profiles & measures" --> CandidateJSON
    Lambda -- "RAG Query (Strict Grounding)" --> BedrockAgent
    BedrockAgent <--> AOSS
    BedrockAgent <--> S3Docs
    BedrockAgent --> Claude
    Claude -- "Verified Answer + Citations\n(Or Refusal)" --> Lambda
```

---

## 2. Core Components

### 2.1 Frontend (Next.js 15 + React 19 + TypeScript)
- **Dashboard First**: Voters primarily navigate structured cards with direct links to government filings, legislative votes, and campaign disclosures.
- **Collapsible AI Side-Panel**: A slide-out drawer powered by Bedrock RAG. Does not obstruct primary dashboard data.
- **Civic Government Aesthetic**: Clean, high-legibility styling using navy `#0F2942`, white/slate backgrounds, and emerald verification badges.
- **Accessibility Engine**:
  - High-contrast mode toggle
  - Large-text mode toggle
  - Screen reader semantic markup (`aria-live`, `aria-describedby`, landmark roles)
  - Full keyboard navigable focus rings

### 2.2 API Layer (Amazon API Gateway + AWS Lambda)
- **Serverless**: Zero idle cost, auto-scaling, no EC2/ECS/Kubernetes required.
- **REST Endpoints**:
  - `GET /search?q={query}`: Multi-entity search across candidates, ballot propositions, and policy topics.
  - `GET /candidate/{id}`: Returns complete verified candidate dossier (biography, campaign finance, roll-call votes, official quotes).
  - `GET /measure/{id}`: Returns certified ballot measure breakdown (yes/no meanings, fiscal impact, official sponsor arguments).
  - `POST /ask`: Executes verified RAG against Bedrock Knowledge Base.

### 2.3 RAG & Bedrock Knowledge Base
- **Knowledge Base Storage**: Amazon S3 bucket containing official government publications, Congressional hearing transcripts, FEC filings, and state ballot pamphlets.
- **Vector Search**: Amazon OpenSearch Serverless collection indexing document embeddings (Titan / Cohere Embeddings).
- **Strict Claude 3.5 Sonnet Invocations**:
  - Temperature set to `0.0`.
  - Zero extrapolation outside retrieved text.
  - Mandatory refusal if query falls outside verified corpus:
    > *"I don't have enough verified information to answer this question. Please consult official government election resources at your state election office."*

---

## 3. Data Flow Comparison

| Feature | Primary Dashboard Flow | AI Side-Panel Flow |
| :--- | :--- | :--- |
| **Trigger** | Page navigation, search select, tab clicks | Voter asks natural language question |
| **Engine** | Structured JSON / DynamoDB | Amazon Bedrock Knowledge Base + Claude 3.5 Sonnet |
| **Output Type** | Cards, interactive timeline, charts, quote tables | Grounded synthesis with clickable source badges |
| **Generation Risk** | Zero (100% deterministic source data) | Guardrailed RAG with refusal on unverified facts |
| **Sources** | Displayed on every single card and data row | Displayed with publication date, tier, and direct URL |
