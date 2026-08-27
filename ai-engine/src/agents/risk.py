"""
Legal Urgency & Attention Indicator Agent
Classifies situations into General Guidance (Green), Attention Recommended (Yellow), and Urgent Assistance (Red)
"""

from typing import Dict, Any, List
from ..schemas.case_schemas import UrgencyAssessment, StructuredCaseState

class RiskUrgencyAgent:
    @classmethod
    def evaluate_urgency(cls, case: StructuredCaseState) -> UrgencyAssessment:
        facts = case.facts
        domain = case.category
        issue = case.issue

        triggers = []
        score = 0.2
        level = "GENERAL_GUIDANCE"
        color = "GREEN"
        recommendation = "Standard legal dispute process; no emergency trigger detected."

        # Extract text context
        narrative_str = str(facts.get("narrative").value if facts.get("narrative") else "").lower()
        is_maternity = bool(facts.get("isMaternityIssue") and facts.get("isMaternityIssue").value) or "pregnant" in narrative_str or "maternity" in narrative_str
        is_amenity = bool(facts.get("amenitiesDisrupted") and facts.get("amenitiesDisrupted").value) or "electricity" in narrative_str or "bijli" in narrative_str or "lockout" in narrative_str

        # Red Triggers (Urgent Assistance)
        if "Cyber" in domain or "Fraud" in issue:
            triggers.append("Active financial cyber fraud: 'Golden Hour' 1930 reporting window is critical to freeze beneficiary accounts.")
            score = 0.95
            level = "URGENT_ASSISTANCE"
            color = "RED"
            recommendation = "URGENT: Immediately dial 1930 and notify your bank to place a lien on fraudulent beneficiary accounts."

        elif is_maternity:
            triggers.append("Unlawful termination during pregnancy / maternity leave violates Section 12 Maternity Benefit Act.")
            score = 0.90
            level = "URGENT_ASSISTANCE"
            color = "RED"
            recommendation = "URGENT: Issue immediate legal notice for reinstatement and file complaint before Chief Labour Commissioner."

        elif is_amenity:
            triggers.append("Illegal cutting off of essential services (electricity/water) or arbitrary physical lockout violates Section 14 Model Tenancy Act.")
            score = 0.88
            level = "URGENT_ASSISTANCE"
            color = "RED"
            recommendation = "URGENT: File an emergency interim petition before the Rent Authority and register a local police station diary entry."

        # Yellow Triggers (Attention Recommended)
        elif case.financialDetails.get("disputedAmount", 0) > 100000:
            triggers.append("Significant financial stake (> INR 1,00,000) under dispute.")
            score = 0.65
            level = "ATTENTION_RECOMMENDED"
            color = "YELLOW"
            recommendation = "ATTENTION: Issue a formal 15-day statutory demand notice before approaching the appropriate tribunal."

        elif "Terminated" in str(facts.get("employmentStatus", "")) or "deposit" in issue.lower():
            triggers.append("Termination without clear severance pay or withheld security deposit.")
            score = 0.60
            level = "ATTENTION_RECOMMENDED"
            color = "YELLOW"
            recommendation = "ATTENTION: Collate payment records and prepare pre-litigation grievance."

        return UrgencyAssessment(
            urgencyLevel=level,
            score=round(score, 2),
            triggers=triggers,
            recommendation=recommendation,
            colorCode=color
        )
