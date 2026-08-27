"""
Legal Text Cleaning & Preprocessing
"""

import re

class TextCleaner:
    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        
        # Replace non-breaking spaces and fancy quotes
        text = text.replace("\u00a0", " ")
        text = text.replace("“", '"').replace("”", '"').replace("’", "'").replace("‘", "'")
        
        # Normalize whitespace and newlines
        text = re.sub(r"\r\n", "\n", text)
        text = re.sub(r"[ \t]+", " ", text)
        text = re.sub(r"\n{3,}", "\n\n", text)
        
        return text.strip()

    @staticmethod
    def normalize_section_notation(text: str) -> str:
        """
        Standardizes 'Sec.', 'u/s', 'sec', '§' to 'Section'
        """
        if not text:
            return ""
        
        # Replace 'u/s 15' or 'u/s. 15' with 'Section 15'
        text = re.sub(r"\bu/s\.?\s*(\d+[A-Za-z]*)", r"Section \1", text, flags=re.IGNORECASE)
        # Replace 'sec. 15' or 'sec 15' with 'Section 15'
        text = re.sub(r"\bsec\.?\s*(\d+[A-Za-z]*)", r"Section \1", text, flags=re.IGNORECASE)
        # Replace '§ 15' with 'Section 15'
        text = re.sub(r"§\s*(\d+[A-Za-z]*)", r"Section \1", text)
        
        return text
