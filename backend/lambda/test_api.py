"""
Unit and integration tests for TrustVote Lambda API
Tests:
- Search candidates, measures, topics
- Retrieve candidate details
- Verified grounded QA
- Refusal behavior when information is not verified
- CORS and HTTP status codes
"""

import unittest
import json
import sys
import os

# Ensure backend/lambda directory is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from handler import lambda_handler
from bedrock_service import DEFAULT_REFUSAL

class TestTrustVoteAPI(unittest.TestCase):
    def test_search_endpoint(self):
        event = {
            "httpMethod": "GET",
            "rawPath": "/search",
            "queryStringParameters": {"q": "vance"}
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertIn("candidates", body)
        self.assertTrue(any(c["id"] == "marcus-vance" for c in body["candidates"]))

    def test_get_candidate(self):
        event = {
            "httpMethod": "GET",
            "rawPath": "/candidate/marcus-vance"
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertEqual(body["name"], "Marcus Vance")
        self.assertEqual(body["verificationLevel"], "Government Verified")
        self.assertIn("biography", body)
        self.assertIn("officialStatements", body)

    def test_get_candidate_not_found(self):
        event = {
            "httpMethod": "GET",
            "rawPath": "/candidate/non-existent-person"
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 404)

    def test_get_ballot_measure(self):
        event = {
            "httpMethod": "GET",
            "rawPath": "/measure/measure-101"
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertEqual(body["id"], "measure-101")
        self.assertIn("fiscalImpact", body)

    def test_ask_verified_question(self):
        event = {
            "httpMethod": "POST",
            "rawPath": "/ask",
            "body": json.dumps({
                "question": "What bills has Marcus Vance sponsored on microelectronics?",
                "candidateId": "marcus-vance"
            })
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertTrue(body["verified"])
        self.assertEqual(body["confidence"], "High")
        self.assertGreaterEqual(len(body["sources"]), 1)
        self.assertIn("S. 2714", body["answer"] + body["sources"][0]["excerpt"])

    def test_ask_refusal_on_unverified_topic(self):
        event = {
            "httpMethod": "POST",
            "rawPath": "/ask",
            "body": json.dumps({
                "question": "What is Marcus Vance's favorite ice cream and crypto token?",
                "candidateId": "marcus-vance"
            })
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertFalse(body["verified"])
        self.assertEqual(body["confidence"], "Insufficient Data")
        self.assertIn("I don't have enough verified information to answer this question", body["answer"])
        self.assertEqual(len(body["sources"]), 0)

    def test_elections_endpoint(self):
        event = {
            "httpMethod": "GET",
            "rawPath": "/elections"
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertIn("elections", body)
        self.assertIn("Democracy Works", body["source"])
        self.assertGreaterEqual(body["totalElections"], 1)

    def test_elections_state_filter(self):
        event = {
            "httpMethod": "GET",
            "rawPath": "/elections",
            "queryStringParameters": {"state": "WA"}
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertEqual(len(body["elections"]), 1)
        self.assertEqual(body["elections"][0]["state"], "WA")
        self.assertIn("registrationDeadlines", body["elections"][0])

    def test_authorities_endpoint(self):
        event = {
            "httpMethod": "GET",
            "rawPath": "/authorities",
            "queryStringParameters": {"state": "WA"}
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertIn("authorities", body)
        self.assertEqual(len(body["authorities"]), 1)
        self.assertEqual(body["authorities"][0]["state"], "WA")
        self.assertIn("portalUrls", body["authorities"][0])

    def test_ballot_endpoint_seattle(self):
        event = {
            "httpMethod": "GET",
            "rawPath": "/ballot",
            "queryStringParameters": {"address": "400 Pine St, Seattle, WA 98101"}
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertEqual(body["jurisdiction"]["state"], "WA")
        self.assertEqual(body["jurisdiction"]["municipality"], "City of Seattle")
        self.assertGreaterEqual(len(body["contests"]), 3)
        self.assertGreaterEqual(len(body["measures"]), 2)
        self.assertIn("dropBox", body)
        self.assertIn("privacyNotice", body)

    def test_ballot_endpoint_nj(self):
        event = {
            "httpMethod": "POST",
            "rawPath": "/ballot",
            "body": json.dumps({"address": "280 Grove St, Jersey City, NJ 07302"})
        }
        res = lambda_handler(event, None)
        self.assertEqual(res["statusCode"], 200)
        body = json.loads(res["body"])
        self.assertEqual(body["jurisdiction"]["state"], "NJ")
        self.assertIn("Hudson County", body["jurisdiction"]["county"])
        self.assertGreaterEqual(len(body["contests"]), 1)
        self.assertIn("dropBox", body)

if __name__ == "__main__":
    unittest.main()
