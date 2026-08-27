"""
Pydantic Schemas for Case Intelligence Engine and Multi-Agent Workflow
"""

from typing import Dict, List, Optional, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

class FactItem(BaseModel):
    field: str
    value: Any
    source: str = "CITIZEN_INPUT"
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    confidence: float = 0.90

class PartyInfo(BaseModel):
    plaintiff: Optional[str] = None
    defendant: Optional[str] = None
    employer: Optional[str] = None
    landlord: Optional[str] = None
    merchant: Optional[str] = None
    location: Optional[str] = None

class TimelineItem(BaseModel):
    eventType: str
    title: str
    date: Optional[str] = None
    description: str

class EvidenceItem(BaseModel):
    name: str
    category: str = "DOCUMENT"
    status: str = "MISSING"  # AVAILABLE | MISSING | RECOMMENDED
    importance: str = "HIGH"  # CRITICAL | HIGH | MEDIUM
    purpose: str

class EvidenceChecklist(BaseModel):
    available: List[EvidenceItem] = []
    missing: List[EvidenceItem] = []
    recommended: List[EvidenceItem] = []

class UrgencyAssessment(BaseModel):
    urgencyLevel: str = "GENERAL_GUIDANCE"  # GENERAL_GUIDANCE | ATTENTION_RECOMMENDED | URGENT_ASSISTANCE
    score: float = 0.2
    triggers: List[str] = []
    recommendation: str = "Standard legal dispute process; no emergency trigger detected."
    colorCode: str = "GREEN"  # GREEN | YELLOW | RED

class StructuredCaseState(BaseModel):
    caseNumber: Optional[str] = None
    category: str = "General"
    issue: str = "Legal Dispute"
    jurisdiction: str = "India"
    parties: PartyInfo = Field(default_factory=PartyInfo)
    facts: Dict[str, FactItem] = Field(default_factory=dict)
    timeline: List[TimelineItem] = Field(default_factory=list)
    financialDetails: Dict[str, Any] = Field(default_factory=dict)
    urgency: UrgencyAssessment = Field(default_factory=UrgencyAssessment)
    missingInformation: List[str] = Field(default_factory=list)
    potentialRoutes: List[str] = Field(default_factory=list)
    status: str = "DRAFT"

class IntakeResult(BaseModel):
    extractedFacts: Dict[str, Any]
    detectedLanguage: str = "en"  # en | hi | hinglish
    domain: str
    issue: str
    missingFields: List[str] = []
    clarifyingQuestions: List[str] = []
    redactedText: str

class VerificationReport(BaseModel):
    valid: bool = True
    groundingScore: float = 1.0
    citationsVerified: List[Dict[str, Any]] = []
    unsupportedClaims: List[str] = []
    status: str = "APPROVED"

class LegalWorkflowOutput(BaseModel):
    case: StructuredCaseState
    intake: IntakeResult
    research: Optional[Dict[str, Any]] = None
    evidence: EvidenceChecklist
    urgency: UrgencyAssessment
    verification: VerificationReport
    responseExplanation: str
    actionPlan: List[Dict[str, Any]] = []
