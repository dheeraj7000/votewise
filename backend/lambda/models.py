"""
Data models and type definitions for TrustVote Backend
"""

from typing import List, Optional, Dict, Any
from dataclasses import dataclass, field, asdict

@dataclass
class SourceItem:
    title: str
    url: str
    organization: Optional[str] = None
    tier: str = "Tier 1 - Government"
    publishedDate: Optional[str] = None
    excerpt: Optional[str] = None

@dataclass
class AskRequest:
    question: str
    candidateId: Optional[str] = None
    measureId: Optional[str] = None

@dataclass
class AskResponse:
    answer: str
    trustTier: str
    confidence: str  # "High", "Medium", "Insufficient Data"
    sources: List[Dict[str, Any]] = field(default_factory=list)
    verified: bool = True
    notice: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
