"""
Nyaya Setu AI Engine Microservice
FastAPI Application for Legal Research, Case Intelligence, and Multi-Agent Workflow
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
from .services.case_service import case_intelligence_service
from .agents.intake import IntakeAgent
from .agents.classification import ClassificationAgent
from .agents.evidence import EvidenceAgent
from .agents.risk import RiskUrgencyAgent
from .agents.verification import VerificationAgent
from .schemas.case_schemas import StructuredCaseState

app = FastAPI(
    title="Nyaya Setu Legal AI Engine",
    description="Case Intelligence Engine & Multi-Agent Legal Workflow Microservice",
    version=settings.version
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class StoryIntakeRequest(BaseModel):
    story: str = Field(..., description="Citizen narrative in English, Hindi, or Hinglish")
    existingFacts: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CaseAnalyzeRequest(BaseModel):
    story: str = Field(..., description="Citizen story or update")
    caseId: Optional[str] = None
    existingCase: Optional[Dict[str, Any]] = None

class ChatTurnRequest(BaseModel):
    message: str = Field(..., description="User message")
    conversationHistory: Optional[List[Dict[str, str]]] = Field(default_factory=list)
    currentCase: Optional[Dict[str, Any]] = None

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

# ----------------- Root & Health Endpoints -----------------

@app.get("/")
def root():
    return {
        "service": "Nyaya Setu Case Intelligence AI Engine",
        "status": "OPERATIONAL",
        "version": settings.version,
        "agents": [
            "PrivacyAgent",
            "IntakeAgent",
            "ClassificationAgent",
            "CaseAgent",
            "ResearchAgent",
            "EvidenceAgent",
            "RiskUrgencyAgent",
            "VerificationAgent",
            "DocumentAgent",
            "DraftingAgent",
            "LawyerMatchAgent"
        ],
        "workflow": "LangGraph Legal Orchestrator Active"
    }

@app.get("/health")
def health():
    return {
        "status": "HEALTHY",
        "service": "ai-engine",
        "domainsSupported": list(LegalDomainClassifier.DOMAINS.values()),
        "orchestrator": "LangGraph Multi-Agent Engine",
    }

# ----------------- Milestone 3 Case Intelligence Endpoints -----------------

@app.post("/ai/intake")
def process_intake(req: StoryIntakeRequest):
    """
    Intake Agent Endpoint: Parses narrative, extracts structured facts, identifies missing fields, and formulates clarifying questions.
    """
    if not req.story or not req.story.strip():
        raise HTTPException(status_code=400, detail="Story narrative cannot be empty")

    result = case_intelligence_service.process_story_intake(
        story=req.story,
        existing_facts=req.existingFacts
    )
    return result

@app.post("/ai/classify")
def classify_dispute(req: StoryIntakeRequest):
    """
    Classification Agent Endpoint: Determines domain, issue, case type, jurisdiction, and initial urgency.
    """
    intake_res = case_intelligence_service.process_story_intake(req.story)
    classification = case_intelligence_service.classify_story(intake_res)
    return classification

@app.post("/ai/case/analyze")
def analyze_case_end_to_end(req: CaseAnalyzeRequest):
    """
    End-to-End Multi-Agent Legal Workflow Endpoint:
    Privacy -> Intake -> Classification -> Case Builder -> Research -> Evidence -> Urgency -> Verification -> Synthesis
    """
    if not req.story or not req.story.strip():
        raise HTTPException(status_code=400, detail="Case story cannot be empty")

    existing_case_obj = None
    if req.existingCase:
        try:
            existing_case_obj = StructuredCaseState(**req.existingCase)
        except Exception:
            existing_case_obj = None

    output = case_intelligence_service.run_full_case_analysis(
        story=req.story,
        existing_case=existing_case_obj
    )
    return output

@app.post("/ai/chat")
def handle_chat_intake(req: ChatTurnRequest):
    """
    Conversational Case-Building Endpoint:
    Each turn updates the structured case object and returns an assistant response with tailored clarifying questions.
    """
    if not req.message or not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    result = case_intelligence_service.handle_conversational_turn(
        user_message=req.message,
        conversation_history=req.conversationHistory,
        current_case_dict=req.currentCase
    )
    return result

@app.post("/ai/evidence")
def audit_evidence(case_data: Dict[str, Any]):
    """
    Evidence Agent Endpoint: Generates evidence checklist and identifies missing proof for a given structured case.
    """
    try:
        case_obj = StructuredCaseState(**case_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid structured case payload: {e}")

    evidence_checklist = EvidenceAgent.audit_evidence(case_obj)
    return evidence_checklist

@app.post("/ai/urgency")
def evaluate_urgency(case_data: Dict[str, Any]):
    """
    Legal Urgency & Attention Indicator Endpoint: Evaluates 🟢 General / 🟡 Attention / 🔴 Urgent level.
    """
    try:
        case_obj = StructuredCaseState(**case_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid structured case payload: {e}")

    urgency = RiskUrgencyAgent.evaluate_urgency(case_obj)
    return urgency

@app.post("/ai/verify")
def verify_case_grounding(case_data: Dict[str, Any]):
    """
    Verification Agent Endpoint: Validates citation existence and ensures no hallucinated claims.
    """
    try:
        case_obj = StructuredCaseState(**case_data.get("case", case_data))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid structured case payload: {e}")

    verifier = VerificationAgent()
    report = verifier.verify_response_and_case(case_obj, research_result=case_data.get("research"))
    return report

# ----------------- Milestone 2 RAG Endpoints -----------------

@app.post("/ai/research")
def conduct_legal_research(req: ResearchRequest):
    rag_service = LegalRAGService()
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
    rag_service = LegalRAGService()
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
    rag_service = LegalRAGService()
    verification = rag_service.verifier.verify_citation(
        act=req.act,
        section=req.section
    )
    return verification

@app.get("/ai/domains")
def get_domains():
    rag_service = LegalRAGService()
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
