"""
Test Suite for Centralized Prompt Layer in Legal Nexus
Verifies:
  1. Task template coverage for all 7 required legal tasks
  2. Strict response instructions & grounding directives
  3. Temperature configurations and dynamic env overrides
  4. PromptBuilder context and RAG binding
  5. Anti-hallucination & calibrated advisory constraints
  6. Strict naming integrity (Legal Nexus only)
"""

import os
import unittest
from unittest.mock import patch
from src.prompt_layer import (
    LegalTaskType,
    PromptManager,
    PromptBuilder,
    prompt_manager,
    prompt_settings,
    UNIVERSAL_LEGAL_DIRECTIVES,
    CITIZEN_LEGAL_ASSISTANT_PROMPT,
    LEGAL_RESEARCH_PROMPT,
    CASE_ANALYSIS_PROMPT,
    DOCUMENT_ANALYSIS_PROMPT,
    EVIDENCE_ANALYSIS_PROMPT,
    DRAFT_GENERATION_PROMPT,
    LAWYER_ASSISTANT_PROMPT,
)


class TestPromptLayer(unittest.TestCase):
    def setUp(self):
        self.manager = PromptManager()

    # ─── 1. TEMPLATE COVERAGE TESTS ───────────────────────────────────────────

    def test_all_task_types_defined(self):
        """Verify all 7 required tasks are defined in the enum."""
        required_tasks = [
            LegalTaskType.CITIZEN_LEGAL_ASSISTANT,
            LegalTaskType.LEGAL_RESEARCH,
            LegalTaskType.CASE_ANALYSIS,
            LegalTaskType.DOCUMENT_ANALYSIS,
            LegalTaskType.EVIDENCE_ANALYSIS,
            LegalTaskType.DRAFT_GENERATION,
            LegalTaskType.LAWYER_ASSISTANT,
        ]
        for task in required_tasks:
            self.assertIn(task, LegalTaskType)

    def test_templates_non_empty(self):
        """Ensure all prompt templates contain substantial guidance."""
        templates = [
            UNIVERSAL_LEGAL_DIRECTIVES,
            CITIZEN_LEGAL_ASSISTANT_PROMPT,
            LEGAL_RESEARCH_PROMPT,
            CASE_ANALYSIS_PROMPT,
            DOCUMENT_ANALYSIS_PROMPT,
            EVIDENCE_ANALYSIS_PROMPT,
            DRAFT_GENERATION_PROMPT,
            LAWYER_ASSISTANT_PROMPT,
        ]
        for tmpl in templates:
            self.assertIsInstance(tmpl, str)
            self.assertGreater(len(tmpl.strip()), 100)

    # ─── 2. RESPONSE INSTRUCTIONS & DIRECTIVES TESTS ──────────────────────────

    def test_anti_hallucination_directive_present(self):
        """Universal directives must strictly prohibit fabricating laws, sections, or citations."""
        self.assertIn("NEVER fabricate acts, statutory sections", UNIVERSAL_LEGAL_DIRECTIVES)
        self.assertIn("ABSOLUTE ANTI-HALLUCINATION", UNIVERSAL_LEGAL_DIRECTIVES)

    def test_calibrated_advisory_tone_present(self):
        """Universal directives must prohibit absolute guarantees and enforce calibrated phrasing."""
        self.assertIn("CALIBRATED ADVISORY TONE", UNIVERSAL_LEGAL_DIRECTIVES)
        self.assertIn("Never provide absolute or definitive legal guarantees", UNIVERSAL_LEGAL_DIRECTIVES)

    def test_structured_separation_present(self):
        """Must require clear distinction between facts, legal sources, analysis, and actions."""
        self.assertIn("CLEAR STRUCTURAL SEPARATION", UNIVERSAL_LEGAL_DIRECTIVES)
        self.assertIn("Stated Facts", UNIVERSAL_LEGAL_DIRECTIVES)
        self.assertIn("Authoritative Legal Basis", UNIVERSAL_LEGAL_DIRECTIVES)

    def test_citizen_assistant_simple_language_directive(self):
        """Citizen assistant must enforce plain language explanations and clear headings."""
        payload = self.manager.get_citizen_assistant_prompt(
            user_message="My employer has not paid my salary for 2 months."
        )
        sys_prompt = payload["system_prompt"]
        self.assertIn("plain, simple, and accessible language", sys_prompt)
        self.assertIn("### 1. Summary of Your Grievance", sys_prompt)
        self.assertIn("### 2. Your Legal Rights & Governing Law", sys_prompt)
        self.assertIn("### 3. Immediate Action Plan", sys_prompt)

    def test_legal_research_rag_primary_basis_directive(self):
        """Legal research prompt must treat RAG retrieved statutory chunks as primary source of truth."""
        payload = self.manager.get_legal_research_prompt(
            query="What is the remedy for delayed wage payment?",
            rag_chunks=[
                {
                    "act": "Payment of Wages Act, 1936",
                    "section": "Section 15",
                    "statutorySnippet": "Claims arising out of deductions from wages...",
                    "actionableRemedy": "File claim before Labour Authority.",
                }
            ],
        )
        sys_prompt = payload["system_prompt"]
        user_prompt = payload["user_prompt"]
        self.assertIn("Treat the provided RAG statutory chunks", sys_prompt)
        self.assertIn("Payment of Wages Act, 1936", user_prompt)
        self.assertIn("Section 15", user_prompt)

    def test_draft_generation_disclaimer_and_structure(self):
        """Draft generation must enforce structured formal layout and safety disclaimer."""
        payload = self.manager.get_draft_generation_prompt(
            draft_type="STATUTORY_LEGAL_NOTICE",
            case_data={
                "caseNumber": "NYA-20260829-1001",
                "issue": "Unpaid Salary",
                "parties": {"plaintiff": "A. Kumar", "defendant": "Tech Corp"},
            },
        )
        sys_prompt = payload["system_prompt"]
        self.assertIn("FORMAL TITLE OF LEGAL DOCUMENT", sys_prompt)
        self.assertIn("Disclaimer: This draft was structured by Legal Nexus", sys_prompt)

    # ─── 3. TEMPERATURE CONFIGURATION TESTS ───────────────────────────────────

    def test_default_temperature_ranges(self):
        """Verify default temperatures align with task precision requirements."""
        # Factual research, case analysis, doc analysis, verification: 0.1 - 0.2
        self.assertLessEqual(
            prompt_settings.get_temperature_for_task(LegalTaskType.LEGAL_RESEARCH), 0.2
        )
        self.assertGreaterEqual(
            prompt_settings.get_temperature_for_task(LegalTaskType.LEGAL_RESEARCH), 0.1
        )

        self.assertLessEqual(
            prompt_settings.get_temperature_for_task(LegalTaskType.CASE_ANALYSIS), 0.2
        )
        self.assertLessEqual(
            prompt_settings.get_temperature_for_task(LegalTaskType.DOCUMENT_ANALYSIS), 0.2
        )
        self.assertLessEqual(
            prompt_settings.get_temperature_for_task(LegalTaskType.VERIFICATION), 0.2
        )

        # Draft generation: 0.2 - 0.4
        draft_temp = prompt_settings.get_temperature_for_task(LegalTaskType.DRAFT_GENERATION)
        self.assertGreaterEqual(draft_temp, 0.2)
        self.assertLessEqual(draft_temp, 0.4)

        # Conversational / Citizen assistant: 0.3 - 0.5
        chat_temp = prompt_settings.get_temperature_for_task(
            LegalTaskType.CITIZEN_LEGAL_ASSISTANT
        )
        self.assertGreaterEqual(chat_temp, 0.3)
        self.assertLessEqual(chat_temp, 0.5)

    def test_environment_temperature_override(self):
        """Temperature settings must be configurable via environment variables."""
        with patch.dict(os.environ, {"PROMPT_TEMP_LEGAL_RESEARCH": "0.05", "PROMPT_TEMP_DRAFT_GENERATION": "0.33"}):
            from src.prompt_layer.config import PromptLayerSettings
            custom_settings = PromptLayerSettings()
            self.assertEqual(custom_settings.get_temperature_for_task(LegalTaskType.LEGAL_RESEARCH), 0.05)
            self.assertEqual(custom_settings.get_temperature_for_task(LegalTaskType.DRAFT_GENERATION), 0.33)

    # ─── 4. PROMPT BUILDER CONTEXT BINDING ────────────────────────────────────

    def test_prompt_builder_binding(self):
        """PromptBuilder must correctly bind RAG context, facts, and conversation history."""
        builder = (
            PromptBuilder(LegalTaskType.CASE_ANALYSIS)
            .with_user_message("Landlord withheld deposit in Bangalore.")
            .with_case_facts({"caseNumber": "NYA-TEST-01", "category": "Property"})
            .with_rag_context([{"act": "Transfer of Property Act", "section": "Section 108"}])
            .with_conversation_history([
                {"role": "user", "content": "Hello"},
                {"role": "assistant", "content": "How can I assist you?"},
            ])
            .with_user_role("CITIZEN")
        )
        payload = builder.build()

        self.assertEqual(payload["task_type"], "case_analysis")
        self.assertIn("Transfer of Property Act", payload["user_prompt"])
        self.assertIn("NYA-TEST-01", payload["user_prompt"])
        self.assertEqual(len(payload["messages"]), 4)  # system + 2 history + user

    # ─── 5. STRICT NAMING INTEGRITY TEST ──────────────────────────────────────

    def test_strict_legal_nexus_naming(self):
        """Must use 'Legal Nexus' exclusively and NEVER contain 'Nyaya Setu'."""
        all_text_to_check = [
            UNIVERSAL_LEGAL_DIRECTIVES,
            CITIZEN_LEGAL_ASSISTANT_PROMPT,
            LEGAL_RESEARCH_PROMPT,
            CASE_ANALYSIS_PROMPT,
            DOCUMENT_ANALYSIS_PROMPT,
            EVIDENCE_ANALYSIS_PROMPT,
            DRAFT_GENERATION_PROMPT,
            LAWYER_ASSISTANT_PROMPT,
            prompt_settings.platform_name,
        ]
        for text in all_text_to_check:
            self.assertNotIn("Nyaya Setu", text, "Found deprecated name 'Nyaya Setu' in prompt layer!")
            self.assertIn("Legal Nexus", text)


if __name__ == "__main__":
    unittest.main()
