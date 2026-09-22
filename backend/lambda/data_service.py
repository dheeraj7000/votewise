"""
Data Service for TrustVote
Handles loading, querying, and filtering candidate profiles, ballot measures, and topics.
"""

import os
import json
import re
from typing import Dict, Any, List, Optional

CANDIDATES_PATH = os.path.join(os.path.dirname(__file__), "..", "candidate-json", "candidates.json")
MEASURES_PATH = os.path.join(os.path.dirname(__file__), "..", "candidate-json", "ballot-measures.json")
TOPICS_PATH = os.path.join(os.path.dirname(__file__), "..", "candidate-json", "topics.json")

class DataService:
    def __init__(self):
        self._candidates: List[Dict[str, Any]] = []
        self._measures: List[Dict[str, Any]] = []
        self._topics: List[Dict[str, Any]] = []
        self._load_data()

    def _load_data(self):
        # Load Candidates
        if os.path.exists(CANDIDATES_PATH):
            with open(CANDIDATES_PATH, "r", encoding="utf-8") as f:
                self._candidates = json.load(f)
        
        # Load Measures
        if os.path.exists(MEASURES_PATH):
            with open(MEASURES_PATH, "r", encoding="utf-8") as f:
                self._measures = json.load(f)

        # Load Topics
        if os.path.exists(TOPICS_PATH):
            with open(TOPICS_PATH, "r", encoding="utf-8") as f:
                self._topics = json.load(f)

    def get_candidate(self, candidate_id: str) -> Optional[Dict[str, Any]]:
        for c in self._candidates:
            if c.get("id") == candidate_id:
                return c
        return None

    def get_all_candidates(self) -> List[Dict[str, Any]]:
        return self._candidates

    def get_measure(self, measure_id: str) -> Optional[Dict[str, Any]]:
        for m in self._measures:
            if m.get("id") == measure_id:
                return m
        return None

    def get_all_measures(self) -> List[Dict[str, Any]]:
        return self._measures

    def get_all_topics(self) -> List[Dict[str, Any]]:
        return self._topics

    def search(self, query: str, category: Optional[str] = None) -> Dict[str, Any]:
        """
        Search across candidates, ballot measures, and topics.
        """
        query_clean = query.strip().lower() if query else ""
        if not query_clean:
            return {
                "candidates": self._candidates,
                "measures": self._measures,
                "topics": self._topics
            }

        matched_candidates = []
        matched_measures = []
        matched_topics = []

        tokens = re.split(r"\s+", query_clean)

        # Candidates search
        for c in self._candidates:
            c_text = f"{c.get('name', '')} {c.get('office', '')} {c.get('party', '')} {c.get('biography', {}).get('summary', '')}".lower()
            # Also search through statements and actions
            statements = " ".join([s.get("statement", "") + " " + s.get("topic", "") for s in c.get("officialStatements", [])]).lower()
            c_text += " " + statements
            if any(token in c_text for token in tokens):
                matched_candidates.append({
                    "id": c.get("id"),
                    "name": c.get("name"),
                    "office": c.get("office"),
                    "party": c.get("party"),
                    "officialPhoto": c.get("officialPhoto"),
                    "verificationLevel": c.get("verificationLevel"),
                    "trustTier": c.get("trustTier"),
                    "type": "candidate"
                })

        # Measures search
        for m in self._measures:
            m_text = f"{m.get('number', '')} {m.get('title', '')} {m.get('jurisdiction', '')} {m.get('summary', '')}".lower()
            if any(token in m_text for token in tokens):
                matched_measures.append({
                    "id": m.get("id"),
                    "number": m.get("number"),
                    "title": m.get("title"),
                    "jurisdiction": m.get("jurisdiction"),
                    "verificationLevel": m.get("verificationLevel"),
                    "trustTier": m.get("trustTier"),
                    "type": "measure"
                })

        # Topics search
        for t in self._topics:
            t_text = f"{t.get('name', '')} {t.get('description', '')}".lower()
            if any(token in t_text for token in tokens):
                matched_topics.append({
                    "id": t.get("id"),
                    "name": t.get("name"),
                    "description": t.get("description"),
                    "type": "topic"
                })

        return {
            "query": query,
            "candidates": matched_candidates,
            "measures": matched_measures,
            "topics": matched_topics,
            "totalResults": len(matched_candidates) + len(matched_measures) + len(matched_topics)
        }

# Global singleton
data_service = DataService()
