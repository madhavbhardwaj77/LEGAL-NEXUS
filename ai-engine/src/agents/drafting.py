"""
Drafting Agent
Generates grounded legal drafts and verifies facts against structured case records
"""

from typing import Dict, Any
from ..drafting.draft_generator import DraftGenerator
from ..drafting.draft_fact_checker import draft_fact_checker

class DraftingAgent:
    @classmethod
    def generate_and_verify_draft(
        cls,
        draft_type: str,
        case_data: Dict[str, Any],
        variables: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        draft = DraftGenerator.generate_draft(draft_type, case_data, variables=variables)
        verification = draft_fact_checker.verify_draft(draft["contentMarkdown"], case_data)
        draft["verification"] = verification
        return draft
