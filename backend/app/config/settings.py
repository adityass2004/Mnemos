from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "Mnemos"
    APP_ENV: str = "production"
    API_V1_STR: str = "/api/v1"
    CORS_ORIGINS: list[str] = ["*"]
    LOG_LEVEL: str = "INFO"
    GEMINI_API_KEY: Optional[str] = None

    # File Upload Settings
    MAX_UPLOAD_SIZE: int = 100 * 1024 * 1024  # 100MB
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".txt", ".docx", ".md"]
    ALLOWED_CONTENT_TYPES: list[str] = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/markdown"
    ]

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent  # backend directory
    PROJECT_ROOT: Path = BASE_DIR.parent
    UPLOADS_DIR: Path = BASE_DIR / "uploads"
    TEMP_DIR: Path = BASE_DIR / "tmp"
    DATA_DIR: Path = BASE_DIR / "data"
    PROCESSED_FILES_TRACKER_PATH: Path = DATA_DIR / "processed_files.json"
    EMBEDDINGS_PATH: Path = DATA_DIR / "embeddings.npy"
    LOG_FORMAT: str = "json"  # "json" or "default"

    # Ingestion Settings
    INGESTION_TIMEOUT: int = 300  # 5 minutes
    MAX_RETRY_ATTEMPTS: int = 3
    RETRY_DELAY: float = 5.0  # seconds

    # Cleanup Settings
    TEMP_FILE_RETENTION_HOURS: int = 24
    MAX_DOCUMENTS: int = 1000

    class Config:
        env_file = str(Path(__file__).resolve().parent.parent.parent / ".env")
        env_prefix = "MNEMOS_"
        env_file_encoding = "utf-8"

settings = Settings()
