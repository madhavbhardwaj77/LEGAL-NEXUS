"""
Contract & Legal Notice Clause Segmentation Service
Identifies and segments specific clauses with potential attention items
"""

import re
from typing import List, Dict, Any

class ClauseSegmenter:
    CLAUSE_TYPES = {
        "NON_COMPETE": {
            "title": "Non-Compete & Restraint of Trade Clause",
            "patterns": [r"\bnon-compete\b", r"\bnon compete\b", r"\bnoncompete\b", r"\brestraint of trade\b", r"\bcompeting business\b", r"\bsolicitation\b"],
            "attentionTrigger": r"(?:shall not engage|competing business|post-termination|2 years|1 year)",
            "attentionNote": "Post-employment non-compete covenants are generally void in India under Section 27 of the Indian Contract Act, 1872."
        },
        "TERMINATION": {
            "title": "Termination & Exit Clause",
            "patterns": [r"\btermination\b", r"\bterminating\b", r"\bdischarge\b", r"\bseverance\b", r"\bcause for termination\b"],
            "attentionTrigger": r"(?:without cause|immediate termination without notice|forfeit|penalty|without notice)",
            "attentionNote": "Immediate termination without notice or severance may warrant professional review under Section 25F Industrial Disputes Act."
        },
        "NOTICE_PERIOD": {
            "title": "Notice Period Clause",
            "patterns": [r"\bnotice period\b", r"\bwritten notice\b", r"\bin lieu of notice\b", r"\bnotice to quit\b"],
            "attentionTrigger": r"(?:90 days|3 months|salary deduction for notice)",
            "attentionNote": "Extended notice periods (>60 days) or unilateral deduction of notice pay may warrant review."
        },
        "CONFIDENTIALITY": {
            "title": "Confidentiality & Non-Disclosure",
            "patterns": [r"\bconfidential information\b", r"\bnon-disclosure\b", r"\bproprietary data\b", r"\btrade secrets?\b", r"\bconfidentiality\b"],
            "attentionTrigger": r"(?:perpetual liability|indemnity for leak)",
            "attentionNote": "Standard confidentiality obligation; ensure defined exclusions for publicly available knowledge."
        },
        "PAYMENT": {
            "title": "Payment, Salary & Security Deposit",
            "patterns": [r"\bsalary\b", r"\bwages\b", r"\bmonthly rent\b", r"\bsecurity deposit\b", r"\bpayment schedule\b", r"\bdeductions\b", r"\bdeposit refund\b"],
            "attentionTrigger": r"(?:non-refundable deposit|unauthorized deduction|delay penalty)",
            "attentionNote": "Security deposits exceeding 2 months rent require review under Section 10 Model Tenancy Act."
        },
        "DISPUTE_RESOLUTION": {
            "title": "Dispute Resolution & Arbitration",
            "patterns": [r"\barbitration\b", r"\bdispute resolution\b", r"\bamicable settlement\b", r"\bsole arbitrator\b"],
            "attentionTrigger": r"(?:unilateral appointment of sole arbitrator|exclusive seat outside state)",
            "attentionNote": "Unilateral appointment of a sole arbitrator is invalid under the Arbitration and Conciliation Act (Section 12(5))."
        },
        "JURISDICTION": {
            "title": "Jurisdiction & Governing Law",
            "patterns": [r"\bjurisdiction of courts\b", r"\bgoverning law\b", r"\blaws of india\b", r"\bexclusive jurisdiction\b", r"\bjurisdiction\b"],
            "attentionTrigger": r"(?:exclusive jurisdiction in foreign state)",
            "attentionNote": "Subject to territorial and pecuniary jurisdiction of local consumer or civil courts."
        },
        "LIABILITY": {
            "title": "Liability & Indemnity",
            "patterns": [r"\bindemnity\b", r"\bindemnify\b", r"\blimitation of liability\b", r"\bhold harmless\b"],
            "attentionTrigger": r"(?:unlimited indemnity|sole liability)",
            "attentionNote": "Broad indemnity obligations may warrant professional review to limit financial exposure."
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

                    segmented.append({
                        "clauseId": f"clause_{c_code.lower()}_{p_idx}",
                        "clauseType": c_code,
                        "title": c_meta["title"],
                        "text": para_clean,
                        "requiresAttention": has_attention,
                        "attentionAssessment": attention_message,
                        "confidence": 0.92 if has_attention else 0.85,
                    })
                    break

        return segmented
