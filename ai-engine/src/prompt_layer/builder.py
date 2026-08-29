"""
Prompt Builder for Legal Nexus AI System
Composes context-aware, structured prompts by binding system directives,
retrieved RAG legal chunks, structured case facts, and user messages.
"""

from typing import Dict, Any, List, Optional
from .config import LegalTaskType, prompt_settings
from .templates import (
    UNIVERSAL_LEGAL_DIRECTIVES,
    CITIZEN_LEGAL_ASSISTANT_PROMPT,
    LEGAL_RESEARCH_PROMPT,
    CASE_ANALYSIS_PROMPT,
    DOCUMENT_ANALYSIS_PROMPT,
    EVIDENCE_ANALYSIS_PROMPT,
    DRAFT_GENERATION_PROMPT,
    LAWYER_ASSISTANT_PROMPT,
)


class PromptBuilder:
    """
    Fluent builder to construct prompt payloads for LLM inference.
    """

    TASK_TEMPLATE_MAP = {
        LegalTaskType.CITIZEN_LEGAL_ASSISTANT: CITIZEN_LEGAL_ASSISTANT_PROMPT,
        LegalTaskType.LEGAL_RESEARCH: LEGAL_RESEARCH_PROMPT,
        LegalTaskType.CASE_ANALYSIS: CASE_ANALYSIS_PROMPT,
        LegalTaskType.DOCUMENT_ANALYSIS: DOCUMENT_ANALYSIS_PROMPT,
        LegalTaskType.EVIDENCE_ANALYSIS: EVIDENCE_ANALYSIS_PROMPT,
        LegalTaskType.DRAFT_GENERATION: DRAFT_GENERATION_PROMPT,
        LegalTaskType.LAWYER_ASSISTANT: LAWYER_ASSISTANT_PROMPT,
        LegalTaskType.INTAKE_EXTRACTION: CITIZEN_LEGAL_ASSISTANT_PROMPT,
        LegalTaskType.VERIFICATION: LEGAL_RESEARCH_PROMPT,
    }

    def __init__(self, task_type: LegalTaskType):
        self.task_type = task_type
        self.raw_system_template = self.TASK_TEMPLATE_MAP.get(
            task_type, CITIZEN_LEGAL_ASSISTANT_PROMPT
        )
        self.rag_context_chunks: List[Dict[str, Any]] = []
        self.case_facts: Optional[Dict[str, Any]] = None
        self.user_message: str = ""
        self.conversation_history: List[Dict[str, str]] = []
        self.additional_instructions: List[str] = []
        self.user_role: str = "CITIZEN"
        self.language: str = "en"

    def with_rag_context(self, chunks: List[Dict[str, Any]]) -> "PromptBuilder":
        """Attach authoritative retrieved legal chunks from hybrid RAG service."""
        if chunks:
            self.rag_context_chunks.extend(chunks)
        return self

    def with_case_facts(self, case_dict: Dict[str, Any]) -> "PromptBuilder":
        """Attach structured case profile facts."""
        self.case_facts = case_dict
        return self

    def with_user_message(self, message: str) -> "PromptBuilder":
        """Set primary user grievance or prompt."""
        self.user_message = message or ""
        return self

    def with_conversation_history(
        self, history: List[Dict[str, str]]
    ) -> "PromptBuilder":
        """Attach multi-turn conversation memory."""
        if history:
            self.conversation_history = history
        return self

    def with_user_role(self, role: str) -> "PromptBuilder":
        """Set user role (CITIZEN, LAWYER, ADMIN, LAW_STUDENT)."""
        self.user_role = (role or "CITIZEN").upper()
        return self

    def with_language(self, language: str) -> "PromptBuilder":
        """Set preferred language code (en, hi, etc.)."""
        self.language = language or "en"
        return self

    def add_instruction(self, instruction: str) -> "PromptBuilder":
        """Append extra runtime constraint or formatting instruction."""
        if instruction:
            self.additional_instructions.append(instruction)
        return self

    def _format_rag_section(self) -> str:
        """Formats retrieved legal chunks into an authoritative reference block."""
        if not self.rag_context_chunks:
            return "No verified statutory provisions retrieved for this query. Exercise caution and state general legal principles."

        formatted = ["=== AUTHORITATIVE RETRIEVED LEGAL SOURCES (PRIMARY SOURCE OF TRUTH) ==="]
        for idx, chunk in enumerate(self.rag_context_chunks, 1):
            act = chunk.get("act", chunk.get("act_name", "Statute of India"))
            section = chunk.get("section", chunk.get("section_number", "General Provision"))
            title = chunk.get("sectionTitle", chunk.get("title", ""))
            snippet = chunk.get("statutorySnippet", chunk.get("content", chunk.get("text", "")))
            remedy = chunk.get("actionableRemedy", "")

            entry = f"[{idx}] {act} — {section}"
            if title:
                entry += f": {title}"
            entry += f"\n    Statutory Text: \"{snippet}\""
            if remedy:
                entry += f"\n    Statutory Remedy: {remedy}"
            formatted.append(entry)

        formatted.append("=======================================================================")
        return "\n".join(formatted)

    def _format_case_section(self) -> str:
        """Formats structured case facts into a reference block."""
        if not self.case_facts:
            return ""

        lines = ["=== CURRENT STRUCTURED CASE FACTS ==="]
        for key in ("caseNumber", "category", "issue", "jurisdiction", "urgency", "financialDetails"):
            if key in self.case_facts:
                lines.append(f"- {key}: {self.case_facts[key]}")

        if "parties" in self.case_facts and isinstance(self.case_facts["parties"], dict):
            parties = self.case_facts["parties"]
            p_name = parties.get("plaintiff", {}).get("name") if isinstance(parties.get("plaintiff"), dict) else parties.get("plaintiff")
            d_name = parties.get("defendant", {}).get("name") if isinstance(parties.get("defendant"), dict) else parties.get("defendant")
            if p_name:
                lines.append(f"- Plaintiff / Claimant: {p_name}")
            if d_name:
                lines.append(f"- Defendant / Opposing Party: {d_name}")

        lines.append("======================================")
        return "\n".join(lines)

    def build_system_prompt(self) -> str:
        """
        Builds the complete system prompt with embedded directives and role adjustments.
        """
        system_content = self.raw_system_template.format(
            universal_directives=UNIVERSAL_LEGAL_DIRECTIVES
        ).strip()

        # Append role and language instructions if applicable
        additions = []
        if self.user_role in ("LAWYER", "LAW_STUDENT"):
            additions.append("USER ROLE NOTICE: The user is a qualified legal professional / law student. Use precise legal nomenclature, statutory interpretations, and procedural strategies.")
        elif self.user_role == "CITIZEN":
            additions.append("USER ROLE NOTICE: The user is a citizen seeking legal aid. Keep legal concepts straightforward, empowering, and easily understandable.")

        if self.language in ("hi", "hi-IN", "hindi"):
            additions.append("LANGUAGE INSTRUCTION: The user prefers Hindi. You may provide your response in clear, formal Hindi or Hinglish with English statutory citations in brackets.")

        if self.additional_instructions:
            additions.extend(self.additional_instructions)

        if additions:
            system_content += "\n\n=== RUNTIME TASK MODIFIERS ===\n" + "\n".join(f"- {a}" for a in additions)

        return system_content

    def build_user_prompt(self) -> str:
        """
        Builds the user prompt containing user message, RAG context, and case facts.
        """
        sections = []

        # 1. RAG Context (if provided)
        if self.rag_context_chunks:
            sections.append(self._format_rag_section())

        # 2. Case Facts (if provided)
        case_block = self._format_case_section()
        if case_block:
            sections.append(case_block)

        # 3. User Message / Query
        if self.user_message:
            sections.append(f"USER QUERY / STATEMENT:\n{self.user_message.strip()}")

        return "\n\n".join(sections)

    def build(self) -> Dict[str, Any]:
        """
        Constructs the final payload ready for LLM consumption, including
        system prompt, user prompt, and temperature configuration.
        """
        system_prompt = self.build_system_prompt()
        user_prompt = self.build_user_prompt()
        temperature = prompt_settings.get_temperature_for_task(self.task_type)
        max_tokens = prompt_settings.get_max_tokens_for_task(self.task_type)

        messages = [{"role": "system", "content": system_prompt}]

        # Inject conversation history if available
        for turn in self.conversation_history:
            role = turn.get("role", turn.get("sender", "user"))
            content = turn.get("content", turn.get("text", ""))
            if role in ("user", "human"):
                messages.append({"role": "user", "content": content})
            elif role in ("assistant", "ai", "bot"):
                messages.append({"role": "assistant", "content": content})

        messages.append({"role": "user", "content": user_prompt})

        return {
            "task_type": self.task_type.value,
            "system_prompt": system_prompt,
            "user_prompt": user_prompt,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "platform": prompt_settings.platform_name,
        }
