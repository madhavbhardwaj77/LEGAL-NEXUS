"""
Gemini LLM Synthesizer Service for Legal Nexus / Nyaya Setu
Provides Context-Grounded Legal Paraphrasing, Zero-Hallucination Explanations, and Step-by-Step Remedies using Google Gemini.
"""

import json
import urllib.request
import urllib.error
import logging
from typing import Dict, Any, List, Optional, Generator
from ..config import settings

logger = logging.getLogger("gemini_service")

class GeminiLegalService:
    def __init__(self):
        self.api_key = settings.gemini_api_key
        self.model = settings.gemini_model
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"

    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 10)

    def generate_grounded_legal_response(
        self,
        query: str,
        provisions: List[Dict[str, Any]],
        domain: str = "General Civil/Commercial",
        language: str = "en"
    ) -> Dict[str, Any]:
        """
        Synthesizes a strictly grounded plain-language explanation and remedies from retrieved RAG provisions.
        """
        if not self.is_configured():
            logger.info("Gemini API key not configured, using heuristic synthesis fallback.")
            return None

        # Build Grounded Context Block from RAG chunks
        context_lines = []
        for p in provisions:
            act = p.get("act", "")
            sec = p.get("section", "")
            title = p.get("sectionTitle", "")
            snippet = p.get("statutorySnippet", "") or p.get("content", "")
            remedy = p.get("actionableRemedy", "")
            context_lines.append(
                f"- Act: {act}\n  Section: {sec} ({title})\n  Statutory Text: {snippet}\n  Official Recourse: {remedy}"
            )
        context_str = "\n\n".join(context_lines)

        system_instruction = (
            "You are Nyaya Setu AI Legal Counsel, an intelligent Indian legal assistant. "
            "Your objective is to provide a clear, empathetic, and legally precise explanation for an Indian citizen.\n\n"
            "CRITICAL ANTI-HALLUCINATION RULES:\n"
            "1. Base your legal reasoning STRICTLY and ONLY on the provided retrieved statutory provisions.\n"
            "2. Do NOT invent sections, act numbers, or judicial precedents not present in the context.\n"
            "3. Structure your answer with: (a) Plain-Language Legal Assessment & Rights Breakdown, (b) Step-by-Step Actionable Remedies.\n"
            "4. If certain aspects of the user's situation are not covered in the provided statutes, explicitly clarify what additional legal provisions may be needed.\n"
            "5. Respond in a professional, reassuring tone."
        )

        user_prompt = (
            f"=== RETRIEVED STATUTORY PROVISIONS (RAG SINGLE SOURCE OF TRUTH) ===\n"
            f"{context_str}\n\n"
            f"=== CITIZEN / USER SITUATION ===\n"
            f"Domain: {domain}\n"
            f"Query: {query}\n\n"
            f"Provide the grounded legal assessment and actionable next steps:"
        )

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": f"{system_instruction}\n\n{user_prompt}"}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.9,
                "maxOutputTokens": 1024
            }
        }

        try:
            url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_json = json.loads(response.read().decode("utf-8"))
                candidates = res_json.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        generated_text = parts[0].get("text", "")
                        return {
                            "success": True,
                            "explanation": generated_text,
                            "model": self.model,
                            "source": "GEMINI_GROUNDED_RAG"
                        }
        except Exception as e:
            logger.warning(f"Gemini API generation error: {e}. Falling back to deterministic RAG synthesis.")
            return None

        return None

    def generate_conversational_reply(
        self,
        message: str,
        conversation_history: Optional[List[Dict[str, str]]] = None,
        retrieved_context: Optional[str] = None
    ) -> str:
        """
        Generates conversational guidance for the AI intake chatbot.
        """
        if not self.is_configured():
            return None

        history_parts = []
        if conversation_history:
            for h in conversation_history[-6:]:
                role = "user" if h.get("role") in ["user", "citizen"] else "model"
                history_parts.append(f"{role.upper()}: {h.get('content', '')}")

        history_str = "\n".join(history_parts)

        prompt = (
            "You are Nyaya Setu AI Assistant for citizen intake and preliminary legal guidance in India. "
            "Help the citizen understand their legal scenario, ask 1 clarifying question if vital facts are missing, "
            "and suggest relevant statutory protections under Indian law.\n\n"
        )
        if retrieved_context:
            prompt += f"=== RELEVANT STATUTORY CONTEXT ===\n{retrieved_context}\n\n"
        if history_str:
            prompt += f"=== CONVERSATION HISTORY ===\n{history_str}\n\n"
        prompt += f"USER MESSAGE: {message}\nASSISTANT:"

        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 600}
        }

        try:
            url = f"{self.base_url}/{self.model}:generateContent?key={self.api_key}"
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=req_data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=12) as response:
                res_json = json.loads(response.read().decode("utf-8"))
                candidates = res_json.get("candidates", [])
                if candidates:
                    parts = candidates[0].get("content", {}).get("parts", [])
                    if parts:
                        return parts[0].get("text", "").strip()
        except Exception as e:
            logger.warning(f"Gemini conversation error: {e}")
            return None

        return None

gemini_legal_service = GeminiLegalService()
