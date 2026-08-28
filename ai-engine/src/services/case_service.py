"""
Case Intelligence Service
Exposes business methods for conversational case intake and multi-agent legal analysis with centralized Guardrail enforcement
"""

from typing import Dict, Any, List
from ..agents.intake import IntakeAgent
from ..agents.classification import ClassificationAgent
from ..agents.case import CaseAgent
from ..agents.evidence import EvidenceAgent
from ..agents.risk import RiskUrgencyAgent
from ..agents.verification import VerificationAgent
from ..guardrails.manager import guardrail_manager
from ..graph.legal_workflow import legal_workflow
from ..schemas.case_schemas import StructuredCaseState, IntakeResult, LegalWorkflowOutput

class CaseIntelligenceService:
    @staticmethod
    def process_story_intake(story: str, existing_facts: Dict[str, Any] = None) -> IntakeResult:
        guard_res = guardrail_manager.process_input(story, tool_name="STORY_INTAKE")
        if guard_res.get("blocked", False):
            return IntakeResult(
                extractedFacts={},
                detectedLanguage="en",
                domain="Security & Safety Violation",
                issue=guard_res.get("status", "Blocked"),
                missingFields=[],
                clarifyingQuestions=[],
                redactedText="[BLOCKED_BY_GUARDRAIL]"
            )
        return IntakeAgent.process_intake(guard_res["sanitized_text"], existing_facts=existing_facts)

    @staticmethod
    def classify_story(intake_result: IntakeResult) -> Dict[str, Any]:
        return ClassificationAgent.classify_case(intake_result)

    @staticmethod
    def run_full_case_analysis(story: str, existing_case: StructuredCaseState = None) -> LegalWorkflowOutput:
        # Reset any previously blocked case
        if existing_case and (getattr(existing_case, 'status', '') == 'BLOCKED' or getattr(existing_case, 'caseNumber', '') == 'BLOCKED-SECURITY'):
            existing_case = None
        return legal_workflow.execute(story, existing_case=existing_case)

    @staticmethod
    def handle_conversational_turn(
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        current_case_dict: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """
        Processes a conversational message, checks input guardrails, extracts new facts, and returns assistant reply
        """
        # 1. Input Guardrail Inspection (Blocks Injection / Harm / System Overrides)
        guard_input = guardrail_manager.process_input(user_message, tool_name="CHAT_INTAKE")
        if guard_input.get("blocked", False):
            refusal_msg = guard_input.get("error_message") or "⚠️ Security Alert: Input blocked by Legal Nexus Guardrail Layer."
            return {
                "reply": refusal_msg,
                "clarifyingQuestions": [],
                "structuredCase": {
                    "caseNumber": "BLOCKED-SECURITY",
                    "category": "Security & Safety Violation",
                    "issue": guard_input.get("status", "Blocked"),
                    "status": "BLOCKED"
                },
                "detectedDomain": "Security & Safety Violation",
                "urgency": {
                    "urgencyLevel": "ATTENTION_RECOMMENDED",
                    "colorCode": "RED",
                    "score": 0.95,
                    "recommendation": refusal_msg
                },
                "evidenceChecklist": {"available": [], "missing": [], "recommended": []},
                "legalBasis": [],
                "actionPlan": [{"step": "Security Notice", "detail": refusal_msg}],
                "blocked": True,
                "guardrailStatus": guard_input.get("status", "BLOCKED_BY_GUARDRAIL")
            }

        # Parse current case state if provided
        existing_case = None
        if current_case_dict:
            try:
                # Reset if previous case was blocked
                if current_case_dict.get("status") == "BLOCKED" or current_case_dict.get("caseNumber") == "BLOCKED-SECURITY":
                    existing_case = None
                else:
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

        # If output was blocked in workflow
        if case.status == "BLOCKED":
            return {
                "reply": output.responseExplanation,
                "clarifyingQuestions": [],
                "structuredCase": case.model_dump(),
                "detectedDomain": intake.domain,
                "urgency": urgency.model_dump(),
                "evidenceChecklist": output.evidence.model_dump(),
                "legalBasis": [],
                "actionPlan": output.actionPlan,
                "blocked": True
            }

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

        # Run output guardrail validation
        guard_output = guardrail_manager.process_output(
            raw_output=reply_text,
            retrieved_sources=research.get("legalBasis", []),
            domain=case.category
        )

        return {
            "reply": guard_output["safe_response"],
            "clarifyingQuestions": intake.clarifyingQuestions,
            "structuredCase": case.model_dump(),
            "detectedDomain": intake.domain,
            "urgency": urgency.model_dump(),
            "evidenceChecklist": output.evidence.model_dump(),
            "legalBasis": research.get("legalBasis", []),
            "actionPlan": output.actionPlan,
            "guardrailAuditId": guard_output.get("audit_id"),
        }

case_intelligence_service = CaseIntelligenceService()
