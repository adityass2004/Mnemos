import sys
from pathlib import Path

# Add project root to sys.path BEFORE importing anything that uses ingestion or app modules
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(_PROJECT_ROOT))

from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.utils.logging_config import setup_logging
from app.utils.file_utils import ensure_directories, cleanup_temporary_files
from app.utils.exceptions import AntigravityException, antigravity_exception_handler
from app.api.endpoints import router
from app.api.documents import documents_router
from app.services.knowledge_manager import KnowledgeManager

logger = logging.getLogger("Mnemos")


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    ensure_directories()
    
    # Cleanup old temporary files on startup
    deleted_count = cleanup_temporary_files()
    if deleted_count > 0:
        logger.info(f"Cleaned up {deleted_count} old temporary files on startup")
    
    banner = (
        "\n=================================================\n"
        "Mnemos\n"
        "Industrial Knowledge Intelligence Platform\n"
        "Remember. Reason. Prevent.\n"
        "================================================="
    )
    print(banner)
    logger.info("Starting up Mnemos API backend services.")
    
    # Initialize KnowledgeManager
    knowledge_manager = KnowledgeManager()
    logger.info("KnowledgeManager initialized.")
    
    yield
    logger.info("Shutting down Mnemos API backend services.")


app = FastAPI(
    title="Mnemos",
    description="Industrial Knowledge Intelligence Platform\n\nRemember. Reason. Prevent.",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AntigravityException, antigravity_exception_handler)

app.include_router(router, prefix=settings.API_V1_STR)
app.include_router(documents_router, prefix=settings.API_V1_STR)

