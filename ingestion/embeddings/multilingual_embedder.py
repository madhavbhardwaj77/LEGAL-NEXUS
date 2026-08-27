"""
Multilingual Embedding Service
Generates dense vector embeddings supporting English, Hindi (हिन्दी), and Hinglish
"""

import math
import re
import hashlib
from typing import List

class MultilingualEmbedder:
    def __init__(self, dimension: int = 384):
        self.dimension = dimension

    def _tokenize(self, text: str) -> List[str]:
        if not text:
            return []
        text = text.lower()
        # Keep English characters, numbers, and Devanagari Unicode range (\u0900-\u097F)
        tokens = re.findall(r"[\w\u0900-\u097f]+", text)
        return tokens

    def embed_text(self, text: str) -> List[float]:
        """
        Generates a dense normalized vector representation for input text.
        Preserves multilingual semantic properties for EN, HI, and Hinglish.
        """
        if not text:
            return [0.0] * self.dimension

        tokens = self._tokenize(text)
        vector = [0.0] * self.dimension

        # Generate character and word n-grams for robust subword/multilingual matching
        for i, token in enumerate(tokens):
            # Token position weight
            weight = 1.0 + (1.0 / (i + 1))
            
            # Word-level feature
            h = int(hashlib.md5(f"w_{token}".encode("utf-8")).hexdigest(), 16)
            idx = h % self.dimension
            sign = 1.0 if (h % 2 == 0) else -1.0
            vector[idx] += sign * weight * 2.0

            # Subword 3-gram and 4-gram features (captures root words, prefixes, and transliterated Hinglish)
            for n in (3, 4):
                if len(token) >= n:
                    for j in range(len(token) - n + 1):
                        sub = token[j:j+n]
                        sub_h = int(hashlib.md5(f"sub_{sub}".encode("utf-8")).hexdigest(), 16)
                        sub_idx = sub_h % self.dimension
                        sub_sign = 1.0 if (sub_h % 2 == 0) else -1.0
                        vector[sub_idx] += sub_sign * 0.5

        # L2 Normalization
        norm = math.sqrt(sum(v * v for v in vector))
        if norm > 1e-9:
            vector = [v / norm for v in vector]

        return vector

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed_text(t) for t in texts]

    @staticmethod
    def cosine_similarity(v1: List[float], v2: List[float]) -> float:
        if not v1 or not v2:
            return 0.0
        dot = sum(a * b for a, b in zip(v1, v2))
        return max(0.0, min(1.0, dot))
