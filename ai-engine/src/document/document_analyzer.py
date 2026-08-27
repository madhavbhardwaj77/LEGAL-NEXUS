"""
Master Document Intelligence Service
Coordinates OCR, Document Classification, Entity Extraction, Clause Segmentation, and RAG Linkage
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

        # 3. Entity Extraction
        entities = EntityExtractor.extract_entities(full_text)

        # 4. Clause Segmentation
        clauses = ClauseSegmenter.segment_clauses(full_text)

        # 5. Connect to RAG Legal Knowledge Base for relevant statutory references
        rag_query = f"{classification['categoryLabel']} {entities.get('jurisdiction', 'India')}"
        if clauses:
            rag_query += f" {clauses[0]['title']}"
        research = self.rag_service.conduct_research(query=rag_query, top_k=2)

        # 6. Attention / Review Items
        attention_clauses = [c for c in clauses if c.get("requiresAttention")]

        # Generate Plain-Language Document Summary
        parties_desc = ""
        if entities["parties"].get("partyOne") and entities["parties"].get("partyTwo"):
            parties_desc = f"between {entities['parties']['partyOne']} and {entities['parties']['partyTwo']}."
        else:
            parties_desc = "involving identified contractual parties."

        summary = (
            f"This document is classified as a {classification['categoryLabel']} ({classification['confidence'] * 100:.0f}% confidence) {parties_desc} "
            f"It contains {len(clauses)} identified key legal clauses and {len(attention_clauses)} clause(s) recommended for review."
        )

        return {
            "filename": filename,
            "pageCount": ocr_result["pageCount"],
            "classification": classification,
            "entities": entities,
            "clauses": clauses,
            "attentionSummary": [
                {
                    "clauseTitle": c["title"],
                    "assessment": c["attentionAssessment"],
                    "recommendation": "This clause may warrant professional legal review before signing or proceeding."
                }
                for c in attention_clauses
            ],
            "statutoryReferences": research.get("legalBasis", []),
            "summary": summary,
            "status": "COMPLETED",
        }

document_analyzer = DocumentAnalyzer()
