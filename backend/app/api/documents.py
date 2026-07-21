"""
documents.py
------------
FastAPI router for document management.

Endpoints:
  POST   /documents/upload        — Upload one or more documents.
  GET    /documents               — List all uploaded documents.
  DELETE /documents/{filename}    — Delete a document by stored filename.
"""

import logging

from fastapi import APIRouter, Depends, File, UploadFile, BackgroundTasks, HTTPException
from typing import List

from app.models.schemas import DeleteResponse, DocumentListResponse, UploadResponse, UploadResponseWithJob, JobStatusResponse, ResetResponse
from app.services.document_service import DocumentService
from app.services.job_manager import JobManager

logger = logging.getLogger("Mnemos.DocumentRouter")

documents_router = APIRouter(prefix="/documents", tags=["Documents"])


# ── Dependency ─────────────────────────────────────────────────────────────────

async def get_document_service() -> DocumentService:
    return DocumentService()


# ── Upload ─────────────────────────────────────────────────────────────────────

@documents_router.post(
    "/upload",
    response_model=UploadResponseWithJob,
    summary="Upload one or more documents",
    description=(
        "Accept multiple files in a single request. "
        "Supported extensions: `.pdf`, `.txt`, `.docx`, `.md`. "
        "Files are saved to `backend/uploads/` with UUID-based filenames to prevent collisions. "
        "Any unsupported file type causes the entire request to be rejected with HTTP 415. "
        "Ingestion pipeline runs in the background."
    ),
)
async def upload_documents(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(..., description="One or more files to upload"),
    service: DocumentService = Depends(get_document_service),
) -> UploadResponseWithJob:
    logger.info("POST /documents/upload — %d file(s) received.", len(files))
    response = await service.upload_documents(files, background_tasks)
    logger.info("POST /documents/upload — %d file(s) saved, job %s queued.", response.count, response.job_id)
    return response


# ── Job Status ─────────────────────────────────────────────────────────────────

@documents_router.get(
    "/status/{job_id}",
    response_model=JobStatusResponse,
    summary="Get job status",
    description="Get the status of an ingestion job by job ID.",
)
async def get_job_status(job_id: str) -> JobStatusResponse:
    logger.info("GET /documents/status/%s — requested.", job_id)
    job_manager = JobManager()
    job_status = job_manager.get_job_status_response(job_id)
    if not job_status:
        logger.warning("GET /documents/status/%s — job not found.", job_id)
        raise HTTPException(status_code=404, detail="Job not found")
    logger.info("GET /documents/status/%s — returning status: %s", job_id, job_status.status)
    return job_status


# ── List ───────────────────────────────────────────────────────────────────────

@documents_router.get(
    "",
    response_model=DocumentListResponse,
    summary="List all uploaded documents",
    description="Returns metadata (filename, size, extension, upload time) for every file in `backend/uploads/`.",
)
async def list_documents(
    service: DocumentService = Depends(get_document_service),
) -> DocumentListResponse:
    logger.info("GET /documents — listing all uploaded documents.")
    response = await service.list_documents()
    logger.info("GET /documents — returning %d document(s).", response.count)
    return response


# ── Reset ──────────────────────────────────────────────────────────────────

@documents_router.delete(
    "/reset",
    response_model=ResetResponse,
    summary="Reset all documents and knowledge",
    description=(
        "Deletes all uploaded documents, wipes the FAISS index, knowledge graph, "
        "and processed-files tracker. Clears all in-memory state. "
        "This action is irreversible."
    ),
)
async def reset_all(
    background_tasks: BackgroundTasks,
    service: DocumentService = Depends(get_document_service),
) -> ResetResponse:
    logger.warning("DELETE /documents/reset — full reset requested.")
    response = await service.reset_all(background_tasks)
    logger.warning("DELETE /documents/reset — reset complete. %d file(s) removed.", response.files_deleted)
    return response


# ── Delete ─────────────────────────────────────────────────────────────────────

@documents_router.delete(
    "/{filename}",
    response_model=DeleteResponse,
    summary="Delete a document",
    description=(
        "Delete the document identified by its stored `filename` (the UUID-based name, "
        "not the original upload name). Returns HTTP 404 if the file does not exist."
    ),
)
async def delete_document(
    filename: str,
    background_tasks: BackgroundTasks,
    service: DocumentService = Depends(get_document_service),
) -> DeleteResponse:
    logger.info("DELETE /documents/%s — requested.", filename)
    response = await service.delete_document(filename, background_tasks)
    logger.info("DELETE /documents/%s — deleted successfully.", filename)
    return response
