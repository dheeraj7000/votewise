"""
AWS Lambda Handler for TrustVote API
Handles API Gateway HTTP/REST proxy events for:
- GET /search
- GET /candidate/{id}
- GET /measure/{id}
- GET /topics
- POST /ask
"""

import json
import os
from typing import Dict, Any

from data_service import data_service
from bedrock_service import bedrock_service

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Amz-Date, Authorization, X-Api-Key, X-Amz-Security-Token",
    "Content-Type": "application/json"
}

def make_response(status_code: int, body: Any) -> Dict[str, Any]:
    return {
        "statusCode": status_code,
        "headers": CORS_HEADERS,
        "body": json.dumps(body) if not isinstance(body, str) else body
    }

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Main Lambda entry point for API Gateway
    Supports both API Gateway HTTP API v2 (event['rawPath']) and REST API v1 (event['path'])
    """
    http_method = event.get("httpMethod") or event.get("requestContext", {}).get("http", {}).get("method", "GET")
    raw_path = event.get("rawPath") or event.get("path") or "/"
    
    # Handle CORS preflight
    if http_method == "OPTIONS":
        return make_response(200, {"status": "ok"})

    # Extract query params
    query_params = event.get("queryStringParameters") or {}

    try:
        # Route: GET /search
        if raw_path.startswith("/search") and http_method == "GET":
            q = query_params.get("q", "")
            category = query_params.get("category")
            results = data_service.search(query=q, category=category)
            return make_response(200, results)

        # Route: GET /candidate/{id}
        if raw_path.startswith("/candidate/") and http_method == "GET":
            candidate_id = raw_path.split("/candidate/")[-1].strip("/")
            candidate = data_service.get_candidate(candidate_id)
            if not candidate:
                return make_response(404, {"error": "Candidate not found", "id": candidate_id})
            return make_response(200, candidate)

        # Route: GET /candidates
        if raw_path == "/candidates" and http_method == "GET":
            return make_response(200, data_service.get_all_candidates())

        # Route: GET /measure/{id}
        if raw_path.startswith("/measure/") and http_method == "GET":
            measure_id = raw_path.split("/measure/")[-1].strip("/")
            measure = data_service.get_measure(measure_id)
            if not measure:
                return make_response(404, {"error": "Ballot measure not found", "id": measure_id})
            return make_response(200, measure)

        # Route: GET /measures
        if raw_path == "/measures" and http_method == "GET":
            return make_response(200, data_service.get_all_measures())

        # Route: GET /topics
        if raw_path.startswith("/topics") and http_method == "GET":
            return make_response(200, data_service.get_all_topics())

        # Route: POST /ask
        if raw_path.startswith("/ask") and http_method == "POST":
            body_raw = event.get("body", "{}")
            if event.get("isBase64Encoded", False):
                import base64
                body_raw = base64.b64decode(body_raw).decode("utf-8")
            
            try:
                body = json.loads(body_raw) if isinstance(body_raw, str) else body_raw
            except Exception:
                body = {}

            question = body.get("question", "")
            candidate_id = body.get("candidateId")
            
            rag_result = bedrock_service.ask(question=question, candidate_id=candidate_id)
            return make_response(200, rag_result.to_dict())

        # Health check
        if raw_path in ["/", "/health"]:
            return make_response(200, {
                "service": "TrustVote API",
                "status": "healthy",
                "version": "1.0.0",
                "verificationModel": "Tier 1 Government / Tier 2 Fact Check / Tier 3 Consensus"
            })

        return make_response(404, {"error": "Not Found", "path": raw_path})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return make_response(500, {"error": "Internal Server Error", "message": str(e)})

if __name__ == "__main__":
    # Test locally
    print("[*] Testing local lambda handler...")
    res = lambda_handler({"httpMethod": "GET", "rawPath": "/search", "queryStringParameters": {"q": "vance"}}, None)
    print("Search status:", res["statusCode"])
    
    ask_res = lambda_handler({
        "httpMethod": "POST",
        "rawPath": "/ask",
        "body": json.dumps({"question": "Has Marcus Vance sponsored bills on microelectronics?", "candidateId": "marcus-vance"})
    }, None)
    print("Ask response:", ask_res["statusCode"], ask_res["body"][:120])
