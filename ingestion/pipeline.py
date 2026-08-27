"""
Master Legal Ingestion Pipeline Orchestrator
Executes: Load -> Clean -> Parse -> Hierarchical Chunk -> Provenance Build -> Dense Embedding -> BM25 Index -> Snapshot
"""

import os
import sys
from typing import Dict, Any

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ingestion.loaders.statute_loader import StatuteLoader
from ingestion.loaders.judgment_loader import JudgmentLoader
from ingestion.loaders.scheme_loader import SchemeLoader
from ingestion.parsers.structural_parser import StructuralParser
from ingestion.chunkers.hierarchical_chunker import HierarchicalLegalChunker
from ingestion.metadata.provenance_builder import ProvenanceBuilder
from ingestion.embeddings.multilingual_embedder import MultilingualEmbedder
from ingestion.embeddings.bm25_indexer import BM25Indexer
from ingestion.indexer.vector_indexer import HybridLegalVectorStore

def run_ingestion_pipeline(output_dir: str = None) -> HybridLegalVectorStore:
    print("===============================================================")
    print("       NYAYA SETU -- LEGAL KNOWLEDGE INGESTION PIPELINE        ")
    print("===============================================================\n")

    if output_dir is None:
        output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ai-engine", "data"))

    # 1. Load Data
    print("[1] Loading authoritative legal sources...")
    statute_loader = StatuteLoader()
    domains_data = statute_loader.load_all_domains()
    print(f"    Loaded {len(domains_data)} legal domain files.")

    judgment_loader = JudgmentLoader()
    judgments_data = judgment_loader.load_judgments()
    print(f"    Loaded {len(judgments_data)} landmark judicial precedents.")

    scheme_loader = SchemeLoader(statute_data=domains_data)
    schemes_data = scheme_loader.load_schemes()
    print(f"    Loaded {len(schemes_data)} government grievance mechanisms and legal aid portals.")

    # 2. Structural Parsing
    print("\n[2] Performing structural legal parsing (Act -> Chapter -> Section -> Clause)...")
    parser = StructuralParser()
    parsed_nodes = []
    for domain in domains_data:
        domain_name = domain.get("domain", "General Law")
        for statute in domain.get("statutes", []):
            nodes = parser.parse_statute(statute, domain=domain_name)
            parsed_nodes.extend(nodes)
    print(f"    Generated {len(parsed_nodes)} structured statutory section nodes.")

    # 3. Hierarchical Chunking
    print("\n[3] Hierarchical section-aware chunking...")
    chunker = HierarchicalLegalChunker()
    statute_chunks = chunker.create_statute_chunks(parsed_nodes)
    judgment_chunks = chunker.create_judgment_chunks(judgments_data)
    scheme_chunks = chunker.create_scheme_chunks(schemes_data)

    all_chunks = statute_chunks + judgment_chunks + scheme_chunks
    print(f"    Created {len(all_chunks)} total legal chunks:")
    print(f"      - Statutes & Acts: {len(statute_chunks)} chunks")
    print(f"      - Judicial Precedents: {len(judgment_chunks)} chunks")
    print(f"      - Grievance Schemes & Portals: {len(scheme_chunks)} chunks")

    # 4. Provenance Metadata Building
    print("\n[4] Building verified legal provenance metadata...")
    for c in all_chunks:
        c["provenance"] = ProvenanceBuilder.build_metadata(c)

    # 5. Hybrid Vector Indexing (Dense Embeddings + BM25 Inverted Index)
    print("\n[5] Generating multilingual embeddings and building BM25 index...")
    embedder = MultilingualEmbedder(dimension=384)
    bm25 = BM25Indexer()
    store = HybridLegalVectorStore(embedder=embedder, bm25=bm25)
    store.index_chunks(all_chunks)
    print(f"    Dense vectors embedded: {len(store.embeddings)} (384-dim)")
    print(f"    BM25 Inverted terms indexed: {len(bm25.inverted_index)} terms")

    # 6. Save Snapshot
    print(f"\n[6] Saving knowledge base index snapshot to: {output_dir}")
    store.save_index(output_dir)
    print("    [OK] Ingestion completed successfully!\n")

    return store

if __name__ == "__main__":
    run_ingestion_pipeline()
