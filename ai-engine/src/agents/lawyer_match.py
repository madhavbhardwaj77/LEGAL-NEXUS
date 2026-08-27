"""
Lawyer Matching Recommendation Agent
"""

from typing import Dict, Any, List
from ..matching.matcher import LawyerMatcher

class LawyerMatchAgent:
    @classmethod
    def match_case_to_lawyers(cls, lawyers: List[Dict[str, Any]], case_profile: Dict[str, Any]) -> List[Dict[str, Any]]:
        return LawyerMatcher.match_lawyers(lawyers, case_profile)
