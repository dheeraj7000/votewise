#!/usr/bin/env python3
"""
TrustVote - Amazon Bedrock Knowledge Base Sync Tool
Uploads knowledge-base documents and metadata to an S3 bucket and starts an ingestion job.
"""

import os
import sys
import argparse
import mimetypes
import boto3
from botocore.exceptions import ClientError

def sync_documents(bucket_name: str, prefix: str = "documents/", region: str = "us-west-2"):
    s3_client = boto3.client("s3", region_name=region)
    doc_dir = os.path.join(os.path.dirname(__file__), "documents")
    
    if not os.path.exists(doc_dir):
        print(f"Error: Directory {doc_dir} not found.")
        sys.exit(1)

    print(f"[*] Syncing documents from {doc_dir} to s3://{bucket_name}/{prefix} ...")
    
    files = os.listdir(doc_dir)
    uploaded_count = 0
    for filename in sorted(files):
        filepath = os.path.join(doc_dir, filename)
        if not os.path.isfile(filepath):
            continue
        
        s3_key = f"{prefix.rstrip('/')}/{filename}"
        content_type = mimetypes.guess_type(filename)[0] or "text/plain"
        if filename.endswith(".json"):
            content_type = "application/json"
        
        try:
            with open(filepath, "rb") as f:
                s3_client.put_object(
                    Bucket=bucket_name,
                    Key=s3_key,
                    Body=f,
                    ContentType=content_type
                )
            print(f"  [+] Uploaded: {filename} -> s3://{bucket_name}/{s3_key}")
            uploaded_count += 1
        except ClientError as e:
            print(f"  [-] Failed to upload {filename}: {e}")
            
    print(f"[*] Successfully uploaded {uploaded_count} files to S3.")

def trigger_bedrock_ingestion(knowledge_base_id: str, data_source_id: str, region: str = "us-west-2"):
    bedrock_agent = boto3.client("bedrock-agent", region_name=region)
    print(f"[*] Triggering Bedrock Knowledge Base Ingestion Job for KB: {knowledge_base_id} ...")
    try:
        response = bedrock_agent.start_ingestion_job(
            knowledgeBaseId=knowledge_base_id,
            dataSourceId=data_source_id,
            description="TrustVote automated document sync"
        )
        job = response.get("ingestionJob", {})
        print(f"[+] Ingestion job started successfully!")
        print(f"    Job ID: {job.get('ingestionJobId')}")
        print(f"    Status: {job.get('status')}")
    except ClientError as e:
        print(f"[-] Failed to start ingestion job: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync TrustVote documents to S3 and Bedrock Knowledge Base")
    parser.add_argument("--bucket", required=True, help="Target S3 Bucket Name")
    parser.add_argument("--prefix", default="documents/", help="S3 Prefix / Folder")
    parser.add_argument("--region", default="us-west-2", help="AWS Region (default: us-west-2)")
    parser.add_argument("--kb-id", help="Bedrock Knowledge Base ID (optional)")
    parser.add_argument("--ds-id", help="Bedrock Data Source ID (optional)")
    
    args = parser.parse_args()
    sync_documents(args.bucket, args.prefix, args.region)
    
    if args.kb_id and args.ds_id:
        trigger_bedrock_ingestion(args.kb_id, args.ds_id, args.region)
