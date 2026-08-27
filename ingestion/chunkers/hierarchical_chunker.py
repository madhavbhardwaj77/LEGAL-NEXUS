"""
Hierarchical Legal Chunker
Preserves Act -> Chapter -> Section -> Subsection context in every chunk
"""

from typing import List, Dict, Any
import hashlib

class HierarchicalLegalChunker:
    def __init__(self, max_chunk_words: int = 400):
        self.max_chunk_words = max_chunk_words

    def create_statute_chunks(self, parsed_nodes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        chunks = []

        for node in parsed_nodes:
            act = node["act"]
            section = node["section"]
            title = node["sectionTitle"]
            chapter = node.get("chapter", "")
            content = node["content"]
            remedy = node.get("remedy", "")
            keywords = node.get("keywords", [])

            # Generate structured contextual text
            text_representation = (
                f"{act}\n"
                f"{chapter}\n"
                f"{section}: {title}\n\n"
                f"Statutory Text:\n{content}\n"
            )
            if remedy:
                text_representation += f"\nLegal Remedy / Actionable Recourse: {remedy}"

            chunk_id = hashlib.md5(f"{act}_{section}".encode("utf-8")).hexdigest()

            chunk = {
                "chunkId": chunk_id,
                "documentType": "statute",
                "text": text_representation,
                "rawContent": content,
                "act": act,
                "actNumber": node.get("actNumber", ""),
                "section": section,
                "sectionTitle": title,
                "chapter": chapter,
                "domain": node.get("domain", ""),
                "authority": node.get("authority", "Government of India"),
                "jurisdiction": node.get("jurisdiction", "India"),
                "effectiveDate": node.get("effectiveDate", ""),
                "sourceUrl": node.get("sourceUrl", ""),
                "keywords": keywords,
                "remedy": remedy,
            }
            chunks.append(chunk)

        return chunks

    def create_judgment_chunks(self, judgments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        chunks = []
        for j in judgments:
            citation = j["citation"]
            case_name = j["caseName"]
            court = j["court"]
            principles = j["principles"]
            topic = j["topic"]
            year = j["year"]

            text_rep = (
                f"Landmark Precedent: {case_name} ({year})\n"
                f"Court: {court} | Citation: {citation}\n"
                f"Subject: {topic}\n\n"
                f"Legal Principles & Ratio Decidendi:\n{principles}"
            )

            chunk_id = hashlib.md5(f"judgment_{citation}".encode("utf-8")).hexdigest()

            chunks.append({
                "chunkId": chunk_id,
                "documentType": "judgment",
                "text": text_rep,
                "rawContent": principles,
                "act": "Judicial Precedent",
                "caseName": case_name,
                "citation": citation,
                "court": court,
                "year": year,
                "section": citation,
                "sectionTitle": f"{case_name} ({citation})",
                "domain": topic,
                "authority": f"{court} (Binding Precedent)",
                "jurisdiction": "India",
                "sourceUrl": j.get("sourceUrl", "https://indiankanoon.org"),
                "keywords": [case_name, citation, topic],
                "remedy": principles,
            })
        return chunks

    def create_scheme_chunks(self, schemes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        chunks = []
        for s in schemes:
            name = s["name"]
            authority = s["authority"]
            description = s["description"]
            remedy = s["remedy"]
            helpline = s.get("helpline", "")
            portal_url = s.get("portalUrl", "")
            domain = s.get("domain", "")

            text_rep = (
                f"Government Dispute Redressal Mechanism: {name}\n"
                f"Authority: {authority}\n"
                f"Helpline: {helpline} | Portal: {portal_url}\n\n"
                f"Procedure & Mechanism:\n{description}\n"
                f"Actionable Remedy: {remedy}"
            )

            chunk_id = hashlib.md5(f"scheme_{name}".encode("utf-8")).hexdigest()

            chunks.append({
                "chunkId": chunk_id,
                "documentType": "scheme",
                "text": text_rep,
                "rawContent": description,
                "act": "Government Grievance Mechanism",
                "section": name,
                "sectionTitle": name,
                "domain": domain,
                "authority": authority,
                "jurisdiction": "India",
                "sourceUrl": portal_url,
                "helpline": helpline,
                "keywords": [name, helpline, authority, domain],
                "remedy": remedy,
            })
        return chunks
