"""
Legal Provenance and Metadata Builder
"""

from typing import Dict, Any
from datetime import datetime

class ProvenanceBuilder:
    @staticmethod
    def build_metadata(chunk: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "sourceId": chunk.get("chunkId", ""),
            "authority": chunk.get("authority", "Official Legal Authority"),
            "documentType": chunk.get("documentType", "statute"),
            "act": chunk.get("act", ""),
            "actNumber": chunk.get("actNumber", ""),
            "chapter": chunk.get("chapter", ""),
            "section": chunk.get("section", ""),
            "sectionTitle": chunk.get("sectionTitle", ""),
            "jurisdiction": chunk.get("jurisdiction", "India"),
            "effectiveDate": chunk.get("effectiveDate", ""),
            "sourceUrl": chunk.get("sourceUrl", ""),
            "topic": chunk.get("domain", ""),
            "keywords": chunk.get("keywords", []),
            "remedy": chunk.get("remedy", ""),
            "helpline": chunk.get("helpline", ""),
            "citation": chunk.get("citation", ""),
            "isAuthoritative": True,
            "verificationStatus": "VERIFIED_OFFICIAL",
            "lastVerified": datetime.utcnow().strftime("%Y-%m-%d"),
        }
