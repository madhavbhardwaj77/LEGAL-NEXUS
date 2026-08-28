"""
Role & Permission Access Validation Guardrail
Ensures strict multi-tenant boundary enforcement, role-based tool restrictions, and document access isolation.
"""

from typing import Dict, Any, List, Optional

class PermissionGuard:
    ROLE_PERMISSIONS = {
        "GUEST": {
            "allowed_tools": [
                "PUBLIC_LEGAL_RESEARCH",
                "STORY_INTAKE",
                "CASE_INTAKE",
                "CHAT_INTAKE",
                "DOCUMENT_AI",
                "SMART_DRAFTING",
                "VOICE_ASSISTANT",
                "SAMPLE_DOCUMENT_AI",
                "DOMAIN_EXPLORER"
            ],
            "can_access_case_data": True,
            "can_access_audit_logs": False,
            "can_access_lawyer_tools": False,
        },
        "CITIZEN": {
            "allowed_tools": [
                "PUBLIC_LEGAL_RESEARCH",
                "STORY_INTAKE",
                "CASE_INTAKE",
                "CHAT_INTAKE",
                "DOCUMENT_AI",
                "SMART_DRAFTING",
                "LAWYER_MATCHING",
                "VOICE_ASSISTANT",
                "DOMAIN_EXPLORER"
            ],
            "can_access_case_data": True,
            "can_access_audit_logs": False,
            "can_access_lawyer_tools": False,
        },
        "LAWYER": {
            "allowed_tools": [
                "PUBLIC_LEGAL_RESEARCH",
                "STORY_INTAKE",
                "CASE_INTAKE",
                "CHAT_INTAKE",
                "CITATION_VALIDATOR",
                "CASE_MANAGEMENT",
                "DOCUMENT_AI",
                "SMART_DRAFTING",
                "PRO_BONO_ROSTER",
                "LEGAL_PRECEDENT_SEARCH",
                "VOICE_ASSISTANT",
                "DOMAIN_EXPLORER"
            ],
            "can_access_case_data": True,
            "can_access_audit_logs": False,
            "can_access_lawyer_tools": True,
        },
        "ADMIN": {
            "allowed_tools": ["*"],
            "can_access_case_data": True,
            "can_access_audit_logs": True,
            "can_access_lawyer_tools": True,
        }
    }

    @classmethod
    def validate_access(
        cls,
        role: str = "CITIZEN",
        tool_name: str = "PUBLIC_LEGAL_RESEARCH",
        resource_owner_id: Optional[str] = None,
        requesting_user_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Validates if the user's role and identity permit calling the specified tool or accessing the target resource.
        """
        norm_role = (role or "CITIZEN").upper()
        perms = cls.ROLE_PERMISSIONS.get(norm_role, cls.ROLE_PERMISSIONS["CITIZEN"])

        # 1. Check Tool Authorization
        is_tool_allowed = "*" in perms["allowed_tools"] or tool_name in perms["allowed_tools"]
        if not is_tool_allowed:
            return {
                "authorized": False,
                "reason": f"Role '{norm_role}' is not authorized to invoke tool '{tool_name}'.",
                "status": "FORBIDDEN"
            }

        # 2. Check Resource Ownership & Tenant Isolation
        if resource_owner_id and requesting_user_id:
            if norm_role not in ("ADMIN", "LAWYER") and str(resource_owner_id) != str(requesting_user_id):
                return {
                    "authorized": False,
                    "reason": "Access denied: You are not authorized to view or modify this case/document.",
                    "status": "UNAUTHORIZED_TENANT_ACCESS"
                }

        # 3. Check Audit Log Access
        if tool_name == "AUDIT_LOG_INSPECTION" and not perms["can_access_audit_logs"]:
            return {
                "authorized": False,
                "reason": "Access denied: Audit logs are restricted to Administrator roles.",
                "status": "FORBIDDEN"
            }

        return {
            "authorized": True,
            "role": norm_role,
            "tool": tool_name,
            "status": "AUTHORIZED"
        }
