# TrustVote Trust Model & Verification Framework

TrustVote operates on the principle that voters need **verifiable, direct-source civic facts** rather than subjective commentary or opaque scoring algorithms.

---

## 1. No Numeric Scores Policy

TrustVote explicitly rejects "trust scores," "credibility ratings," or algorithmic percentages (e.g., "87% credible"). Numerical scores give a false impression of mathematical precision to inherently qualitative civic judgments.

Instead, every piece of information displays **verification levels and source tiers**.

---

## 2. Source Verification Tiers

| Tier | Category | Definition & Criteria | Example Sources |
| :--- | :--- | :--- | :--- |
| **Tier 1** | **Government & Official** | Direct legal records, government depository records, certified election rolls, statutory filings, and legislative votes. | `Congress.gov`, `Senate.gov`, `FEC.gov`, `PDC.wa.gov`, `SOS.wa.gov`, `Courts.gov` |
| **Tier 2** | **Verified Fact-Check** | Nonpartisan investigative organizations complying with the International Fact-Checking Network (IFCN) Code of Principles. | `FactCheck.org`, `PolitiFact`, `Ballotpedia Verified Dossiers` |
| **Tier 3** | **Consensus & Institutional** | Accredited academic alumni registries, peer-reviewed institutional rosters, bar associations, and state licensing boards. | University registrar archives, American Institute of Architects, State Bar Association |

---

## 3. Mandatory Metadata Attributes

Every document indexed in the Amazon Bedrock Knowledge Base and displayed in the frontend dashboard carries strict metadata:

```json
{
  "metadataAttributes": {
    "candidateId": "marcus-vance",
    "candidateName": "Marcus Vance",
    "tier": "Tier 1 - Government",
    "documentType": "Legislative Record",
    "source": "U.S. Senate & Congress.gov",
    "url": "https://www.congress.gov/member/marcus-vance",
    "publishedDate": "2026-09-15",
    "verificationLevel": "Government Verified"
  }
}
```

---

## 4. The Refusal Guarantee

The AI side-panel assistant enforces strict zero-hallucination guardrails:

1. **Retrieved-Only Context**: The LLM prompt template only ingests passages retrieved from the verified document collection.
2. **Missing Information Refusal**: If a question refers to personal gossip, unverified leaks, non-public matters, or topics absent from the corpus, the model returns:
   > *"I don't have enough verified information to answer this question. Please consult official government election resources at your state election office."*
3. **No Speculation**: The model will not project future outcomes, endorse candidates, or summarize unofficial hearsay.
