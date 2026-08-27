"""
Judgment and Legal Precedent Loader
"""

from typing import List, Dict, Any

class JudgmentLoader:
    def __init__(self):
        # Initial core landmark Indian judgments supporting the 5 MVP domains
        self.landmark_judgments = [
            {
                "citation": "AIR 1964 SC 1617",
                "caseName": "Workmen of Subong Tea Estate v. Outram",
                "court": "Supreme Court of India",
                "year": 1964,
                "topic": "Employment & Labour Law",
                "principles": "Section 25F conditions precedent are mandatory; retrenchment without statutory notice and full compensation is void ab initio.",
                "sourceUrl": "https://indiankanoon.org/doc/1647413/"
            },
            {
                "citation": "(2020) 5 SCC 599",
                "caseName": "Wg. Cdr. Arifur Rahman Khan v. DLF Southern Homes Pvt. Ltd.",
                "court": "Supreme Court of India",
                "year": 2020,
                "topic": "Consumer Protection Law",
                "principles": "Failure of developer/seller to deliver flat/goods within agreed timeframe constitutes deficiency of service under Consumer Protection Act.",
                "sourceUrl": "https://indiankanoon.org/doc/120612176/"
            },
            {
                "citation": "(2015) 5 SCC 1",
                "caseName": "Shreya Singhal v. Union of India",
                "court": "Supreme Court of India",
                "year": 2015,
                "topic": "Cybercrime & Data Privacy",
                "principles": "Intermediaries under Section 79 of IT Act are protected unless there is an actual court order or government notification directing takedown.",
                "sourceUrl": "https://indiankanoon.org/doc/110813550/"
            },
            {
                "citation": "(2018) 1 SCC 809",
                "caseName": "Justice K.S. Puttaswamy (Retd.) v. Union of India",
                "court": "Supreme Court of India",
                "year": 2017,
                "topic": "Cybercrime & Data Privacy",
                "principles": "Right to Privacy is a Fundamental Right under Article 21; unauthorized extraction or dissemination of personal data without consent is unconstitutional.",
                "sourceUrl": "https://indiankanoon.org/doc/127517806/"
            }
        ]

    def load_judgments(self) -> List[Dict[str, Any]]:
        return self.landmark_judgments
