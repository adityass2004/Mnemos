from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.utils.logging_config import setup_logging
from app.utils.exceptions import AntigravityException, antigravity_exception_handler
from app.api.endpoints import router

logger = logging.getLogger("Mnemos")

@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    banner = (
        "\n=================================================\n"
        "Mnemos\n"
        "Industrial Knowledge Intelligence Platform\n"
        "Remember. Reason. Prevent.\n"
        "================================================="
    )
    print(banner)
    logger.info("Starting up Mnemos API backend services.")
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
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(AntigravityException, antigravity_exception_handler)

app.include_router(router, prefix=settings.API_V1_STR)
