# TrustVote - Nonpartisan Verified Election Information Assistant

> **Core Principle:** *Dashboard First, AI Second.*
> TrustVote is an interactive, nonpartisan public election information dashboard designed to provide voters with structured, verified, and cited election facts. AI acts exclusively as an on-demand, secondary assistant via a collapsible side panel with strict Amazon Bedrock Knowledge Bases (RAG) grounding and zero-hallucination refusal guarantees.

---

## 🌟 Key Features

1. **Dashboard-First UX**:
   - Primary experience is an interactive dashboard presenting structured, verified public records (no chatbot wall).
   - Candidate dossiers: Official photo, contact links, verifiable education/career history, interactive career timeline, FEC campaign finance filings, sourced official policy statements, and sponsored legislative actions.
   - Certified ballot measure breakdowns: Plain-English summaries, what a "YES" or "NO" vote means, fiscal impact assessments, and official sponsor arguments.

2. **On-Demand AI Assistant ("Ask TrustVote")**:
   - Collapsible slide-out assistant that never obstructs the dashboard.
   - Powered by **Amazon Bedrock** (Claude 3.5 Sonnet) with **Amazon Bedrock Knowledge Bases** and vector search via **Amazon OpenSearch Serverless**.
   - Zero hallucination guarantee: Strict `temperature=0.0` grounding on retrieved documents. Answers only what can be verified from official government transcripts, bills, and FEC filings. Refuses out-of-scope questions and routes voters to their state election office.

3. **Trust & Verification Model**:
   - Strict 3-tier source hierarchy (Tier 1: Official Government, Tier 2: Nonpartisan Fact Checkers, Tier 3: Verified Consensus Sources).
   - Every single card, quote, vote, and timeline milestone displays full source attribution, publishing date, verification level, and a link to the original document.

4. **Democracy Works Elections API Integration**:
   - Integrated with the **Democracy Works Elections API (v2)** (`https://www.democracy.works/elections-api`) for verified election dates, voter registration deadlines (online, mail, in-person), early voting windows, vote-by-mail ballot postmark rules, and official state election authority contact portals.
   - Live query support via `x-api-key` header with seamless fallback to verified state authority records.
   - Endpoints: `GET /elections` and `GET /authorities` mapped to Open Civic Data IDs (OCD-IDs) across Washington, New Jersey, and California.

5. **Civic Accessibility Engine**:
   - Large Text Mode toggle (enhanced typography scale).
   - High Contrast Mode toggle (accessible dark navy and high-contrast colorways).
   - Full keyboard navigation and visible focus rings.
   - Screen reader semantic markup (`aria-live`, landmarks, and descriptive labels).

5. **100% Serverless AWS Architecture**:
   - Zero EC2, zero ECS, zero Kubernetes, zero container runtime required.
   - AWS Lambda (Python 3.12) + Amazon API Gateway (HTTP API).
   - Amazon Bedrock + OpenSearch Serverless + Amazon S3 + Amazon DynamoDB.
   - Frontend hosted on AWS Amplify / CloudFront.

---

## 📁 Repository Structure

```
.
├── backend/
│   ├── candidate-json/          # Structured JSON data (candidates, ballot measures, topics)
│   ├── knowledge-base/          # Source documents and S3 sync script
│   │   ├── documents/           # Official records, voting histories, and .metadata.json
│   │   └── sync_to_s3.py        # Knowledge base ingestion & Bedrock sync script
│   └── lambda/                  # AWS Lambda backend code
│       ├── handler.py           # API Gateway HTTP router
│       ├── bedrock_service.py   # Amazon Bedrock Knowledge Base RAG service
│       ├── data_service.py      # Structured JSON/DynamoDB queries
│       ├── models.py            # Pydantic data schemas
│       └── test_api.py          # Unit test suite
├── frontend/                    # Next.js 15 + React 19 + TypeScript + Tailwind CSS
│   ├── app/                     # App Router pages and API routes
│   │   ├── candidate/[id]/      # Candidate dossier dashboard page
│   │   ├── measure/[id]/        # Ballot measure details page
│   │   ├── api/                 # Local Next.js API route proxies
│   │   └── page.tsx             # Landing & search portal
│   ├── components/              # Reusable civic UI components
│   │   ├── CandidateOverviewCard.tsx
│   │   ├── BiographyCard.tsx
│   │   ├── TimelineCard.tsx
│   │   ├── CampaignFinanceCard.tsx
│   │   ├── OfficialStatementsCard.tsx
│   │   ├── PublicActionsCard.tsx
│   │   ├── TrustSourcesCard.tsx
│   │   ├── AiSidePanel.tsx      # Slide-out Bedrock AI assistant
│   │   ├── SearchBar.tsx        # Multi-entity autocomplete
│   │   ├── AccessibilityToolbar.tsx
│   │   └── VerificationBadge.tsx
│   ├── hooks/                   # Custom React hooks (useAccessibility)
│   ├── services/                # API client services
│   └── types/                   # TypeScript interfaces
├── infra/
│   └── template.yaml            # AWS SAM Infrastructure as Code (APIGW, Lambda, S3, DynamoDB)
└── docs/
    ├── ARCHITECTURE.md          # Complete architecture diagrams and specs
    ├── DEPLOYMENT.md            # AWS deployment manual (SAM, Amplify, CloudFront)
    └── TRUST_MODEL.md           # Verification levels and sourcing criteria
```

---

## 🚀 Quick Start (Local Development)

### 1. Run Backend Tests
Ensure Python 3.12+ is installed:
```bash
python3 -m unittest backend/lambda/test_api.py
```

### 2. Run Frontend Dashboard
Ensure Node.js 20+ is installed:
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Production Deployment on AWS

### Step 1: Deploy Infrastructure with AWS SAM
From the root directory:
```bash
cd infra
sam build
sam deploy --guided --stack-name trustvote-stack --capabilities CAPABILITY_IAM
```
Note the output values:
- `ApiEndpoint` (e.g. `https://xyz.execute-api.us-west-2.amazonaws.com/dev`)
- `DocumentsBucketName` (e.g. `trustvote-verified-documents-xxx`)

### Step 2: Ingest Knowledge Base Documents
Sync certified government documents and metadata to the S3 bucket:
```bash
python3 backend/knowledge-base/sync_to_s3.py \
  --bucket <DocumentsBucketName> \
  --prefix documents/ \
  --region us-west-2
```

### Step 3: Deploy Frontend to AWS Amplify / CloudFront
1. Connect your repository (`votewise`) in the **AWS Amplify Console** or deploy to S3 + CloudFront.
2. Configure the environment variable:
   ```env
   NEXT_PUBLIC_API_URL=https://hm02wlb4x4.execute-api.us-west-2.amazonaws.com/dev
   ```

---

## 🌐 Live AWS Production Deployment

TrustVote is actively deployed and operational on AWS in region `us-west-2`:

| Service | Endpoint / Link | Description |
| :--- | :--- | :--- |
| **Frontend Web Portal** | [http://trustvote-frontend-731732766290-us-west-2.s3-website-us-west-2.amazonaws.com](http://trustvote-frontend-731732766290-us-west-2.s3-website-us-west-2.amazonaws.com) | S3-hosted Next.js 15 Civic Web Portal |
| **CloudFront CDN** | `https://d1pflaowvgvxal.cloudfront.net` | Global edge caching & TLS distribution |
| **API Gateway (HTTP API)** | `https://hm02wlb4x4.execute-api.us-west-2.amazonaws.com/dev` | Serverless API router (`/search`, `/candidate/{id}`, `/elections`, `/ask`) |
| **AWS Lambda Backend** | Python 3.12 Serverless Handler | Bedrock RAG, data routing, Democracy Works integration |
| **Amazon S3 Document Lake** | `s3://trustvote-verified-documents-731732766290-dev` | Verified election documents & metadata |
| **Amazon DynamoDB** | `TrustVote-Profiles-dev` | Candidate and ballot proposition dossiers |

---

## 🛡️ Security & Privacy
- **Anonymous**: No voter accounts, no passwords, no personal identifying information (PII) recorded.
- **Stateless & Auditable**: All queries are evaluated against immutable government source documents.
- **Zero Hallucination Guardrails**: Bedrock prompts are strictly bounded to retrieved context with automatic refusal fallbacks.

---

## 📜 Documentation
- [System Architecture](file:///root/votewise/docs/ARCHITECTURE.md)
- [AWS Deployment Guide](file:///root/votewise/docs/DEPLOYMENT.md)
- [Trust & Verification Model](file:///root/votewise/docs/TRUST_MODEL.md)
