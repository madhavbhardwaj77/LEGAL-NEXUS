"""
AI Engine Configuration
"""

import os
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings(BaseModel):
    app_name: str = "Nyaya Setu AI Engine"
    version: str = "1.0.0"
    host: str = os.getenv("AI_ENGINE_HOST", "0.0.0.0")
    port: int = int(os.getenv("AI_ENGINE_PORT", 8000))
    data_dir: str = os.getenv(
        "DATA_DIR",
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
    )
    qdrant_url: str = os.getenv("QDRANT_URL", "http://localhost:6333")
    embedding_dim: int = 384
    rrf_k: int = 60
    min_confidence_threshold: float = 0.35
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = os.getenv("GEMINI_MODEL", "models/gemini-3.6-flash")

settings = Settings()
