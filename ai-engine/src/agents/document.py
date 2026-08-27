"""
Document Intelligence Agent
Performs OCR, layout extraction, document classification, entity parsing, and clause risk analysis
"""

from typing import Dict, Any, List
from ..document.document_analyzer import document_analyzer

class DocumentAgent:
    @classmethod
    def analyze_document_content(cls, file_content: str, filename: str = "document.pdf") -> Dict[str, Any]:
        return document_analyzer.analyze_document(file_content, filename=filename)
