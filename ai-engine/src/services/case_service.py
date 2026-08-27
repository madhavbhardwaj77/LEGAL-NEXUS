"""
Case Intelligence Service
Exposes business methods for conversational case intake and multi-agent legal analysis
"""

from typing import Dict, Any, List
from ..agents.intake import IntakeAgent
from ..agents.classification import ClassificationAgent
from ..agents.case import CaseAgent
from ..agents.evidence import EvidenceAgent
from ..agents.risk import RiskUrgencyAgent
from ..agents.verification import VerificationAgent
from ..graph.legal_workflow import legal_workflow
from ..schemas.case_schemas import StructuredCaseState, IntakeResult, LegalWorkflowOutput

class CaseIntelligenceService:
    @staticmethod
    def process_story_intake(story: str, existing_facts: Dict[str, Any] = None) -> IntakeResult:
        return IntakeAgent.process_intake(story, existing_facts=existing_facts)

    @staticmethod
    def classify_story(intake_result: IntakeResult) -> Dict[str, Any]:
        return ClassificationAgent.classify_case(intake_result)

    @staticmethod
    def run_full_case_analysis(story: str, existing_case: StructuredCaseState = None) -> LegalWorkflowOutput:
        return legal_workflow.execute(story, existing_case=existing_case)

    @staticmethod
    def handle_conversational_turn(
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        current_case_dict: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Processes a conversational message, extracts new facts, and returns assistant reply with updated case state
        """
        # Parse current case state if provided
        existing_case = None
        if current_case_dict:
            try:
                existing_case = StructuredCaseState(**current_case_dict)
            except Exception:
                existing_case = None

        # Execute full multi-agent workflow
        output = legal_workflow.execute(user_message, existing_case=existing_case)

        # Build natural conversational response
        intake = output.intake
        case = output.case
        urgency = output.urgency
        research = output.research or {}

        # If missing critical info, ask the top clarifying question
        if intake.clarifyingQuestions:
            top_q = intake.clarifyingQuestions[0]
            reply_text = (
                f"I understand your concern regarding {case.issue}. "
                f"I have noted your details under case reference {case.caseNumber}.\n\n"
                f"{top_q}"
            )
        else:
            provisions_str = ", ".join([p.get("section", "") for p in research.get("legalBasis", [])[:2]])
            reply_text = (
                f"Thank you for the complete details. Under Indian law ({case.category}), "
                f"your situation is protected under {provisions_str}. "
                f"{urgency.recommendation}"
            )

        return {
            "reply": reply_text,
            "clarifyingQuestions": intake.clarifyingQuestions,
            "structuredCase": case.model_dump(),
            "detectedDomain": intake.domain,
            "urgency": urgency.model_dump(),
            "evidenceChecklist": output.evidence.model_dump(),
            "legalBasis": research.get("legalBasis", []),
            "actionPlan": output.actionPlan,
        }

case_intelligence_service = CaseIntelligenceService()
