#!/usr/bin/env python3
"""
Deploy statically built Next.js frontend to AWS S3 and invalidate CloudFront cache.
"""
import os
import sys
import time
import subprocess
import boto3

BUCKET = os.environ.get("FRONTEND_BUCKET", "trustvote-frontend-731732766290-us-west-2")
DISTRIBUTION_ID = os.environ.get("CLOUDFRONT_DISTRIBUTION_ID", "EA0UU59MKZAL8")
REGION = os.environ.get("AWS_REGION", "us-west-2")

REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FRONTEND_DIR = os.path.join(REPO_ROOT, "frontend")
APP_DIR = os.path.join(FRONTEND_DIR, ".next", "server", "app")
STATIC_DIR = os.path.join(FRONTEND_DIR, ".next", "static")

def run(cmd, cwd=None):
    print(f"--> {' '.join(cmd) if isinstance(cmd, list) else cmd}")
    subprocess.run(cmd, cwd=cwd, check=True, shell=isinstance(cmd, str))

def main():
    print("========================================")
    print(" TrustVote Frontend Deployment")
    print("========================================")
    
    # 1. Build frontend
    print("\n[1/4] Building Next.js application...")
    run(["npm", "run", "build"], cwd=FRONTEND_DIR)

    # 2. Sync static assets to S3
    print(f"\n[2/4] Syncing static assets to s3://{BUCKET}/_next/static/...")
    run(["aws", "s3", "sync", STATIC_DIR, f"s3://{BUCKET}/_next/static/", "--delete"])

    # 3. Upload pre-rendered HTML and RSC pages
    print(f"\n[3/4] Uploading pre-rendered pages to s3://{BUCKET}/...")
    
    # Root index.html
    run(["aws", "s3", "cp", f"{APP_DIR}/index.html", f"s3://{BUCKET}/index.html", "--content-type", "text/html"])
    run(["aws", "s3", "cp", f"{APP_DIR}/_not-found.html", f"s3://{BUCKET}/404.html", "--content-type", "text/html"])

    # Candidate pages
    candidates = ["marcus-vance", "elena-rostova", "david-chen"]
    for c in candidates:
        html_src = f"{APP_DIR}/candidate/{c}.html"
        rsc_src = f"{APP_DIR}/candidate/{c}.rsc"
        print(f"Uploading candidate {c}...")
        # Direct URL (no extension)
        run(["aws", "s3", "cp", html_src, f"s3://{BUCKET}/candidate/{c}", "--content-type", "text/html"])
        # Extension URL
        run(["aws", "s3", "cp", html_src, f"s3://{BUCKET}/candidate/{c}.html", "--content-type", "text/html"])
        # Directory index URL
        run(["aws", "s3", "cp", html_src, f"s3://{BUCKET}/candidate/{c}/index.html", "--content-type", "text/html"])
        # RSC flight data
        run(["aws", "s3", "cp", rsc_src, f"s3://{BUCKET}/candidate/{c}.rsc", "--content-type", "text/x-component"])

    # Measure pages
    measures = ["measure-101", "measure-102"]
    for m in measures:
        html_src = f"{APP_DIR}/measure/{m}.html"
        rsc_src = f"{APP_DIR}/measure/{m}.rsc"
        print(f"Uploading measure {m}...")
        run(["aws", "s3", "cp", html_src, f"s3://{BUCKET}/measure/{m}", "--content-type", "text/html"])
        run(["aws", "s3", "cp", html_src, f"s3://{BUCKET}/measure/{m}.html", "--content-type", "text/html"])
        run(["aws", "s3", "cp", html_src, f"s3://{BUCKET}/measure/{m}/index.html", "--content-type", "text/html"])
        run(["aws", "s3", "cp", rsc_src, f"s3://{BUCKET}/measure/{m}.rsc", "--content-type", "text/x-component"])

    # 4. Invalidate CloudFront
    print(f"\n[4/4] Creating CloudFront cache invalidation for {DISTRIBUTION_ID}...")
    cf = boto3.client("cloudfront", region_name=REGION)
    inval = cf.create_invalidation(
        DistributionId=DISTRIBUTION_ID,
        InvalidationBatch={
            "Paths": {
                "Quantity": 1,
                "Items": ["/*"]
            },
            "CallerReference": f"deploy-{int(time.time())}"
        }
    )
    inval_id = inval["Invalidation"]["Id"]
    print(f"Invalidation created: {inval_id}")
    print("\nDeployment complete! Live CDN: https://d1pflaowvgvxal.cloudfront.net")

if __name__ == "__main__":
    main()
