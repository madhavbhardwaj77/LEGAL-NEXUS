"""
Master Document Intelligence Service
Coordinates OCR, Document Classification, Entity Extraction, Clause Segmentation, Risk Assessment, and RAG Linkage
"""

from typing import Dict, Any, List
from .ocr_engine import OCREngine
from .document_classifier import DocumentClassifier
from .entity_extractor import EntityExtractor
from .clause_segmenter import ClauseSegmenter
from ..rag_service import LegalRAGService

class DocumentAnalyzer:
    def __init__(self, rag_service: LegalRAGService = None):
        self.rag_service = rag_service or LegalRAGService()

    def analyze_document(self, file_content: str, filename: str = "document.pdf") -> Dict[str, Any]:
        # 1. OCR & Layout
        ocr_result = OCREngine.extract_text_and_layout(file_content, filename=filename)
        full_text = ocr_result["fullText"]

        # 2. Document Classification
        classification = DocumentClassifier.classify_document(full_text)
        doc_type = classification.get("documentType", "general_contract")

        # 3. Entity Extraction
        entities = EntityExtractor.extract_entities(full_text)

        # 4. Clause Segmentation
        clauses = ClauseSegmenter.segment_clauses(full_text)

        # 5. Connect to RAG Legal Knowledge Base for relevant statutory references
        rag_query = f"{classification['categoryLabel']} {entities.get('jurisdiction', 'India')}"
        if clauses:
            rag_query += f" {clauses[0]['title']}"
        research = self.rag_service.conduct_research(query=rag_query, top_k=3)

        # 6. Attention / Review Items & Risk Counts
        attention_clauses = [c for c in clauses if c.get("requiresAttention")]
        high_risk_clauses = [c for c in clauses if c.get("riskLevel") == "HIGH"]
        med_risk_clauses = [c for c in clauses if c.get("riskLevel") == "MEDIUM"]
        standard_clauses = [c for c in clauses if c.get("riskLevel") in ("STANDARD", "LOW")]

        # Calculate Overall Legal Safety Score (100 is safest, penalize for high and medium risks)
        score_deductions = (len(high_risk_clauses) * 28) + (len(med_risk_clauses) * 14)
        overall_score = max(20, min(98, 100 - score_deductions))

        if overall_score >= 80:
            risk_rating = "FAVORABLE"
            risk_badge = "Low Legal Risk"
        elif overall_score >= 50:
            risk_rating = "MODERATE_RISK"
            risk_badge = "Moderate Risk / Review Advised"
        else:
            risk_rating = "HIGH_RISK"
            risk_badge = "High Legal Risk / Red Flags"

        # 7. Check for Missing Standard Protections
        present_clause_types = {c.get("clauseType") for c in clauses}
        missing_protections = []

        if "employment" in doc_type:
            if "FORCE_MAJEURE" not in present_clause_types:
                missing_protections.append({
                    "title": "Force Majeure & Frustration Clause",
                    "importance": "Medium",
                    "reason": "Protects against sudden impossibility of performance or salary lockouts during state disasters/emergencies under Section 56 Indian Contract Act."
                })
            if "DISPUTE_RESOLUTION" not in present_clause_types:
                missing_protections.append({
                    "title": "Mutual Dispute Resolution & Conciliation Clause",
                    "importance": "High",
                    "reason": "Provides a 30-day internal mediation mechanism before escalating to courts or labour commissioner."
                })
        elif "rental" in doc_type or "lease" in doc_type:
            if "DISPUTE_RESOLUTION" not in present_clause_types:
                missing_protections.append({
                    "title": "Rent Authority Jurisdiction & Dispute Clause",
                    "importance": "High",
                    "reason": "Essential for speedy recovery of deposits or dispute settlement under the Model Tenancy Act, 2021."
                })
            if "FORCE_MAJEURE" not in present_clause_types:
                missing_protections.append({
                    "title": "Uninhabitable Premises / Disaster Relief Clause",
                    "importance": "Medium",
                    "reason": "Allows rent suspension or immediate lease cancellation if premises become damaged or uninhabitable due to flood/fire."
                })
        else:
            if "LIABILITY" not in present_clause_types:
                missing_protections.append({
                    "title": "Limitation of Liability Cap",
                    "importance": "High",
                    "reason": "Prevents unlimited open-ended financial exposure for indirect or consequential damages."
                })

        # 8. Prioritized Negotiation Points
        negotiation_points = []
        for c in high_risk_clauses:
            negotiation_points.append({
                "clause": c["title"],
                "issue": c.get("attentionAssessment") or "Unbalanced terms detected.",
                "recommendation": c.get("suggestedAmendment") or "Propose mutual terms or reasonable caps."
            })
        for c in med_risk_clauses[:2]:
            negotiation_points.append({
                "clause": c["title"],
                "issue": c.get("attentionAssessment") or "Review recommended.",
                "recommendation": c.get("suggestedAmendment") or "Clarify scope and timelines."
            })

        # Generate Plain-Language Document Summary
        parties_desc = ""
        if entities["parties"].get("partyOne") and entities["parties"].get("partyTwo"):
            parties_desc = f"between {entities['parties']['partyOne']} and {entities['parties']['partyTwo']}."
        else:
            parties_desc = "involving identified contractual parties."

        summary = (
            f"This document is classified as a {classification['categoryLabel']} ({classification['confidence'] * 100:.0f}% confidence) {parties_desc} "
            f"Overall Safety Score: {overall_score}/100 ({risk_badge}). "
            f"The audit identified {len(clauses)} legal clauses, with {len(high_risk_clauses)} critical red flag(s) and {len(med_risk_clauses)} clause(s) recommended for review."
        )

        return {
            "filename": filename,
            "pageCount": ocr_result["pageCount"],
            "classification": classification,
            "entities": entities,
            "clauses": clauses,
            "riskAssessment": {
                "overallScore": overall_score,
                "riskRating": risk_rating,
                "riskBadge": risk_badge,
                "highRiskCount": len(high_risk_clauses),
                "mediumRiskCount": len(med_risk_clauses),
                "standardCount": len(standard_clauses),
                "totalClauses": len(clauses),
            },
            "missingProtections": missing_protections,
            "negotiationPoints": negotiation_points,
            "attentionSummary": [
                {
                    "clauseTitle": c["title"],
                    "assessment": c["attentionAssessment"],
                    "riskLevel": c.get("riskLevel", "HIGH"),
                    "recommendation": c.get("suggestedAmendment") or "This clause may warrant professional legal review before signing or proceeding."
                }
                for c in attention_clauses
            ],
            "statutoryReferences": research.get("legalBasis", []),
            "summary": summary,
            "status": "COMPLETED",
        }

document_analyzer = DocumentAnalyzer()
