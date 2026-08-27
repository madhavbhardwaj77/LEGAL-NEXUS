"""
Evidence Agent
Audits available vs missing vs recommended evidence and connects evidence to legal facts
"""

from typing import Dict, Any, List
from ..schemas.case_schemas import EvidenceItem, EvidenceChecklist, StructuredCaseState

class EvidenceAgent:
    EVIDENCE_TEMPLATES = {
        "Employment & Labour Law": [
            {"name": "Employment Contract / Offer Letter", "category": "CONTRACT", "importance": "CRITICAL", "purpose": "Proves employment relationship and agreed wage terms under Payment of Wages Act."},
            {"name": "Salary Slips / Paychecks (Last 3-6 Months)", "category": "FINANCIAL", "importance": "CRITICAL", "purpose": "Demonstrates regular wage rate and establishes date of wage stoppage."},
            {"name": "Bank Account Statements", "category": "FINANCIAL", "importance": "CRITICAL", "purpose": "Provides conclusive banking proof that wages were not credited on due dates."},
            {"name": "Email Correspondence / HR Tickets", "category": "COMMUNICATION", "importance": "HIGH", "purpose": "Proves formal grievance was raised and demonstrates employer default."},
            {"name": "WhatsApp / Slack Communication", "category": "DIGITAL_RECORD", "importance": "MEDIUM", "purpose": "Supporting proof of task assignments, attendance, or admissions of pending dues."}
        ],
        "Landlord & Tenant / Rental Law": [
            {"name": "Written / Registered Tenancy Agreement", "category": "CONTRACT", "importance": "CRITICAL", "purpose": "Establishes tenancy terms, agreed rent, and security deposit clause under Model Tenancy Act."},
            {"name": "Security Deposit Payment Receipt / Bank UTR", "category": "FINANCIAL", "importance": "CRITICAL", "purpose": "Proves initial transfer and exact quantum of security deposit."},
            {"name": "15-Day Written Notice to Vacate / Quit", "category": "LEGAL_NOTICE", "importance": "HIGH", "purpose": "Statutory compliance under Section 106 Transfer of Property Act."},
            {"name": "Handover Checklist & Property Photos", "category": "PHYSICAL_RECORD", "importance": "MEDIUM", "purpose": "Refutes arbitrary deductions for alleged property damage."}
        ],
        "Cybercrime & Data Privacy": [
            {"name": "Bank Statement with Transaction UTR & Timestamp", "category": "FINANCIAL", "importance": "CRITICAL", "purpose": "Primary record for cyber cell lien and account freeze under 1930 Helpline."},
            {"name": "Screenshots of Fraudulent Phishing SMS / Fake KYC URL", "category": "DIGITAL_RECORD", "importance": "CRITICAL", "purpose": "Proof of Section 66D IT Act personation and cheating."},
            {"name": "Call Logs and WhatsApp Chat Records of Scammer", "category": "COMMUNICATION", "importance": "HIGH", "purpose": "Aids investigation into scammer phone numbers and SIM tracing."}
        ],
        "Consumer Protection Law": [
            {"name": "Original Tax Invoice / Order Receipt", "category": "FINANCIAL", "importance": "CRITICAL", "purpose": "Proves consideration and qualifies complainant as 'Consumer' under Section 2(7)."},
            {"name": "Photographs / Video of Defective Product", "category": "PHYSICAL_RECORD", "importance": "CRITICAL", "purpose": "Visual evidence of defect or deficiency in service under Section 2(11)."},
            {"name": "Customer Care Complaint Number & Email Thread", "category": "COMMUNICATION", "importance": "HIGH", "purpose": "Shows pre-litigation attempt to seek replacement or refund under E-Commerce Rules."}
        ]
    }

    @classmethod
    def audit_evidence(cls, case: StructuredCaseState) -> EvidenceChecklist:
        domain = case.category
        templates = cls.EVIDENCE_TEMPLATES.get(domain, [
            {"name": "Written Agreement / Contract", "category": "CONTRACT", "importance": "CRITICAL", "purpose": "Proves legal relationship and obligations."},
            {"name": "Bank Transaction Record / Receipts", "category": "FINANCIAL", "importance": "HIGH", "purpose": "Establishes financial loss or consideration."}
        ])

        facts = case.facts
        available = []
        missing = []
        recommended = []

        for item in templates:
            ev_name = item["name"]
            ev_item = EvidenceItem(
                name=ev_name,
                category=item["category"],
                importance=item["importance"],
                purpose=item["purpose"]
            )

            # Check if mentioned as available in facts
            has_agreement = facts.get("hasAgreement") and facts.get("hasAgreement").value
            formal_notice = facts.get("formalNoticeSent") and facts.get("formalNoticeSent").value

            if "Contract" in ev_name or "Agreement" in ev_name:
                if has_agreement:
                    ev_item.status = "AVAILABLE"
                    available.append(ev_item)
                else:
                    ev_item.status = "MISSING"
                    missing.append(ev_item)
            elif "Notice" in ev_name or "Email" in ev_name or "Grievance" in ev_name:
                if formal_notice:
                    ev_item.status = "AVAILABLE"
                    available.append(ev_item)
                else:
                    ev_item.status = "MISSING"
                    missing.append(ev_item)
            elif item["importance"] == "CRITICAL":
                ev_item.status = "MISSING"
                missing.append(ev_item)
            else:
                ev_item.status = "RECOMMENDED"
                recommended.append(ev_item)

        return EvidenceChecklist(
            available=available,
            missing=missing,
            recommended=recommended
        )
