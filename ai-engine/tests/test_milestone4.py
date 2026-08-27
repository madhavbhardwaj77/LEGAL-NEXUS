"""
Milestone 4 Test Suite: Document Intelligence, Smart Drafting & Lawyer Matching
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from src.document.ocr_engine import OCREngine
from src.document.document_classifier import DocumentClassifier
from src.document.entity_extractor import EntityExtractor
from src.document.clause_segmenter import ClauseSegmenter
from src.document.document_analyzer import document_analyzer
from src.drafting.draft_generator import DraftGenerator
from src.drafting.draft_fact_checker import draft_fact_checker
from src.matching.matcher import LawyerMatcher

# 1. OCR & Layout Tests
def test_ocr_layout_extraction():
    sample_doc = "--- Page 1 ---\nEmployment Agreement\nBetween Acme Corp and John Doe.\n--- Page 2 ---\nClause 1: Salary INR 1,50,000 per month."
    result = OCREngine.extract_text_and_layout(sample_doc)
    assert result["pageCount"] == 2
    assert len(result["pages"]) == 2
    assert "John Doe" in result["fullText"]

# 2. Document Classifier Tests
def test_document_classification():
    emp_doc = "EMPLOYMENT AGREEMENT between Tech Services Pvt Ltd and Rahul Kumar. CTC INR 12,00,000 per annum with probation period."
    rent_doc = "RENT AGREEMENT between Landlord Ramesh and Tenant Suresh for demised premises at monthly rent of Rs 25,000 with security deposit."
    notice_doc = "LEGAL NOTICE under Section 15 of Payment of Wages Act. You are called upon to pay pending salary."

    res_emp = DocumentClassifier.classify_document(emp_doc)
    assert res_emp["documentType"] == "employment_agreement"
    assert res_emp["confidence"] >= 0.70

    res_rent = DocumentClassifier.classify_document(rent_doc)
    assert res_rent["documentType"] == "rental_agreement"

    res_notice = DocumentClassifier.classify_document(notice_doc)
    assert res_notice["documentType"] == "legal_notice"

# 3. Entity Extractor Tests
def test_entity_extraction():
    text = "This Employment Agreement is entered into on 15-January-2024 between Apex Softwares Ltd (Employer) and Priya Singh (Employee). Salary is Rs 85,000 per month with 30 days notice in Delhi."
    entities = EntityExtractor.extract_entities(text)
    
    assert "Delhi" in str(entities["jurisdiction"])
    assert any("30" in str(n) for n in entities["noticePeriods"])
    assert len(entities["monetaryAmounts"]) > 0

# 4. Clause Segmentation & Attention Analysis
def test_clause_segmentation_with_attention():
    sample_contract = """
    1. TERMINATION: The Company may terminate the employee immediately without notice or severance for any reason.
    2. NON-COMPETE: The employee shall not engage in any competing business for 2 years anywhere in India post-termination.
    3. CONFIDENTIALITY: Both parties agree to protect proprietary data and trade secrets.
    """
    clauses = ClauseSegmenter.segment_clauses(sample_contract)
    assert len(clauses) >= 3

    # Check non-compete attention trigger under Section 27 Contract Act
    non_compete = next((c for c in clauses if c["clauseType"] == "NON_COMPETE"), None)
    assert non_compete is not None
    assert non_compete["requiresAttention"] is True
    assert "Section 27" in non_compete["attentionAssessment"]

# 5. Full Document Intelligence Pipeline
def test_document_analyzer_pipeline():
    doc_text = """
    RENT AGREEMENT
    Between Shri Anil Verma (Landlord) and Ms. Pooja Sharma (Tenant).
    Premises: Flat 402, Saket, Delhi.
    Monthly Rent: Rs 30,000. Security Deposit: Rs 90,000.
    1. Notice Period: 30 days written notice to vacate.
    2. Deposit Refund: Landlord shall refund deposit upon handover.
    """
    analysis = document_analyzer.analyze_document(doc_text, filename="rent_agreement_delhi.txt")
    assert analysis["classification"]["documentType"] == "rental_agreement"
    assert len(analysis["clauses"]) >= 1
    assert "status" in analysis and analysis["status"] == "COMPLETED"

# 6. Draft Generator Tests (7 standard types)
def test_draft_generator_all_types():
    mock_case = {
        "caseNumber": "NS-20260827-TEST",
        "category": "Employment & Labour Law",
        "issue": "Unpaid Salary",
        "jurisdiction": "Delhi",
        "parties": {"plaintiff": "Aarav Sharma", "employer": "Tech Global Ltd"},
        "financialDetails": {"disputedAmount": 150000.0}
    }

    draft_types = [
        "STATUTORY_LEGAL_NOTICE",
        "CONSUMER_FORUM_COMPLAINT",
        "EMPLOYER_WAGE_GRIEVANCE",
        "LANDLORD_SECURITY_DEPOSIT_NOTICE",
        "POLICE_CYBER_CRIME_COMPLAINT",
        "RTI_APPLICATION",
        "LEGAL_INFORMATION_SUMMARY"
    ]

    for dtype in draft_types:
        draft = DraftGenerator.generate_draft(dtype, mock_case)
        assert draft["contentMarkdown"] is not None
        assert "AI-generated draft" in draft["disclaimer"]
        assert "Aarav Sharma" in draft["contentMarkdown"]

# 7. Draft Fact Checker Tests
def test_draft_fact_checker():
    mock_case = {
        "caseNumber": "NS-20260827-TEST",
        "jurisdiction": "Delhi",
        "financialDetails": {"disputedAmount": 150000.0}
    }
    valid_draft = "Demanding payment of INR 150,000.00 under Section 15 of Payment of Wages Act at Delhi."
    verification = draft_fact_checker.verify_draft(valid_draft, mock_case)
    
    assert verification["valid"] is True
    assert verification["status"] == "APPROVED"
    assert verification["groundingScore"] >= 0.85

# 8. Lawyer Matching Engine Tests
def test_lawyer_matching_algorithm():
    mock_case = {
        "category": "Employment & Labour Law",
        "issue": "Delayed Salary",
        "jurisdiction": "Delhi",
        "language": "Hindi",
        "financialDetails": {"disputedAmount": 150000.0}
    }

    lawyers = [
        {
            "id": "lawyer_1",
            "fullName": "Adv. Neha Kapoor",
            "practiceAreas": ["Employment & Labour Law", "Corporate"],
            "experienceYears": 8,
            "location": {"city": "Delhi", "state": "Delhi"},
            "languages": ["Hindi", "English"],
            "proBonoAvailable": True,
            "isAvailable": True,
            "verificationStatus": "VERIFIED"
        },
        {
            "id": "lawyer_2",
            "fullName": "Adv. Vikram Rao",
            "practiceAreas": ["Cybercrime", "Criminal"],
            "experienceYears": 3,
            "location": {"city": "Bengaluru", "state": "Karnataka"},
            "languages": ["Kannada", "English"],
            "proBonoAvailable": False,
            "isAvailable": False,
            "verificationStatus": "PENDING"
        }
    ]

    results = LawyerMatcher.match_lawyers(lawyers, mock_case)
    assert len(results) == 2
    
    top_match = results[0]
    assert top_match["fullName"] == "Adv. Neha Kapoor"
    assert top_match["matchScore"] == 100.0  # Perfect score across all 6 weighted categories
    assert top_match["isVerified"] is True
    assert len(top_match["explanationBreakdown"]) == 6
