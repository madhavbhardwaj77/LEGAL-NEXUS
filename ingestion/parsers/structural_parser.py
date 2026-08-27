"""
Structural Legal Parser
Decomposes statutory documents into structured hierarchical nodes
"""

from typing import Dict, List, Any
from ..cleaners.text_cleaner import TextCleaner

class StructuralParser:
    def __init__(self):
        self.cleaner = TextCleaner()

    def parse_statute(self, raw_act: Dict[str, Any], domain: str) -> List[Dict[str, Any]]:
        """
        Parses an entire statute into structured section nodes
        """
        parsed_nodes = []
        act_title = raw_act.get("act", "Unknown Act")
        act_number = raw_act.get("actNumber", "")
        authority = raw_act.get("authority", "Government of India")
        jurisdiction = raw_act.get("jurisdiction", "India")
        source_url = raw_act.get("sourceUrl", "")
        effective_date = raw_act.get("effectiveDate", "")

        for chapter in raw_act.get("chapters", []):
            chapter_num = chapter.get("chapterNumber", "")
            chapter_title = chapter.get("chapterTitle", "")

            for sec in chapter.get("sections", []):
                section_num = sec.get("section", "")
                section_title = sec.get("sectionTitle", "")
                content = self.cleaner.clean_text(sec.get("content", ""))
                keywords = sec.get("keywords", [])
                remedy = sec.get("remedy", "")
                subsections = sec.get("subsections", [])

                node = {
                    "documentType": "statute",
                    "domain": domain,
                    "act": act_title,
                    "actNumber": act_number,
                    "authority": authority,
                    "jurisdiction": jurisdiction,
                    "sourceUrl": source_url,
                    "effectiveDate": effective_date,
                    "chapter": f"{chapter_num}: {chapter_title}" if chapter_num else chapter_title,
                    "section": section_num,
                    "sectionTitle": section_title,
                    "content": content,
                    "keywords": keywords,
                    "remedy": remedy,
                    "subsections": subsections,
                }
                parsed_nodes.append(node)

        return parsed_nodes
