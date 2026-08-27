"""
Intake Agent
Parses citizen narratives across English, Hindi, and Hinglish, extracts facts, and identifies missing critical parameters
"""

import re
from typing import Dict, List, Any
from ..schemas.case_schemas import IntakeResult
from .privacy import PrivacyAgent
from ..domain_classifier import LegalDomainClassifier

class IntakeAgent:
    @staticmethod
    def detect_language(text: str) -> str:
        if not text:
            return "en"
        # Check Devanagari Unicode
        if re.search(r"[\u0900-\u097F]", text):
            return "hi"
        # Check Hinglish keywords
        hinglish_words = ["mera", "meri", "mere", "nahi", "diya", "hoga", "kya", "hai", "pe", "se", "aur", "kar", "liya", "rakha", "gaya", "naukri", "makan", "kiraya", "paisa", "rupaye"]
        words = text.lower().split()
        hinglish_matches = sum(1 for w in words if w in hinglish_words)
        if hinglish_matches >= 2:
            return "hinglish"
        return "en"

    @classmethod
    def process_intake(cls, user_narrative: str, existing_facts: Dict[str, Any] = None) -> IntakeResult:
        existing_facts = existing_facts or {}
        
        # 1. PII Redaction
        redacted_text, _ = PrivacyAgent.redact_pii(user_narrative)
        
        # 2. Language Detection
        lang = cls.detect_language(redacted_text)
        
        # 3. Domain Classification
        domain, _, _ = LegalDomainClassifier.classify_domain(redacted_text)

        # 4. Extract Structured Facts
        extracted = dict(existing_facts)
        extracted["narrative"] = redacted_text
        text_lower = redacted_text.lower()

        # Extract duration first (e.g. 3 months, teen mahine, 2 saal)
        month_match = re.search(r"([0-9]+|teen|char|paanch|do|ek|three|four|five|two|six)\s*(?:months?|mahine|saal|years?)", text_lower)
        if month_match and "duration" not in extracted:
            extracted["duration"] = month_match.group(0)

        # Extract amounts (e.g. Rs 50,000, 50000 rupaye, 1.5 lakh, or large numbers >= 500 not part of duration)
        amount_match = re.search(r"(?:rs\.?|inr|₹|amount of|deposit of|salary of)?\s*([0-9]+(?:,[0-9]+)*(?:\.[0-9]+)?)\s*(?:lakh|lac|k|crore|rupees|rupaye|रुपये)?", text_lower)
        
        # Explicit search for explicit currency patterns or 4+ digit numbers
        explicit_currency = re.search(r"(?:rs\.?|inr|₹)\s*([0-9]+(?:,[0-9]+)*)", text_lower) or \
                            re.search(r"([0-9]+(?:,[0-9]+)*)\s*(?:rupees|rupaye|रुपये|lakh|lac)", text_lower) or \
                            re.search(r"\b([1-9][0-9]{3,8})\b", text_lower)

        if explicit_currency and "disputedAmount" not in extracted:
            raw_val = explicit_currency.group(1).replace(",", "")
            val = float(raw_val)
            if "lakh" in text_lower or "lac" in text_lower:
                val = val * 100000
            extracted["disputedAmount"] = val
        elif amount_match and "disputedAmount" not in extracted:
            raw_val = amount_match.group(1).replace(",", "")
            val = float(raw_val)
            if val >= 500:
                if "lakh" in text_lower or "lac" in text_lower:
                    val = val * 100000
                extracted["disputedAmount"] = val

        # Extract location/state
        locations = ["delhi", "mumbai", "bengaluru", "bangalore", "hyderabad", "pune", "chennai", "noida", "gurugram", "gurgaon", "kolkata", "karnataka", "maharashtra", "uttar pradesh", "haryana", "rajasthan"]
        for loc in locations:
            if loc in text_lower and "location" not in extracted:
                extracted["location"] = loc.capitalize()

        # Extract specific legal cues
        if "contract" in text_lower or "agreement" in text_lower or "offer letter" in text_lower:
            extracted["hasAgreement"] = True
        if "hr" in text_lower or "email" in text_lower or "notice" in text_lower or "complaint" in text_lower:
            extracted["formalNoticeSent"] = True
        if "terminated" in text_lower or "fired" in text_lower or "resigned" in text_lower or "nikal diya" in text_lower:
            extracted["employmentStatus"] = "Terminated / Discharged"
        if "pregnant" in text_lower or "maternity" in text_lower:
            extracted["isMaternityIssue"] = True
        if "electricity" in text_lower or "water" in text_lower or "bijli" in text_lower or "pani" in text_lower:
            extracted["amenitiesDisrupted"] = True

        # Determine Issue
        issue = "General Legal Dispute"
        if "salary" in text_lower or "wages" in text_lower or "vetan" in text_lower or "tankhwah" in text_lower:
            issue = "Unpaid Salary / Delayed Wages"
        elif "security deposit" in text_lower or "deposit" in text_lower:
            issue = "Withholding Security Deposit"
        elif "upi" in text_lower or "fraud" in text_lower or "phishing" in text_lower or "otp" in text_lower:
            issue = "Online Financial Cyber Fraud"
        elif "defective" in text_lower or "refund" in text_lower or "fake" in text_lower or "counterfeit" in text_lower:
            issue = "Defective Product / Unfair Trade Practice"
        elif "evict" in text_lower or "lockout" in text_lower or "bijli" in text_lower:
            issue = "Arbitrary Eviction / Amenity Disconnection"

        # 5. Identify Missing Parameters & Generate Clarifying Questions
        missing_fields = []
        questions = []

        if domain == "Employment & Labour Law":
            if "hasAgreement" not in extracted:
                missing_fields.append("contract_availability")
                questions.append("Do you have an employment contract or official appointment letter?")
            if "duration" not in extracted:
                missing_fields.append("salary_duration")
                questions.append("For how many months has the salary been withheld?")
            if "disputedAmount" not in extracted:
                missing_fields.append("pending_amount")
                questions.append("What is the total approximate amount of pending salary?")
            if "formalNoticeSent" not in extracted:
                missing_fields.append("hr_communication")
                questions.append("Have you formally contacted HR or sent a written demand email?")
            if "location" not in extracted:
                missing_fields.append("work_location")
                questions.append("In which city or state were you employed?")

        elif domain == "Landlord & Tenant / Rental Law":
            if "hasAgreement" not in extracted:
                missing_fields.append("rent_agreement")
                questions.append("Do you have a registered or signed written rent agreement?")
            if "disputedAmount" not in extracted:
                missing_fields.append("deposit_amount")
                questions.append("What is the total security deposit amount paid?")
            if "formalNoticeSent" not in extracted:
                missing_fields.append("notice_to_quit")
                questions.append("Was any written 15-day notice given by either party?")
            if "location" not in extracted:
                missing_fields.append("property_location")
                questions.append("In which city is the rental property located?")

        elif domain == "Cybercrime & Data Privacy":
            if "disputedAmount" not in extracted:
                missing_fields.append("fraud_amount")
                questions.append("How much money was deducted or lost in the fraudulent transaction?")
            if "formalNoticeSent" not in extracted:
                missing_fields.append("1930_reporting")
                questions.append("Have you immediately dialed the 1930 Cyber Fraud Helpline or notified your bank to freeze the beneficiary account?")

        elif domain == "Consumer Protection Law":
            if "hasAgreement" not in extracted:
                missing_fields.append("purchase_invoice")
                questions.append("Do you possess the original purchase invoice or order receipt?")
            if "formalNoticeSent" not in extracted:
                missing_fields.append("grievance_raised")
                questions.append("Did you file a formal grievance with the seller or customer care?")

        # Fallback question if none missing
        if not questions:
            questions.append("Are there any additional documents or communication records you would like to mention?")

        return IntakeResult(
            extractedFacts=extracted,
            detectedLanguage=lang,
            domain=domain,
            issue=issue,
            missingFields=missing_fields,
            clarifyingQuestions=questions[:4],
            redactedText=redacted_text,
        )
