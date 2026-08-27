"""
LangGraph Legal Workflow State Definitions
"""

from typing import Dict, List, Any, Optional, TypedDict
from ..schemas.case_schemas import (
    StructuredCaseState,
    IntakeResult,
    EvidenceChecklist,
    UrgencyAssessment,
    VerificationReport,
    LegalWorkflowOutput
)

class LegalGraphState(TypedDict, total=False):
    # User input narrative / query
    raw_input: str
    user_id: Optional[str]
    case_id: Optional[str]
    language: str
    
    # Redacted text
    redacted_input: str
    pii_counts: Dict[str, int]
    
    # Agent Outputs
    intake_result: IntakeResult
    classification: Dict[str, Any]
    case_state: StructuredCaseState
    needs_research: bool
    research_result: Optional[Dict[str, Any]]
    evidence_checklist: EvidenceChecklist
    urgency_assessment: UrgencyAssessment
    verification_report: VerificationReport
    
    # Final Synthesized Output
    response_explanation: str
    action_plan: List[Dict[str, Any]]
    workflow_output: LegalWorkflowOutput
    errors: List[str]
