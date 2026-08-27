"""
Automated Legal Retrieval & RAG Test Suite
Tests Domain Detection, Exact Section Retrieval, Multilingual Queries, Citation Verification, and Grounding
"""

import os
import sys
import pytest

# Add ai-engine and root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from src.rag_service import LegalRAGService
from src.domain_classifier import LegalDomainClassifier
from src.query_expander import QueryExpander

@pytest.fixture(scope="module")
def rag():
    return LegalRAGService()

# 1. Domain Detection Tests
def test_domain_classification_english():
    domain, conf, _ = LegalDomainClassifier.classify_domain("My company withheld my monthly salary for 3 months")
    assert domain == "Employment & Labour Law"
    assert conf > 0.5

def test_domain_classification_hindi():
    domain, conf, _ = LegalDomainClassifier.classify_domain("मकान मालिक सिक्योरिटी डिपॉजिट वापस नहीं दे रहा")
    assert domain == "Landlord & Tenant / Rental Law"
    assert conf > 0.5

def test_domain_classification_hinglish():
    domain, conf, _ = LegalDomainClassifier.classify_domain("online fraud ho gaya otp leke paise kat gaye bank se")
    assert domain == "Cybercrime & Data Privacy"
    assert conf > 0.5

def test_domain_classification_consumer():
    domain, conf, _ = LegalDomainClassifier.classify_domain("Flipkart delivered a defective phone and refused refund warranty")
    assert domain == "Consumer Protection Law"
    assert conf > 0.5

# 2. Exact Section Retrieval Tests
def test_exact_section_retrieval_payment_of_wages(rag):
    res = rag.conduct_research("Section 15 Payment of Wages Act delayed salary claim")
    assert res["detectedDomain"] == "Employment & Labour Law"
    assert len(res["legalBasis"]) > 0
    top_provision = res["legalBasis"][0]
    assert "Section 15" in top_provision["provision"]
    assert top_provision["confidence"] == "HIGH"
    assert "Authority" in top_provision["actionableRemedy"]

def test_exact_section_retrieval_cybercrime(rag):
    res = rag.conduct_research("Section 66D IT Act cheating by personation online fraud")
    assert res["detectedDomain"] == "Cybercrime & Data Privacy"
    assert len(res["legalBasis"]) > 0
    top_provision = res["legalBasis"][0]
    assert "Section 66D" in top_provision["provision"]
    assert top_provision["sourceStatus"].startswith("Authoritative")

def test_exact_section_retrieval_consumer(rag):
    res = rag.conduct_research("Section 35 Consumer Protection Act 2019 e-daakhil filing")
    assert res["detectedDomain"] == "Consumer Protection Law"
    assert len(res["legalBasis"]) > 0
    provisions_text = " ".join(p["provision"] for p in res["legalBasis"])
    assert "Section 35" in provisions_text

def test_exact_section_retrieval_tenancy(rag):
    res = rag.conduct_research("Section 10 Model Tenancy Act security deposit limit 2 months")
    assert res["detectedDomain"] == "Landlord & Tenant / Rental Law"
    assert len(res["legalBasis"]) > 0
    top_provision = res["legalBasis"][0]
    assert "Section 10" in top_provision["provision"]

# 3. Natural Language & Multilingual RAG Retrieval Tests
def test_natural_language_employment_unpaid_salary(rag):
    res = rag.conduct_research("My employer has not paid my salary for three months.")
    assert res["detectedDomain"] == "Employment & Labour Law"
    assert len(res["legalBasis"]) >= 1
    assert any("Payment of Wages" in p["act"] for p in res["legalBasis"])
    assert len(res["actionableRemedies"]) >= 1
    assert res["confidence"] in ["HIGH", "MEDIUM"]

def test_natural_language_hindi_rental(rag):
    res = rag.conduct_research("मकान मालिक ने बिना नोटिस के घर से निकाल दिया और बिजली काट दी")
    assert res["detectedDomain"] == "Landlord & Tenant / Rental Law"
    assert len(res["legalBasis"]) >= 1
    assert any("Model Tenancy" in p["act"] or "Transfer of Property" in p["act"] for p in res["legalBasis"])

def test_natural_language_cyber_upi_fraud(rag):
    res = rag.conduct_research("Fraudulent UPI transaction of 50000 deducted from bank account after fake call")
    assert res["detectedDomain"] == "Cybercrime & Data Privacy"
    assert len(res["legalBasis"]) >= 1
    assert any("Information Technology" in p["act"] for p in res["legalBasis"])

# 4. Citation Verification Tests
def test_citation_verification_valid_statute(rag):
    verif = rag.verifier.verify_citation(
        act="The Payment of Wages Act, 1936",
        section="Section 15"
    )
    assert verif["valid"] is True
    assert verif["isAuthoritative"] is True
    assert verif["status"] == "AUTHORITATIVE_VERIFIED"

def test_citation_verification_bogus_section(rag):
    verif = rag.verifier.verify_citation(
        act="The Payment of Wages Act, 1936",
        section="Section 999"
    )
    assert verif["valid"] is False
    assert verif["isAuthoritative"] is False
    assert verif["status"] == "UNVERIFIED_OR_NOT_FOUND"

def test_citation_verification_consumer_act(rag):
    verif = rag.verifier.verify_citation(
        act="Consumer Protection Act, 2019",
        section="Section 2(11)"
    )
    assert verif["valid"] is True
    assert verif["isAuthoritative"] is True
