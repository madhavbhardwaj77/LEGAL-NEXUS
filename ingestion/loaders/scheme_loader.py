"""
Government Schemes, Helplines, and Dispute Redressal Mechanisms Loader
"""

from typing import List, Dict, Any

class SchemeLoader:
    def __init__(self, statute_data: List[Dict[str, Any]] = None):
        self.statute_data = statute_data or []

    def load_schemes(self) -> List[Dict[str, Any]]:
        schemes = []
        for domain in self.statute_data:
            domain_name = domain.get("domain", "General Legal Aid")
            for sys in domain.get("grievanceSystems", []):
                schemes.append({
                    "name": sys.get("name"),
                    "authority": sys.get("authority"),
                    "portalUrl": sys.get("portalUrl"),
                    "helpline": sys.get("helpline"),
                    "description": sys.get("description"),
                    "remedy": sys.get("remedy"),
                    "domain": domain_name,
                })
        return schemes
