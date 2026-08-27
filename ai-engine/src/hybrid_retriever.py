"""
Hybrid Legal Retrieval Engine
Combines Dense Semantic Vector Search + Sparse BM25 Lexical Keyword Search with RRF
"""

import os
import sys
from typing import List, Dict, Any

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from ingestion.embeddings.multilingual_embedder import MultilingualEmbedder
from ingestion.embeddings.bm25_indexer import BM25Indexer
from ingestion.indexer.vector_indexer import HybridLegalVectorStore
from ingestion.pipeline import run_ingestion_pipeline

class HybridRetriever:
    _instance = None

    def __init__(self, data_dir: str = None):
        if data_dir is None:
            data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
        self.data_dir = data_dir

        self.embedder = MultilingualEmbedder(dimension=384)
        self.bm25 = BM25Indexer()
        self.store = HybridLegalVectorStore(embedder=self.embedder, bm25=self.bm25)

        # Attempt to load indexed chunks snapshot
        loaded = self.store.load_index(self.data_dir)
        if not loaded:
            # If not yet indexed, run ingestion pipeline
            self.store = run_ingestion_pipeline(output_dir=self.data_dir)

    @classmethod
    def get_instance(cls, data_dir: str = None):
        if cls._instance is None:
            cls._instance = cls(data_dir=data_dir)
        return cls._instance

    def retrieve(
        self,
        query: str,
        domain_filter: str = None,
        top_k: int = 5,
        dense_weight: float = 0.6,
        sparse_weight: float = 0.4
    ) -> List[Dict[str, Any]]:
        results = self.store.hybrid_search(
            query=query,
            top_k=top_k * 2 if domain_filter else top_k,
            dense_weight=dense_weight,
            sparse_weight=sparse_weight
        )

        if domain_filter and domain_filter != "General Legal Inquiry":
            # Soft boost/filter by domain
            filtered = [r for r in results if r.get("chunk", {}).get("domain") == domain_filter]
            if filtered:
                return filtered[:top_k]

        return results[:top_k]

    def get_chunk_by_id(self, chunk_id: str) -> Dict[str, Any]:
        for c in self.store.chunks:
            if c.get("chunkId") == chunk_id:
                return c
        return None

    def get_total_indexed(self) -> int:
        return len(self.store.chunks)
