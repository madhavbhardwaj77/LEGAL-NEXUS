"""
Nyaya Setu AI Engine Microservice
FastAPI Application for Legal Research, Hybrid RAG, and Citation Verification
"""

import os
import sys
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Ensure path resolution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from .config import settings
from .rag_service import LegalRAGService
from .domain_classifier import LegalDomainClassifier

app = FastAPI(
    title="Nyaya Setu Legal AI Engine",
    description="Authoritative Indian Legal Knowledge Layer & Hybrid RAG Microservice",
    version=settings.version
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG Service singleton
rag_service = LegalRAGService(data_dir=settings.data_dir)

# Request Models
class ResearchRequest(BaseModel):
    query: str = Field(..., description="Legal scenario or question (English, Hindi, Hinglish)")
    jurisdiction: Optional[str] = Field("India", description="Court or State jurisdiction")
    language: Optional[str] = Field("en", description="User preferred language code")
    top_k: Optional[int] = Field(4, description="Number of authoritative provisions to retrieve")

class SearchRequest(BaseModel):
    query: str = Field(..., description="Search keyword or phrase")
    domain: Optional[str] = Field(None, description="Optional domain filter")
    top_k: Optional[int] = Field(5, description="Number of results")

class VerifyCitationRequest(BaseModel):
    act: str = Field(..., description="Official Act Name (e.g. Payment of Wages Act, 1936)")
    section: str = Field(..., description="Section Number (e.g. Section 15)")

@app.get("/")
def root():
    return {
        "service": "Nyaya Setu AI Engine",
        "status": "OPERATIONAL",
        "version": settings.version,
        "indexedChunks": rag_service.retriever.get_total_indexed(),
        "docs": "/docs",
    }

@app.get("/health")
def health():
    return {
        "status": "HEALTHY",
        "service": "ai-engine",
        "indexedChunks": rag_service.retriever.get_total_indexed(),
        "domainsSupported": list(LegalDomainClassifier.DOMAINS.values()),
        "vectorEngine": "Hybrid (Dense + BM25 + Qdrant)",
    }

@app.get("/ai/domains")
def get_domains():
    """
    Returns supported legal domains and knowledge base catalogue
    """
    chunks = rag_service.retriever.store.chunks
    domain_counts = {}
    for c in chunks:
        d = c.get("domain", "General")
        domain_counts[d] = domain_counts.get(d, 0) + 1

    return {
        "domains": list(LegalDomainClassifier.DOMAINS.values()),
        "domainChunkCounts": domain_counts,
        "totalChunks": len(chunks),
    }

@app.post("/ai/research")
def conduct_legal_research(req: ResearchRequest):
    """
    Full Legal Research Endpoint
    Executes: Query Understanding -> Hybrid Retrieval -> Re-ranking -> Source Grounding -> Structured Output
    """
    if not req.query or not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    result = rag_service.conduct_research(
        query=req.query,
        jurisdiction=req.jurisdiction,
        language=req.language,
        top_k=req.top_k
    )
    return result

@app.post("/ai/search")
def hybrid_search(req: SearchRequest):
    """
    Direct hybrid search returning raw legal chunks with provenance metadata
    """
    results = rag_service.retriever.retrieve(
        query=req.query,
        domain_filter=req.domain,
        top_k=req.top_k
    )
    return {
        "query": req.query,
        "total": len(results),
        "results": results,
    }

@app.post("/ai/verify-citation")
def verify_citation(req: VerifyCitationRequest):
    """
    Validates whether a cited Act and Section exist in the authoritative legal roll
    """
    verification = rag_service.verifier.verify_citation(
        act=req.act,
        section=req.section
    )
    return verification

@app.get("/ai/sources/{source_id}")
def get_source_details(source_id: str):
    """
    Retrieves full source chunk details by ID
    """
    chunk = rag_service.retriever.get_chunk_by_id(source_id)
    if not chunk:
        raise HTTPException(status_code=404, detail="Legal source chunk not found")
    return chunk

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
