"""
Milestone 5 Test Suite: Voice Pipeline, AI Safety, Privacy Redaction & Grounding
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from src.services.safety_service import ai_safety_service
from src.agents.privacy import PrivacyAgent
from src.agents.intake import IntakeAgent
from src.schemas.case_schemas import StructuredCaseState

def test_ai_safety_service_disclaimer_and_pii():
    raw_response = "Here is your case summary. Aadhaar 1234 5678 9012 was mentioned in your claim."
    result = ai_safety_service.audit_and_sanitize_response(raw_response)
    
    assert "[REDACTED_AADHAAR]" in result["safeResponse"]
    assert result["piiSanitized"] is True
    assert "Legal Nexus is an AI-powered legal access" in result["safeResponse"]
    assert result["safetyStatus"] == "APPROVED"

def test_ai_safety_with_structured_case():
    case = StructuredCaseState(
        caseNumber="NS-20260827-SAFE",
        category="Employment & Labour Law",
        issue="Unpaid Wages",
        jurisdiction="Delhi"
    )
    raw_response = "Under Section 15 of Payment of Wages Act, your salary is recoverable."
    
    mock_research = {
        "legalBasis": [
            {
                "act": "The Payment of Wages Act, 1936",
                "section": "Section 15",
                "sourceStatus": "Authoritative — Official Gazette / Statute"
            }
        ]
    }

    result = ai_safety_service.audit_and_sanitize_response(
        raw_response=raw_response,
        case=case,
        research_result=mock_research
    )

    assert result["verification"]["valid"] is True
    assert result["urgency"]["urgencyLevel"] in ["GENERAL_GUIDANCE", "ATTENTION_RECOMMENDED", "URGENT_ASSISTANCE"]
    assert result["safetyStatus"] == "APPROVED"

def test_voice_transcription_language_detection():
    hindi_speech = "मकान मालिक ने मेरा सिक्योरिटी डिपॉजिट वापस नहीं किया"
    lang_hi = IntakeAgent.detect_language(hindi_speech)
    assert lang_hi == "hi"

    hinglish_speech = "Mere employer ne 3 mahine se salary nahi di, 75000 rupaye pending hai."
    lang_hinglish = IntakeAgent.detect_language(hinglish_speech)
    assert lang_hinglish in ["hinglish", "hi"]

    en_speech = "Landlord refused to return my security deposit in Delhi."
    lang_en = IntakeAgent.detect_language(en_speech)
    assert lang_en == "en"
