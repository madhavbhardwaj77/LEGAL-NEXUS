"""
AI Engine Configuration
"""

import os
from pydantic import BaseModel

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
    dense_weight: float = 0.6
    sparse_weight: float = 0.4
    min_confidence_threshold: float = 0.35

settings = Settings()
