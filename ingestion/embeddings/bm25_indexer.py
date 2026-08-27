"""
BM25 Lexical Indexer
Provides exact keyword, section number, and statutory phrase retrieval
"""

import math
import re
from typing import List, Dict, Any, Tuple
from collections import Counter

class BM25Indexer:
    def __init__(self, k1: float = 1.5, b: float = 0.75):
        self.k1 = k1
        self.b = b
        self.corpus_size = 0
        self.avg_doc_len = 0.0
        self.doc_lengths = []
        self.doc_frequencies = Counter()
        self.inverted_index = {}  # term -> list of (doc_index, term_freq)
        self.documents = []

    def _tokenize(self, text: str) -> List[str]:
        if not text:
            return []
        text = str(text).lower()
        # Tokenize words, numbers, section expressions, and Devanagari Unicode
        tokens = re.findall(r"[\w\u0900-\u097f]+", text)
        return tokens

    def index_documents(self, documents: List[Dict[str, Any]]):
        self.documents = documents
        self.corpus_size = len(documents)
        self.doc_lengths = []
        self.doc_frequencies = Counter()
        self.inverted_index = {}

        total_len = 0
        for doc_idx, doc in enumerate(documents):
            keywords = [str(k) for k in doc.get("keywords", []) if k is not None]
            full_text = f"{doc.get('act', '')} {doc.get('section', '')} {doc.get('sectionTitle', '')} {doc.get('text', '')} {' '.join(keywords)}"
            tokens = self._tokenize(full_text)
            doc_len = len(tokens)
            self.doc_lengths.append(doc_len)
            total_len += doc_len

            term_counts = Counter(tokens)
            for term, count in term_counts.items():
                self.doc_frequencies[term] += 1
                if term not in self.inverted_index:
                    self.inverted_index[term] = []
                self.inverted_index[term].append((doc_idx, count))

        self.avg_doc_len = (total_len / self.corpus_size) if self.corpus_size > 0 else 0.0

    def search(self, query: str, top_k: int = 10) -> List[Tuple[int, float]]:
        query_tokens = self._tokenize(query)
        if not query_tokens or self.corpus_size == 0:
            return []

        scores = [0.0] * self.corpus_size

        for term in query_tokens:
            if term not in self.inverted_index:
                continue

            df = self.doc_frequencies[term]
            # IDF with smoothing
            idf = math.log(1.0 + (self.corpus_size - df + 0.5) / (df + 0.5))

            for doc_idx, tf in self.inverted_index[term]:
                doc_len = self.doc_lengths[doc_idx]
                numerator = tf * (self.k1 + 1.0)
                denominator = tf + self.k1 * (1.0 - self.b + self.b * (doc_len / self.avg_doc_len))
                term_score = idf * (numerator / denominator)

                # Exact section / statute match boost
                doc = self.documents[doc_idx]
                if term in str(doc.get("section", "")).lower():
                    term_score *= 2.5
                if term in str(doc.get("act", "")).lower():
                    term_score *= 1.5

                scores[doc_idx] += term_score

        # Rank documents
        ranked = [(idx, score) for idx, score in enumerate(scores) if score > 0.0]
        ranked.sort(key=lambda x: x[1], reverse=True)
        return ranked[:top_k]
