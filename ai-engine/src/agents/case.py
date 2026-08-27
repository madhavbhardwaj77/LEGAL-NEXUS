"""
Case Builder / Case Agent
Maintains structured case state with non-destructive fact merging and timeline extraction
"""

import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List
from ..schemas.case_schemas import StructuredCaseState, FactItem, PartyInfo, TimelineItem, IntakeResult

class CaseAgent:
    @classmethod
    def build_case_state(
        cls,
        intake_result: IntakeResult,
        classification: Dict[str, Any],
        existing_case: StructuredCaseState = None
    ) -> StructuredCaseState:
        now_dt = datetime.now(timezone.utc)
        now_str = now_dt.isoformat()
        
        # Start from existing case or initialize new
        case = existing_case or StructuredCaseState(
            caseNumber=f"NS-{now_dt.strftime('%Y%m%d')}-{str(uuid.uuid4())[:4].upper()}",
            category=classification["domain"],
            issue=classification["issue"],
            jurisdiction=classification["jurisdiction"],
            status="DRAFT"
        )

        # 1. Non-destructive Fact Merging
        current_facts = dict(case.facts)
        new_facts = intake_result.extractedFacts

        for k, v in new_facts.items():
            if k not in current_facts:
                current_facts[k] = FactItem(
                    field=k,
                    value=v,
                    source="CITIZEN_NARRATIVE",
                    timestamp=now_str,
                    confidence=0.92
                )
            else:
                # Update if new value has equal or higher confidence
                existing_fact = current_facts[k]
                if existing_fact.value != v:
                    current_facts[k] = FactItem(
                        field=k,
                        value=v,
                        source="CITIZEN_UPDATE",
                        timestamp=now_str,
                        confidence=0.95
                    )

        case.facts = current_facts
        case.category = classification["domain"]
        case.issue = classification["issue"]
        case.jurisdiction = classification["jurisdiction"]
        case.missingInformation = classification.get("missingInformation", [])

        # 2. Extract Parties
        parties = PartyInfo(location=new_facts.get("location"))
        if classification["domain"] == "Employment & Labour Law":
            parties.employer = new_facts.get("employerName", "Employer / Company")
            parties.plaintiff = "Employee / Workman"
        elif classification["domain"] == "Landlord & Tenant / Rental Law":
            parties.landlord = new_facts.get("landlordName", "Landlord / Property Owner")
            parties.plaintiff = "Tenant"
        elif classification["domain"] == "Consumer Protection Law":
            parties.merchant = new_facts.get("merchantName", "Seller / E-Commerce Platform")
            parties.plaintiff = "Consumer"
        case.parties = parties

        # 3. Financial Details
        if "disputedAmount" in new_facts:
            case.financialDetails = {
                "disputedAmount": new_facts["disputedAmount"],
                "currency": "INR",
                "claimType": classification["issue"]
            }

        # 4. Generate Chronological Timeline Milestones
        timeline = []
        timeline.append(TimelineItem(
            eventType="INCIDENT_OCCURRED",
            title=f"Dispute Arisen: {classification['issue']}",
            date=now_dt.strftime("%Y-%m-%d"),
            description=f"Citizen reported: {intake_result.redactedText[:140]}..."
        ))

        if new_facts.get("formalNoticeSent"):
            timeline.append(TimelineItem(
                eventType="GRIEVANCE_RAISED",
                title="Formal Grievance / Demand Notice Sent",
                date=now_dt.strftime("%Y-%m-%d"),
                description="Citizen submitted formal notice/email to opposing party."
            ))

        case.timeline = timeline

        # 5. Potential Legal Routes
        routes = []
        if classification["domain"] == "Employment & Labour Law":
            routes = [
                "Issue 15-day statutory demand notice under Payment of Wages Act.",
                "Register online grievance on Ministry of Labour SAMADHAN Portal.",
                "File formal claim before State Labour Authority for wage recovery + 10x penalty."
            ]
        elif classification["domain"] == "Consumer Protection Law":
            routes = [
                "Lodge pre-litigation grievance on National Consumer Helpline (1915 / NCH).",
                "File digital consumer complaint on e-Daakhil Portal for refund and compensation."
            ]
        elif classification["domain"] == "Landlord & Tenant / Rental Law":
            routes = [
                "Issue statutory 15-day notice to quit or refund security deposit.",
                "Petition local Rent Authority / Rent Court for deposit recovery with interest."
            ]
        elif classification["domain"] == "Cybercrime & Data Privacy":
            routes = [
                "Immediately dial 1930 Cyber Fraud Helpline for 'Golden Hour' account lien.",
                "File complaint on National Cyber Crime Reporting Portal (cybercrime.gov.in)."
            ]
        case.potentialRoutes = routes

        return case
