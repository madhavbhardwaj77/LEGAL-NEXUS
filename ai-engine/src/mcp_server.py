"""
Model Context Protocol (MCP) Server for Legal Nexus / LegalIQ
Standardized MCP Tool Interface exposing Legal Knowledge Sources, Document Tools, and Citation Validation.
"""

from typing import Dict, Any, List, Optional
import json

class MCPLegalServer:
    def __init__(self):
        self.tools = [
            {
                "name": "search_bare_acts",
                "description": "Searches Indian legislative bare acts (BNS, BNSS, BSA, CPC, CrPC, IPC, IT Act, Labour Codes, Consumer Act) for relevant sections and penalties.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string", "description": "Legal query or dispute situation"},
                        "jurisdiction": {"type": "string", "description": "Jurisdiction e.g. India, Delhi, etc.", "default": "India"},
                        "limit": {"type": "integer", "description": "Maximum number of sections to return", "default": 5}
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "validate_citations",
                "description": "Validates whether a legal citation, Supreme Court judgment reference, or bare act section is authentic and active.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "actName": {"type": "string", "description": "Name of statutory act"},
                        "section": {"type": "string", "description": "Section or Rule number"},
                        "citation": {"type": "string", "description": "Optional law report citation e.g. (2023) 4 SCC 120"}
                    },
                    "required": ["actName", "section"]
                }
            },
            {
                "name": "analyze_legal_document",
                "description": "Analyzes legal contract or court petition text, extracting parties, key clauses, liabilities, and risk score.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "text": {"type": "string", "description": "Extracted document text or petition"},
                        "documentType": {"type": "string", "description": "Contract, Notice, Petition, or Affidavit"}
                    },
                    "required": ["text"]
                }
            },
            {
                "name": "compare_cases",
                "description": "Performs multi-dimensional comparative analysis between two legal cases or dispute briefs.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "caseA": {"type": "object", "description": "First case object with title and description"},
                        "caseB": {"type": "object", "description": "Second case object with title and description"}
                    },
                    "required": ["caseA", "caseB"]
                }
            }
        ]

    def list_tools(self) -> Dict[str, Any]:
        """
        MCP tools list endpoint handler.
        """
        return {
            "tools": self.tools,
            "protocolVersion": "2024-11-05",
            "serverInfo": {
                "name": "legal-nexus-mcp-server",
                "version": "1.0.0",
                "description": "Legal Intelligence & Statutory Retrieval MCP Server"
            }
        }

    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a standardized MCP tool.
        """
        if tool_name == "search_bare_acts":
            from .rag_service import LegalRAGService
            rag = LegalRAGService()
            query = arguments.get("query", "")
            jurisdiction = arguments.get("jurisdiction", "India")
            res = await rag.research_query(query=query, jurisdiction=jurisdiction)
            return {
                "tool": tool_name,
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(res, default=str)
                    }
                ],
                "isError": False
            }

        elif tool_name == "validate_citations":
            from .source_verifier import SourceVerifier
            verifier = SourceVerifier()
            act = arguments.get("actName", "")
            sec = arguments.get("section", "")
            val_res = verifier.verify_citation(act, sec)
            return {
                "tool": tool_name,
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(val_res, default=str)
                    }
                ],
                "isError": False
            }

        elif tool_name == "analyze_legal_document":
            from .document.document_analyzer import document_analyzer
            txt = arguments.get("text", "")
            doc_type = arguments.get("documentType", "General Document")
            analysis = document_analyzer.analyze_document_text(txt, filename="mcp_doc.txt")
            return {
                "tool": tool_name,
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(analysis, default=str)
                    }
                ],
                "isError": False
            }

        elif tool_name == "compare_cases":
            from .comparator import case_comparator
            case_a = arguments.get("caseA", {})
            case_b = arguments.get("caseB", {})
            cmp_res = case_comparator.compare_cases(case_a, case_b)
            return {
                "tool": tool_name,
                "content": [
                    {
                        "type": "text",
                        "text": json.dumps(cmp_res, default=str)
                    }
                ],
                "isError": False
            }

        else:
            return {
                "tool": tool_name,
                "content": [{"type": "text", "text": f"Unknown MCP tool: {tool_name}"}],
                "isError": True
            }

mcp_server = MCPLegalServer()
