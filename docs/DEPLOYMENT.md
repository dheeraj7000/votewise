# TrustVote AWS Deployment & Operations Guide

This guide details the complete deployment process for TrustVote across AWS Serverless, Amazon Bedrock Knowledge Bases, and AWS Amplify / CloudFront.

---

## Architecture Requirements Summary

* **No EC2, No ECS, No Docker runtime** required for production.
* **Backend**: AWS Lambda (Python 3.12) + API Gateway HTTP API.
* **Storage**: Amazon S3 (documents + metadata) + Amazon DynamoDB.
* **RAG**: Amazon Bedrock (Anthropic Claude 3.5 Sonnet) + Amazon OpenSearch Serverless vector collection.
* **Frontend**: Next.js 15 deployed on AWS Amplify Hosting or CloudFront.

---

## 1. Prerequisites

Verify your local environment has the required toolchains:

```bash
# Verify AWS credentials
aws sts get-caller-identity

# Verify Node.js and Python
node -v      # v20.x or later
python3 --version  # 3.12 or later
```

---

## 2. Deploy Infrastructure & Lambda Backend (AWS SAM)

From the project root:

```bash
cd infra

# Build SAM application
sam build

# Deploy to AWS (guided prompt will configure parameters)
sam deploy --guided \
  --stack-name trustvote-stack \
  --capabilities CAPABILITY_IAM \
  --region us-west-2
```

Save the generated outputs:
- `ApiEndpoint`: e.g. `https://xyz123.execute-api.us-west-2.amazonaws.com/dev`
- `DocumentsBucketName`: e.g. `trustvote-verified-documents-731732766290-dev`

---

## 3. Seed Knowledge Base Documents & Trigger Sync

Upload verified candidate and ballot measure records to the S3 bucket:

```bash
cd backend/knowledge-base

python3 sync_to_s3.py \
  --bucket trustvote-verified-documents-731732766290-dev \
  --prefix documents/ \
  --region us-west-2
```

If you have provisioned an Amazon Bedrock Knowledge Base ID:

```bash
python3 sync_to_s3.py \
  --bucket trustvote-verified-documents-731732766290-dev \
  --kb-id <BEDROCK_KB_ID> \
  --ds-id <BEDROCK_DATA_SOURCE_ID> \
  --region us-west-2
```

---

## 4. Frontend Deployment (AWS Amplify or CloudFront)

### Option A: AWS Amplify Hosting (Recommended for Next.js 15)
1. In the AWS Amplify Console, click **Host web app**.
2. Select your repository (`dheeraj7000/votewise`).
3. Set base directory to `frontend/`.
4. Configure environment variable:
   - `NEXT_PUBLIC_API_URL`: Your API Gateway endpoint URL (e.g. `https://xyz123.execute-api.us-west-2.amazonaws.com/dev`)
5. Deploy. Amplify automatically provides HTTPS and a global CloudFront CDN distribution.

### Option B: CloudFront + S3 Static Export
```bash
cd frontend
export NEXT_PUBLIC_API_URL="https://xyz123.execute-api.us-west-2.amazonaws.com/dev"
npm run build
aws s3 sync out/ s3://<FRONTEND_S3_BUCKET> --delete
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```

---

## 5. Local Development & Testing

You can run and test both the backend and frontend locally without deploying to AWS:

### Run Backend Unit Tests:
```bash
python3 -m unittest backend/lambda/test_api.py
```

### Run Frontend in Development:
```bash
cd frontend
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to explore the interactive dashboard.

---

## 6. Current Live AWS Deployment Details

The system is deployed and operating live in AWS Region `us-west-2`:

| Component | AWS Resource | Endpoint / Identifier |
| :--- | :--- | :--- |
| **API Gateway HTTP API** | `TrustVoteHttpApi` | `https://hm02wlb4x4.execute-api.us-west-2.amazonaws.com/dev` |
| **Backend Lambda Router** | `TrustVoteApiFunction` (Python 3.12) | `trustvote-stack-TrustVoteApiFunction-...` |
| **DynamoDB Profiles** | `TrustVote-Profiles-dev` | `arn:aws:dynamodb:us-west-2:731732766290:table/TrustVote-Profiles-dev` |
| **Verified Documents Lake** | Amazon S3 Bucket | `s3://trustvote-verified-documents-731732766290-dev` |
| **Frontend Web Hosting** | Amazon S3 Static Website | `http://trustvote-frontend-731732766290-us-west-2.s3-website-us-west-2.amazonaws.com` |
| **Edge CDN** | Amazon CloudFront | `https://d1pflaowvgvxal.cloudfront.net` (Dist ID: `EA0UU59MKZAL8`) |
| **AWS Amplify App** | Amplify Web Hosting | `d1rrdkuz7ltlxo` (`d1rrdkuz7ltlxo.amplifyapp.com`) |
| **Democracy Works API** | Elections & Authority Service | Integrated with live API endpoints at `/elections` and `/authorities` |

