"""
Automated Multi-Agent Legal Intelligence Test Suite
Tests PrivacyAgent, IntakeAgent, ClassificationAgent, CaseAgent, EvidenceAgent, RiskUrgencyAgent, VerificationAgent, and LegalWorkflowEngine
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from src.agents.privacy import PrivacyAgent
from src.agents.intake import IntakeAgent
from src.agents.classification import ClassificationAgent
from src.agents.case import CaseAgent
from src.agents.evidence import EvidenceAgent
from src.agents.risk import RiskUrgencyAgent
from src.agents.verification import VerificationAgent
from src.graph.legal_workflow import legal_workflow
from src.schemas.case_schemas import StructuredCaseState

# 1. Privacy Agent Tests
def test_privacy_pii_redaction():
    text = "My name is Rajesh, Aadhaar 1234 5678 9012, PAN ABCDE1234F, card 4111 2222 3333 4444 and my otp is 987654"
    redacted, counts = PrivacyAgent.redact_pii(text)
    assert "[REDACTED_AADHAAR]" in redacted
    assert "[REDACTED_PAN]" in redacted
    assert "[REDACTED_CARD]" in redacted
    assert "[REDACTED_SECRET]" in redacted
    assert counts["aadhaar"] == 1
    assert counts["pan"] == 1

# 2. Intake Agent Tests (English, Hindi, Hinglish)
def test_intake_agent_english():
    story = "My employer withheld my salary of Rs 150000 for 3 months in Delhi. I have an employment contract."
    res = IntakeAgent.process_intake(story)
    assert res.detectedLanguage == "en"
    assert res.domain == "Employment & Labour Law"
    assert res.extractedFacts.get("disputedAmount") == 150000.0
    assert res.extractedFacts.get("hasAgreement") is True
    assert res.extractedFacts.get("location") == "Delhi"
    assert len(res.clarifyingQuestions) > 0

def test_intake_agent_hinglish():
    story = "Mere employer ne 3 mahine se salary nahi di, 75000 rupaye pending hai."
    res = IntakeAgent.process_intake(story)
    assert res.detectedLanguage in ["hinglish", "hi"]
    assert res.domain == "Employment & Labour Law"
    assert res.extractedFacts.get("disputedAmount") == 75000.0
    assert any("contract" in q.lower() or "offer letter" in q.lower() for q in res.clarifyingQuestions)

def test_intake_agent_hindi():
    story = "मकान मालिक ने 50000 रुपये का सिक्योरिटी डिपॉजिट वापस नहीं किया"
    res = IntakeAgent.process_intake(story)
    assert res.detectedLanguage == "hi"
    assert res.domain == "Landlord & Tenant / Rental Law"
    assert res.extractedFacts.get("disputedAmount") == 50000.0

# 3. Case Builder Agent Tests
def test_case_builder_non_destructive():
    intake1 = IntakeAgent.process_intake("Employer withheld 50000 salary in Delhi.")
    classif1 = ClassificationAgent.classify_case(intake1)
    case = CaseAgent.build_case_state(intake1, classif1)
    
    assert case.caseNumber.startswith("NS-")
    assert case.category == "Employment & Labour Law"
    assert "disputedAmount" in case.facts
    assert case.facts["disputedAmount"].value == 50000.0

    # Second turn with contract update
    intake2 = IntakeAgent.process_intake("Yes, I have an employment contract and appointment letter.")
    case_updated = CaseAgent.build_case_state(intake2, classif1, existing_case=case)
    
    # Original disputedAmount is preserved and hasAgreement is added
    assert case_updated.facts["disputedAmount"].value == 50000.0
    assert case_updated.facts["hasAgreement"].value is True
    assert len(case_updated.timeline) >= 1

# 4. Evidence Agent Tests
def test_evidence_agent_employment():
    intake = IntakeAgent.process_intake("Salary pending for 3 months, have employment contract and sent email to HR.")
    classif = ClassificationAgent.classify_case(intake)
    case = CaseAgent.build_case_state(intake, classif)
    
    checklist = EvidenceAgent.audit_evidence(case)
    assert len(checklist.available) >= 1
    assert any("Contract" in e.name for e in checklist.available)
    assert any("Salary Slips" in e.name or "Bank Account" in e.name for e in checklist.missing)

# 5. Risk & Urgency Agent Tests
def test_risk_urgency_general_guidance():
    intake = IntakeAgent.process_intake("Defective shoes bought online for 2000 rupees.")
    classif = ClassificationAgent.classify_case(intake)
    case = CaseAgent.build_case_state(intake, classif)
    
    urgency = RiskUrgencyAgent.evaluate_urgency(case)
    assert urgency.urgencyLevel == "GENERAL_GUIDANCE"
    assert urgency.colorCode == "GREEN"

def test_risk_urgency_cyber_fraud_red():
    intake = IntakeAgent.process_intake("Lost 80000 in online UPI phishing fraud after fake bank call")
    classif = ClassificationAgent.classify_case(intake)
    case = CaseAgent.build_case_state(intake, classif)
    
    urgency = RiskUrgencyAgent.evaluate_urgency(case)
    assert urgency.urgencyLevel == "URGENT_ASSISTANCE"
    assert urgency.colorCode == "RED"
    assert any("1930" in t for t in urgency.triggers)

def test_risk_urgency_pregnant_dismissal_red():
    intake = IntakeAgent.process_intake("Company terminated a pregnant employee in 6th month during maternity leave")
    classif = ClassificationAgent.classify_case(intake)
    case = CaseAgent.build_case_state(intake, classif)
    
    urgency = RiskUrgencyAgent.evaluate_urgency(case)
    assert urgency.urgencyLevel == "URGENT_ASSISTANCE"
    assert urgency.colorCode == "RED"

# 6. Verification Agent Tests
def test_verification_agent():
    verifier = VerificationAgent()
    intake = IntakeAgent.process_intake("Salary not paid for 3 months.")
    classif = ClassificationAgent.classify_case(intake)
    case = CaseAgent.build_case_state(intake, classif)
    
    mock_research = {
        "legalBasis": [
            {
                "act": "The Payment of Wages Act, 1936",
                "section": "Section 15",
                "sourceStatus": "Authoritative — Official Gazette / Statute",
                "authority": "Ministry of Labour and Employment"
            }
        ]
    }
    report = verifier.verify_response_and_case(case, mock_research)
    assert report.valid is True
    assert report.status == "APPROVED"
    assert report.groundingScore == 1.0

# 7. End-to-End Legal Workflow Execution
def test_end_to_end_legal_workflow():
    story = "My landlord cut my electricity and water supply and is refusing to return my 50000 security deposit in Delhi."
    output = legal_workflow.execute(story)
    
    assert output.case.caseNumber.startswith("NS-")
    assert output.case.category == "Landlord & Tenant / Rental Law"
    assert output.intake.domain == "Landlord & Tenant / Rental Law"
    assert output.urgency.urgencyLevel == "URGENT_ASSISTANCE"
    assert len(output.evidence.available) + len(output.evidence.missing) > 0
    assert len(output.actionPlan) >= 1
    assert output.verification.status == "APPROVED"
