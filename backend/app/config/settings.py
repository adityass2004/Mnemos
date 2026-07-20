from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "Mnemos"
    APP_ENV: str = "production"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["*"]
    LOG_LEVEL: str = "INFO"
    GEMINI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()
