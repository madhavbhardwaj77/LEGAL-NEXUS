"""
Contract & Legal Notice Clause Segmentation Service
Identifies and segments specific clauses with potential attention items, risk ratings, and redlines
"""

import re
from typing import List, Dict, Any

class ClauseSegmenter:
    CLAUSE_TYPES = {
        "NON_COMPETE": {
            "title": "Non-Compete & Restraint of Trade Clause",
            "category": "Restrictive Covenants",
            "patterns": [r"\bnon-compete\b", r"\bnon compete\b", r"\bnoncompete\b", r"\brestraint of trade\b", r"\bcompeting business\b", r"\bsolicitation\b"],
            "attentionTrigger": r"(?:shall not engage|competing business|post-termination|2 years|1 year|anywhere in india)",
            "attentionNote": "Post-employment non-compete covenants are void in India under Section 27 of the Indian Contract Act, 1872 (Percept D'Mark v. Zaheer Khan).",
            "riskLevel": "HIGH",
            "suggestedAmendment": "Delete the post-employment restraint, or limit strictly to non-solicitation of active clients and protection of proprietary trade secrets during employment."
        },
        "TERMINATION": {
            "title": "Termination & Exit Clause",
            "category": "Termination & Exit",
            "patterns": [r"\btermination\b", r"\bterminating\b", r"\bdischarge\b", r"\bseverance\b", r"\bcause for termination\b"],
            "attentionTrigger": r"(?:without cause|immediate termination without notice|forfeit|penalty|without notice)",
            "attentionNote": "Immediate termination without notice or severance may warrant professional review under Section 25F Industrial Disputes Act and natural justice principles.",
            "riskLevel": "HIGH",
            "suggestedAmendment": "Require minimum 30 days written notice or equivalent salary in lieu of notice for both parties, with specific cure period (15 days) for remediable defaults."
        },
        "NOTICE_PERIOD": {
            "title": "Notice Period Clause",
            "category": "Operational & Timeline",
            "patterns": [r"\bnotice period\b", r"\bwritten notice\b", r"\bin lieu of notice\b", r"\bnotice to quit\b"],
            "attentionTrigger": r"(?:90 days|3 months|salary deduction for notice|forfeit salary)",
            "attentionNote": "Extended notice periods (>60 days) or unilateral deduction of notice pay without mutual waiver option restrict career mobility.",
            "riskLevel": "MEDIUM",
            "suggestedAmendment": "Specify standard 30-day notice with mutual buyout / garden leave option upon consent."
        },
        "CONFIDENTIALITY": {
            "title": "Confidentiality & Non-Disclosure",
            "category": "IP & Data Security",
            "patterns": [r"\bconfidential information\b", r"\bnon-disclosure\b", r"\bproprietary data\b", r"\btrade secrets?\b", r"\bconfidentiality\b"],
            "attentionTrigger": r"(?:perpetual liability|indemnity for leak|unlimited damages)",
            "attentionNote": "Standard confidentiality obligation; ensure defined exclusions for publicly available knowledge or court orders.",
            "riskLevel": "LOW",
            "suggestedAmendment": "Include standard exceptions: information already public, independently developed, or disclosed under legal compulsion."
        },
        "PAYMENT": {
            "title": "Payment, Salary & Security Deposit",
            "category": "Commercial & Financial",
            "patterns": [r"\bsalary\b", r"\bwages\b", r"\bmonthly rent\b", r"\bsecurity deposit\b", r"\bpayment schedule\b", r"\bdeductions\b", r"\bdeposit refund\b"],
            "attentionTrigger": r"(?:non-refundable deposit|unauthorized deduction|delay penalty|forfeit deposit)",
            "attentionNote": "Security deposits exceeding 2 months rent require review under Section 10 Model Tenancy Act; unauthorized salary deductions violate Payment of Wages Act.",
            "riskLevel": "HIGH",
            "suggestedAmendment": "Deposit to be strictly refundable within 7-15 days of handover minus verifiable utility arrears with receipts provided."
        },
        "DISPUTE_RESOLUTION": {
            "title": "Dispute Resolution & Arbitration",
            "category": "Dispute Resolution",
            "patterns": [r"\barbitration\b", r"\bdispute resolution\b", r"\bamicable settlement\b", r"\bsole arbitrator\b"],
            "attentionTrigger": r"(?:unilateral appointment of sole arbitrator|sole arbitrator unilaterally|exclusive seat outside state)",
            "attentionNote": "Unilateral appointment of a sole arbitrator is invalid under the Arbitration and Conciliation Act, 1996 (Section 12(5), Perkins Eastman Architects).",
            "riskLevel": "HIGH",
            "suggestedAmendment": "Arbitration before a mutually agreed sole arbitrator, preceded by mandatory 30-day amicable mediation/conciliation."
        },
        "JURISDICTION": {
            "title": "Jurisdiction & Governing Law",
            "category": "Legal & Governing Law",
            "patterns": [r"\bjurisdiction of courts\b", r"\bgoverning law\b", r"\blaws of india\b", r"\bexclusive jurisdiction\b", r"\bjurisdiction\b"],
            "attentionTrigger": r"(?:exclusive jurisdiction in foreign state|foreign jurisdiction)",
            "attentionNote": "Subject to territorial and pecuniary jurisdiction of local consumer, rent, or civil courts in India.",
            "riskLevel": "LOW",
            "suggestedAmendment": "Jurisdiction should ideally be at the location where services are rendered or demised property is situated."
        },
        "LIABILITY": {
            "title": "Liability & Indemnity",
            "category": "Risk Allocation",
            "patterns": [r"\bindemnity\b", r"\bindemnify\b", r"\blimitation of liability\b", r"\bhold harmless\b"],
            "attentionTrigger": r"(?:unlimited indemnity|sole liability|all consequential damages)",
            "attentionNote": "Broad or uncapped indemnity obligations disproportionately shift commercial risk.",
            "riskLevel": "HIGH",
            "suggestedAmendment": "Cap total aggregate liability to direct damages not exceeding fees/salary paid in the preceding 6 months."
        },
        "FORCE_MAJEURE": {
            "title": "Force Majeure & Frustration of Contract",
            "category": "Operational & Timeline",
            "patterns": [r"\bforce majeure\b", r"\bacts? of god\b", r"\bfrustration\b", r"\bunforeseen event\b"],
            "attentionTrigger": r"(?:no suspension of rent|continued liability during disaster)",
            "attentionNote": "Section 56 Indian Contract Act: Ensure contract suspends performance or allows termination during prolonged impossibility.",
            "riskLevel": "LOW",
            "suggestedAmendment": "Provide relief from performance and right to terminate without penalty if force majeure persists beyond 60 days."
        },
        "INTELLECTUAL_PROPERTY": {
            "title": "Intellectual Property & Work for Hire",
            "category": "IP & Data Security",
            "patterns": [r"\bintellectual property\b", r"\bwork for hire\b", r"\bcopyright\b", r"\bpatent\b", r"\binvention\b"],
            "attentionTrigger": r"(?:assignment of pre-existing IP|inventions outside work hours)",
            "attentionNote": "IP assignment should strictly cover work created within scope of employment during working hours using company resources.",
            "riskLevel": "MEDIUM",
            "suggestedAmendment": "Clarify that pre-existing personal IP and inventions created entirely outside working hours remain employee property."
        }
    }

    @classmethod
    def segment_clauses(cls, text: str) -> List[Dict[str, Any]]:
        if not text:
            return []

        # Clean text
        text_clean = text.replace("\r\n", "\n").strip()

        # Split into blocks based on numbered list items or lines
        raw_blocks = re.split(r"\n\s*(?=\d+[\.\)]|[A-Z\s-]{3,}:|\bClause\s+\d+)", text_clean)
        if len(raw_blocks) <= 1:
            raw_blocks = [b.strip() for b in text_clean.split("\n\n") if b.strip()]

        segmented = []

        for p_idx, para in enumerate(raw_blocks, 1):
            para_clean = para.strip()
            if len(para_clean) < 15:
                continue

            para_lower = para_clean.lower()

            for c_code, c_meta in cls.CLAUSE_TYPES.items():
                matched = any(re.search(pat, para_lower) for pat in c_meta["patterns"])
                if matched:
                    has_attention = bool(re.search(c_meta["attentionTrigger"], para_lower))
                    attention_message = c_meta["attentionNote"] if has_attention else None
                    risk_level = c_meta["riskLevel"] if has_attention else "STANDARD"

                    segmented.append({
                        "clauseId": f"clause_{c_code.lower()}_{p_idx}",
                        "clauseType": c_code,
                        "title": c_meta["title"],
                        "category": c_meta.get("category", "General"),
                        "text": para_clean,
                        "requiresAttention": has_attention,
                        "riskLevel": risk_level,
                        "attentionAssessment": attention_message,
                        "suggestedAmendment": c_meta.get("suggestedAmendment") if has_attention else None,
                        "confidence": 0.95 if has_attention else 0.88,
                    })
                    break

        return segmented
