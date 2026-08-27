"""
Hybrid Vector and Lexical Indexer
Supports Qdrant Vector DB & In-Memory Hybrid Store with RRF
"""

import json
import os
from typing import List, Dict, Any
from ..embeddings.multilingual_embedder import MultilingualEmbedder
from ..embeddings.bm25_indexer import BM25Indexer

class HybridLegalVectorStore:
    def __init__(self, embedder: MultilingualEmbedder = None, bm25: BM25Indexer = None):
        self.embedder = embedder or MultilingualEmbedder()
        self.bm25 = bm25 or BM25Indexer()
        self.chunks = []
        self.embeddings = []

    def index_chunks(self, chunks: List[Dict[str, Any]]):
        self.chunks = chunks
        texts = [c.get("text", "") for c in chunks]
        self.embeddings = self.embedder.embed_batch(texts)
        self.bm25.index_documents(chunks)

    def dense_search(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        query_vector = self.embedder.embed_text(query)
        scored = []
        for idx, (chunk, emb) in enumerate(zip(self.chunks, self.embeddings)):
            sim = self.embedder.cosine_similarity(query_vector, emb)
            scored.append({"chunk": chunk, "score": sim, "doc_idx": idx})
        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def sparse_search(self, query: str, top_k: int = 10) -> List[Dict[str, Any]]:
        results = self.bm25.search(query, top_k=top_k)
        scored = []
        for idx, score in results:
            scored.append({"chunk": self.chunks[idx], "score": score, "doc_idx": idx})
        return scored

    def hybrid_search(
        self,
        query: str,
        top_k: int = 5,
        dense_weight: float = 0.6,
        sparse_weight: float = 0.4,
        rrf_k: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Reciprocal Rank Fusion (RRF) combining Dense and Sparse rankings
        """
        dense_results = self.dense_search(query, top_k=top_k * 3)
        sparse_results = self.sparse_search(query, top_k=top_k * 3)

        rrf_scores = {}

        # Dense rank scoring
        for rank, res in enumerate(dense_results):
            idx = res["doc_idx"]
            rrf_scores[idx] = rrf_scores.get(idx, 0.0) + (dense_weight / (rrf_k + rank + 1))

        # Sparse rank scoring
        for rank, res in enumerate(sparse_results):
            idx = res["doc_idx"]
            rrf_scores[idx] = rrf_scores.get(idx, 0.0) + (sparse_weight / (rrf_k + rank + 1))

        # Sort combined results
        sorted_indices = sorted(rrf_scores.items(), key=lambda x: x[1], reverse=True)

        final_results = []
        for idx, rrf_score in sorted_indices[:top_k]:
            chunk = self.chunks[idx]
            final_results.append({
                "chunk": chunk,
                "score": rrf_score,
                "documentType": chunk.get("documentType", "statute"),
                "act": chunk.get("act", ""),
                "section": chunk.get("section", ""),
                "sectionTitle": chunk.get("sectionTitle", ""),
                "authority": chunk.get("authority", ""),
                "jurisdiction": chunk.get("jurisdiction", "India"),
                "sourceUrl": chunk.get("sourceUrl", ""),
                "remedy": chunk.get("remedy", ""),
            })

        return final_results

    def save_index(self, output_dir: str):
        os.makedirs(output_dir, exist_ok=True)
        chunks_file = os.path.join(output_dir, "legal_chunks.json")
        with open(chunks_file, "w", encoding="utf-8") as f:
            json.dump(self.chunks, f, indent=2, ensure_ascii=False)

    def load_index(self, input_dir: str):
        chunks_file = os.path.join(input_dir, "legal_chunks.json")
        if os.path.exists(chunks_file):
            with open(chunks_file, "r", encoding="utf-8") as f:
                chunks = json.load(f)
                self.index_chunks(chunks)
                return True
        return False
