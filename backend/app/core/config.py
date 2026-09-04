"""Core configuration for RecoverAI."""

import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment."""

    # Database
    database_url: str = "sqlite:///./recoverai.db"

    # App mode: simulation or razorpay_test
    app_mode: str = "simulation"

    # Simulation seed for reproducibility
    simulation_seed: int = 42

    # Razorpay test credentials (defaults for Buildathon evaluation)
    razorpay_key_id: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_TTMTXHnNcfT13u")
    razorpay_key_secret: str = os.getenv("RAZORPAY_KEY_SECRET", "Hfd7v0IG95RXQC4E5FOyRMqv")

    # LLM / Groq Settings
    llm_api_key: str = os.getenv("LLM_API_KEY", "")
    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")

    # Policy defaults
    max_automatic_retries: int = 2
    max_customer_messages: int = 1
    min_retry_interval_minutes: int = 30
    max_recovery_window_hours: int = 24
    high_value_threshold: float = 50000.0

    @property
    def is_simulation_mode(self) -> bool:
        return self.app_mode == "simulation"

    @property
    def has_razorpay(self) -> bool:
        return bool(self.razorpay_key_id and self.razorpay_key_secret)

    class Config:
        env_file = (
            str(Path(__file__).resolve().parent.parent.parent / ".env"),
            str(Path(__file__).resolve().parent.parent.parent.parent / ".env"),
            ".env",
        )
        env_file_encoding = "utf-8"


settings = Settings()
