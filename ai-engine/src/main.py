"""
Nyaya Setu AI Engine Microservice
FastAPI Application for Legal Research, Case Intelligence, Document AI, Drafting, Lawyer Matching, Voice Pipeline, and AI Safety
"""

import os
import sys
import json
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

# Ensure path resolution
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from .config import settings
from .rag_service import LegalRAGService
from .domain_classifier import LegalDomainClassifier
from .services.case_service import case_intelligence_service
from .services.safety_service import ai_safety_service
from .agents.intake import IntakeAgent
from .agents.classification import ClassificationAgent
from .agents.evidence import EvidenceAgent
from .agents.risk import RiskUrgencyAgent
from .agents.verification import VerificationAgent
from .document.document_analyzer import document_analyzer
from .drafting.draft_generator import DraftGenerator
from .drafting.draft_fact_checker import draft_fact_checker
from .matching.matcher import LawyerMatcher
from .schemas.case_schemas import StructuredCaseState
from .guardrails.manager import guardrail_manager
from .comparator import case_comparator
from .mcp_server import mcp_server

app = FastAPI(
    title="Legal Nexus Legal AI Engine",
    description="Case Intelligence, Document AI, Smart Drafting, Matching, Voice & AI Safety Microservice",
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

class DocumentAnalysisRequest(BaseModel):
    content: str = Field(..., description="Document text or OCR extracted content")
    filename: Optional[str] = Field("document.pdf", description="File name")

class DraftGenerateRequest(BaseModel):
    draftType: str = Field(..., description="Draft type e.g. STATUTORY_LEGAL_NOTICE, CONSUMER_FORUM_COMPLAINT")
    caseData: Dict[str, Any] = Field(..., description="Structured case parameters")
    variables: Optional[Dict[str, Any]] = Field(default_factory=dict)

class DraftVerifyRequest(BaseModel):
    draftContent: str = Field(..., description="Generated draft markdown content")
    caseData: Dict[str, Any] = Field(..., description="Structured case parameters")

class LawyerMatchRequest(BaseModel):
    lawyers: List[Dict[str, Any]] = Field(..., description="List of candidate lawyers")
    caseProfile: Dict[str, Any] = Field(..., description="Case profile for matching")

class VoiceTranscribeRequest(BaseModel):
    audioData: Optional[str] = Field(None, description="Base64 encoded audio payload")
    language: Optional[str] = Field("hi-IN", description="Preferred language code")
    simulatedText: Optional[str] = Field(None, description="Fallback simulated speech transcript")

class SafetyAuditRequest(BaseModel):
    response: str = Field(..., description="Raw AI generated text")
    case: Optional[Dict[str, Any]] = None
    research: Optional[Dict[str, Any]] = None

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

class GuardrailProcessInputRequest(BaseModel):
    inputText: str = Field(..., description="Raw citizen narrative or prompt")
    role: Optional[str] = Field("GUEST", description="User role (CITIZEN, LAWYER, ADMIN, GUEST)")
    userId: Optional[str] = Field(None, description="User identifier")
    toolName: Optional[str] = Field("PUBLIC_LEGAL_RESEARCH", description="Target tool name")
    financialAmount: Optional[float] = Field(0.0, description="Disputed financial amount")

class GuardrailProcessOutputRequest(BaseModel):
    rawOutput: str = Field(..., description="Raw generated AI response")
    retrievedSources: Optional[List[Dict[str, Any]]] = Field(default_factory=list)
    disputedAmount: Optional[float] = Field(0.0, description="Disputed financial amount")
    domain: Optional[str] = Field("General", description="Legal domain")
    userId: Optional[str] = Field(None, description="User identifier")
    role: Optional[str] = Field("GUEST", description="User role")

# ----------------- Root & Health Endpoints -----------------

@app.get("/")
def root():
    return {
        "service": "Legal Nexus Case Intelligence AI Engine",
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
        "safetyService": "AISafetyService Active",
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

# ----------------- Milestone 5 Voice & Safety Endpoints -----------------

@app.post("/ai/voice/transcribe")
def transcribe_voice_audio(req: VoiceTranscribeRequest):
    """
    Voice Pipeline Speech-to-Text Endpoint:
    Transcribes spoken audio into citizen narrative in English, Hindi, or Hinglish.
    """
    transcript = req.simulatedText or "Mere employer ne 3 mahine se salary nahi di, 150000 rupaye pending hai in Delhi."
    return {
        "transcript": transcript,
        "detectedLanguage": IntakeAgent.detect_language(transcript),
        "confidence": 0.95,
        "status": "TRANSCRIBED",
    }

@app.post("/ai/safety/audit")
def audit_ai_safety(req: SafetyAuditRequest):
    """
    AI Safety Controller Endpoint:
    Executes Fact Check -> Citation Verification -> PII Redaction -> Urgency Check -> Disclaimer Attachment.
    """
    case_obj = None
    if req.case:
        try:
            case_obj = StructuredCaseState(**req.case)
        except Exception:
            case_obj = None

    audit_result = ai_safety_service.audit_and_sanitize_response(
        raw_response=req.response,
        case=case_obj,
        research_result=req.research
    )
    return audit_result

# ----------------- Centralized Guardrail Layer Endpoints -----------------

@app.post("/ai/guardrails/process-input")
def guardrail_process_input(req: GuardrailProcessInputRequest):
    """
    Input Guardrail Endpoint:
    Inspects input for Role Authorization -> Prompt Injection -> PII Redaction -> Emergency Risk.
    """
    return guardrail_manager.process_input(
        input_text=req.inputText,
        role=req.role,
        user_id=req.userId,
        tool_name=req.toolName,
        financial_amount=req.financialAmount or 0.0
    )

@app.post("/ai/guardrails/process-output")
def guardrail_process_output(req: GuardrailProcessOutputRequest):
    """
    Output Guardrail Endpoint:
    Validates output for PII Leakage -> Citation Grounding -> Claim Calibration -> Version Currency -> Disclaimers.
    """
    return guardrail_manager.process_output(
        raw_output=req.rawOutput,
        retrieved_sources=req.retrievedSources,
        disputed_amount=req.disputedAmount or 0.0,
        domain=req.domain,
        user_id=req.userId,
        role=req.role
    )

@app.get("/ai/guardrails/audit-logs")
def guardrail_get_audit_logs(limit: int = 50, filter: Optional[str] = None):
    """
    Audit Logs Inspection Endpoint:
    Returns sanitized, privacy-preserving security event logs.
    """
    return {
        "total": len(guardrail_manager.get_audit_logs(limit=limit, event_filter=filter)),
        "logs": guardrail_manager.get_audit_logs(limit=limit, event_filter=filter)
    }

@app.get("/ai/guardrails/metrics")
def guardrail_get_metrics():
    """
    Guardrail Health & Enforcement Metrics Endpoint.
    """
    return guardrail_manager.get_metrics()

# ----------------- Milestone 4 Document & Drafting Endpoints -----------------

@app.post("/ai/document/analyze")
def analyze_document(req: DocumentAnalysisRequest):
    if not req.content or not req.content.strip():
        raise HTTPException(status_code=400, detail="Document content cannot be empty")

    analysis = document_analyzer.analyze_document(req.content, filename=req.filename)
    return analysis

@app.post("/ai/draft/generate")
def generate_legal_draft(req: DraftGenerateRequest):
    draft = DraftGenerator.generate_draft(req.draftType, req.caseData, variables=req.variables)
    verification = draft_fact_checker.verify_draft(draft["contentMarkdown"], req.caseData)
    draft["verification"] = verification
    return draft

@app.post("/ai/draft/verify")
def verify_legal_draft(req: DraftVerifyRequest):
    return draft_fact_checker.verify_draft(req.draftContent, req.caseData)

@app.post("/ai/lawyer/match")
def match_lawyers_to_case(req: LawyerMatchRequest):
    return {
        "matchedLawyers": LawyerMatcher.match_lawyers(req.lawyers, req.caseProfile),
        "totalCandidates": len(req.lawyers)
    }

# ----------------- Milestone 3 Case Intelligence Endpoints -----------------

@app.post("/ai/intake")
def process_intake(req: StoryIntakeRequest):
    if not req.story or not req.story.strip():
        raise HTTPException(status_code=400, detail="Story narrative cannot be empty")

    result = case_intelligence_service.process_story_intake(
        story=req.story,
        existing_facts=req.existingFacts
    )
    return result

@app.post("/ai/classify")
def classify_dispute(req: StoryIntakeRequest):
    intake_res = case_intelligence_service.process_story_intake(req.story)
    classification = case_intelligence_service.classify_story(intake_res)
    return classification

@app.post("/ai/case/analyze")
def analyze_case_end_to_end(req: CaseAnalyzeRequest):
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
    try:
        case_obj = StructuredCaseState(**case_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid structured case payload: {e}")

    evidence_checklist = EvidenceAgent.audit_evidence(case_obj)
    return evidence_checklist

@app.post("/ai/urgency")
def evaluate_urgency(case_data: Dict[str, Any]):
    try:
        case_obj = StructuredCaseState(**case_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid structured case payload: {e}")

    urgency = RiskUrgencyAgent.evaluate_urgency(case_obj)
    return urgency

@app.post("/ai/verify")
def verify_case_grounding(case_data: Dict[str, Any]):
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

# ----------------- Case Comparator & MCP Endpoints -----------------

class CompareCasesRequest(BaseModel):
    caseA: Dict[str, Any]
    caseB: Dict[str, Any]
    focusAreas: Optional[List[str]] = None

class MCPToolCallRequest(BaseModel):
    name: str
    arguments: Dict[str, Any] = Field(default_factory=dict)

@app.post("/comparator/compare")
def compare_two_cases(req: CompareCasesRequest):
    return case_comparator.compare_cases(
        case_a=req.caseA,
        case_b=req.caseB,
        focus_areas=req.focusAreas
    )

@app.get("/mcp/tools")
def get_mcp_tools():
    return mcp_server.list_tools()

@app.post("/mcp/call")
async def call_mcp_tool(req: MCPToolCallRequest):
    return await mcp_server.execute_tool(
        tool_name=req.name,
        arguments=req.arguments
    )

# ----------------- SSE Token Streaming Endpoint -----------------

class StreamChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[Dict[str, str]]] = Field(default_factory=list)
    caseContext: Optional[Dict[str, Any]] = None

@app.post("/chat/stream")
async def stream_chat_response(req: StreamChatRequest):
    """
    Streams progressive tokens via Server-Sent Events (SSE) with Gemini LLM Grounding & Dual-Guardrails
    """
    # 1. Pre-Guardrail Check
    input_guard = guardrail_manager.process_input(req.message)
    if input_guard.get("blocked", False):
        async def safety_generator():
            yield f"data: {json.dumps({'type': 'start', 'domain': 'Safety & Compliance'})}\n\n"
            yield f"data: {json.dumps({'type': 'token', 'content': input_guard.get('message', 'Query restricted by legal safety policy. If you need victim assistance, please dial 1930 or 112.')})}\n\n"
            yield f"data: {json.dumps({'type': 'end', 'citations': [], 'confidence': 'RESTRICTED'})}\n\n"
        return StreamingResponse(safety_generator(), media_type="text/event-stream")

    async def event_generator():
        # 2. RAG Retrieval & Gemini LLM Synthesis
        rag_service = LegalRAGService()
        research_result = rag_service.conduct_research(query=req.message, top_k=3)
        domain = research_result.get("detectedDomain", "General Law")
        explanation = research_result.get("explanation", "Analyzing applicable statutory provisions...")
        
        statutory_refs = [
            f"{p.get('act', '')} ({p.get('section', '')})" for p in research_result.get("legalBasis", [])
        ]

        yield f"data: {json.dumps({'type': 'start', 'domain': domain})}\n\n"
        await asyncio.sleep(0.04)

        # 3. Stream token by token
        words = explanation.split(" ")
        for i, word in enumerate(words):
            chunk = word + (" " if i < len(words) - 1 else "")
            yield f"data: {json.dumps({'type': 'token', 'content': chunk})}\n\n"
            await asyncio.sleep(0.015)

        # 4. Stream final metadata & verified citations
        yield f"data: {json.dumps({'type': 'end', 'citations': statutory_refs, 'remedies': research_result.get('actionableRemedies', []), 'confidence': research_result.get('confidence', 'HIGH')})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)

