"""
document_service.py
-------------------
Business logic for document upload, listing, and deletion.

Responsibilities:
  - Validate file extensions, size, content, duplicates.
  - Generate UUID-based unique filenames to avoid collisions.
  - Persist uploaded files, run ingestion, handle rollback.
  - List all currently stored documents with metadata.
  - Delete a document by its stored filename.
"""

import logging
import os
import shutil
import sys
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import UploadFile, HTTPException, BackgroundTasks

from app.models.schemas import DeleteResponse, DocumentInfo, UploadResponse, DocumentListResponse, UploadResponseWithJob, JobStatus, ResetResponse
from app.utils.exceptions import (
    DocumentNotFoundException, UnsupportedFileTypeException,
    FileTooLargeException, DuplicateFileException, InvalidFileException,
    IngestionTimeoutException, IngestionFailedException
)
from app.utils.file_utils import (
    ensure_directories, compute_file_hash, is_valid_extension,
    is_valid_size, is_duplicate_file, validate_file, get_temporary_file_path,
    cleanup_temporary_files, load_processed_files, save_processed_files
)
from app.utils.logging_config import performance_metrics
from app.config.settings import settings
from app.services.knowledge_manager import KnowledgeManager
from app.services.job_manager import JobManager

# Add project root to sys.path so we can import from ingestion
sys.path.insert(0, str(settings.PROJECT_ROOT))
from backend.ingestion.pipeline.pipeline import IngestionPipeline

logger = logging.getLogger("Mnemos.DocumentService")

# Thread safety lock for shared resources
_document_lock = threading.RLock()

import re

UUID_PATTERN = re.compile(r'^[0-9a-f]{32}\.[a-z]+$')

def _is_uuid_filename(name: str) -> bool:
    return bool(UUID_PATTERN.match(name))


def _load_original_filenames() -> dict[str, str]:
    """Bootstrap original filename map from the processed_files tracker on startup."""
    mapping: dict[str, str] = {}
    try:
        tracker = load_processed_files()
        for entry in tracker.values():
            fname = entry.get("filename")
            orig = entry.get("original_name")
            if fname and orig and not _is_uuid_filename(orig):
                mapping[fname] = orig
    except Exception:
        pass
    return mapping

# Store original filenames (since we use UUIDs for storage)
_original_filenames: dict[str, str] = _load_original_filenames()


def _repair_tracker_original_names() -> None:
    """
    One-time startup repair: if the tracker has entries where original_name is a UUID
    (written by the old ingestion pipeline), try to recover the real name from
    _original_filenames. If unknown, leave as-is — at least future uploads will be correct.
    """
    try:
        tracker = load_processed_files()
        dirty = False
        for file_hash, entry in tracker.items():
            stored = entry.get("filename", "")
            orig = entry.get("original_name", "")
            if _is_uuid_filename(orig):
                real = _original_filenames.get(stored)
                if real:
                    entry["original_name"] = real
                    dirty = True
        if dirty:
            save_processed_files(tracker)
            logger.info("Repaired %d stale original_name entries in tracker.",
                        sum(1 for e in tracker.values() if not _is_uuid_filename(e.get("original_name", ""))))
    except Exception as exc:
        logger.warning("Could not repair tracker: %s", exc)

_repair_tracker_original_names()


def _build_document_info(filepath: Path, original_name: str) -> DocumentInfo:
    """Build a DocumentInfo model from a file path and its original name."""
    stat = filepath.stat()
    extension = filepath.suffix.lower()
    mtime = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()
    return DocumentInfo(
        filename=filepath.name,
        original_name=original_name,
        size_bytes=stat.st_size,
        extension=extension,
        uploaded_at=mtime,
    )


class IngestionPipelineThread(threading.Thread):
    def __init__(self, pipeline, input_dir, output_dir, progress_callback):
        super().__init__()
        self.pipeline = pipeline
        self.input_dir = input_dir
        self.output_dir = output_dir
        self.progress_callback = progress_callback
        self.exception = None
        self.result = None

    def run(self):
        try:
            self.result = self.pipeline.run(
                self.input_dir,
                self.output_dir,
                self.progress_callback
            )
        except Exception as e:
            self.exception = e


def _run_ingestion_pipeline_background(job_id: str):
    """Background task to run the ingestion pipeline with thread-safety, timeout, and rollback."""
    with _document_lock:
        job_manager = JobManager()
        knowledge_manager = KnowledgeManager()
        
        # Targeted Backup state for rollback
        backup_files = {}
        backup_faiss_dir = None
        
        if settings.DATA_DIR.exists():
            # Backup graph.json
            graph_path = settings.DATA_DIR / "graph.json"
            if graph_path.exists():
                backup_files[graph_path] = graph_path.with_suffix(".json.bak")
                import shutil
                shutil.copy2(graph_path, backup_files[graph_path])
                
            # Backup processed_files.json
            tracker_path = settings.PROCESSED_FILES_TRACKER_PATH
            if tracker_path.exists():
                backup_files[tracker_path] = tracker_path.with_suffix(".json.bak")
                import shutil
                shutil.copy2(tracker_path, backup_files[tracker_path])
                
            # Backup faiss directory
            faiss_dir = settings.DATA_DIR / "faiss"
            if faiss_dir.exists():
                backup_faiss_dir = settings.DATA_DIR / f"faiss_backup_{job_id}"
                import shutil
                shutil.copytree(faiss_dir, backup_faiss_dir, dirs_exist_ok=True)

        try:
            job_manager.update_job_status(job_id, JobStatus.PROCESSING)
            
            def progress_callback(progress: int):
                job_manager.update_job_progress(job_id, progress)
            
            pipeline = IngestionPipeline()
            
            # Start pipeline run in a separate thread to enforce timeout
            thread = IngestionPipelineThread(
                pipeline, 
                str(settings.UPLOADS_DIR), 
                str(settings.DATA_DIR), 
                progress_callback
            )
            thread.start()
            thread.join(timeout=settings.INGESTION_TIMEOUT)
            
            if thread.is_alive():
                logger.error(f"Ingestion pipeline execution timed out after {settings.INGESTION_TIMEOUT} seconds.")
                raise IngestionTimeoutException(job_id)
                
            if thread.exception:
                raise thread.exception
                
            file_count = thread.result
            
            job_manager.set_documents_processed(job_id, file_count)
            job_manager.update_job_status(job_id, JobStatus.COMPLETED)
            
            logger.info("Ingestion pipeline completed successfully! Reloading knowledge...")
            knowledge_manager.reload()
            logger.info("Knowledge reloaded into memory successfully!")
            
            job_manager.update_job_status(job_id, JobStatus.READY)
            
            # Cleanup backups
            for backup in backup_files.values():
                if backup.exists():
                    backup.unlink()
            if backup_faiss_dir and backup_faiss_dir.exists():
                import shutil
                shutil.rmtree(backup_faiss_dir)
                logger.debug(f"Cleaned up backup directory {backup_faiss_dir}")
            
        except Exception as exc:
            logger.error(f"Ingestion pipeline failed for job {job_id}: {exc}", exc_info=True)
            
            # Rollback
            logger.warning(f"Rolling back to backup state...")
            for original, backup in backup_files.items():
                if backup.exists():
                    import shutil
                    if original.exists():
                        original.unlink()
                    shutil.move(backup, original)
                    
            if backup_faiss_dir and backup_faiss_dir.exists():
                import shutil
                faiss_dir = settings.DATA_DIR / "faiss"
                if faiss_dir.exists():
                    shutil.rmtree(faiss_dir)
                shutil.move(backup_faiss_dir, faiss_dir)
            
            # Reload previous in-memory state
            knowledge_manager.reload()
            
            job_manager.add_job_error(job_id, str(exc))
            job_manager.update_job_status(job_id, JobStatus.FAILED)


# ── Service Class ──────────────────────────────────────────────────────────────

class DocumentService:
    """Handles all document management operations."""

    def __init__(self):
        ensure_directories()

    # ── Upload ─────────────────────────────────────────────────────────────────

    @performance_metrics.timeit("document_upload")
    async def upload_documents(self, files: list[UploadFile], background_tasks: BackgroundTasks) -> UploadResponseWithJob:
        """
        Validate, save, and return metadata for one or more uploaded files.
        Then runs the ingestion pipeline in the background.

        Raises:
            UnsupportedFileTypeException, FileTooLargeException,
            DuplicateFileException, InvalidFileException.
        """
        with _document_lock:
            logger.info("Received upload request for %d file(s).", len(files))
            uploaded: list[DocumentInfo] = []
            temp_files: list[Path] = []
            
            try:
                # Validate and process each file
                for file in files:
                    original_name = file.filename or "unnamed"
                    ext = Path(original_name).suffix.lower()

                    # Validate extension
                    valid, msg = is_valid_extension(original_name)
                    if not valid:
                        raise UnsupportedFileTypeException(
                            filename=original_name,
                            extension=ext,
                            allowed=settings.ALLOWED_EXTENSIONS
                        )

                    # Save to temporary file first for validation
                    temp_path = get_temporary_file_path(suffix=ext)
                    temp_files.append(temp_path)
                    
                    try:
                        content = await file.read()
                        temp_path.write_bytes(content)
                        
                        # Validate file size
                        valid, msg = is_valid_size(len(content))
                        if not valid:
                            raise FileTooLargeException(
                                filename=original_name,
                                size_bytes=len(content),
                                max_size_bytes=settings.MAX_UPLOAD_SIZE
                            )

                        # Validate file content
                        valid, msg = validate_file(temp_path, original_name)
                        if not valid:
                            raise InvalidFileException(filename=original_name, reason=msg)

                        # Check for duplicates
                        file_hash = compute_file_hash(temp_path)
                        is_dup, existing_stored_name, existing_original_name = is_duplicate_file(file_hash)
                        if is_dup:
                            # Prefer in-memory map, fall back to tracker original_name only if it's not a UUID
                            display_name = _original_filenames.get(existing_stored_name)
                            if not display_name and existing_original_name and not _is_uuid_filename(existing_original_name):
                                display_name = existing_original_name
                            if not display_name:
                                display_name = existing_stored_name
                            raise DuplicateFileException(
                                filename=original_name,
                                existing_filename=display_name
                            )

                        # Save permanent file
                        unique_name = f"{uuid.uuid4().hex}{ext}"
                        dest_path = settings.UPLOADS_DIR / unique_name
                        shutil.copy2(temp_path, dest_path)

                        # Store original filename
                        _original_filenames[unique_name] = original_name

                        # Register hash in tracker immediately so delete → re-upload works
                        try:
                            tracker = load_processed_files()
                            tracker[file_hash] = {
                                "filename": unique_name,
                                "original_name": original_name,
                                "document_id": None,
                                "processed_at": None,
                            }
                            save_processed_files(tracker)
                        except Exception as tracker_exc:
                            logger.warning("Could not pre-register hash in tracker: %s", tracker_exc)

                        uploaded.append(_build_document_info(dest_path, original_name))
                        logger.info("Saved '%s' → '%s' (%d bytes)", original_name, unique_name, len(content))

                    finally:
                        await file.close()

                logger.info("Upload complete: %d file(s) saved. Queuing ingestion...", len(uploaded))

                # Create job and queue background task
                job_manager = JobManager()
                job_id = job_manager.create_job()
                background_tasks.add_task(_run_ingestion_pipeline_background, job_id)

                # Automatic cleanup of old temp files
                try:
                    cleanup_temporary_files()
                except Exception as cleanup_exc:
                    logger.warning(f"Could not clean up temporary files: {cleanup_exc}")

                return UploadResponseWithJob(
                    success=True,
                    message=f"Successfully uploaded {len(uploaded)} file(s). Ingestion is running in the background.",
                    uploaded=uploaded,
                    count=len(uploaded),
                    job_id=job_id,
                    ingestion_status="queued"
                )

            except Exception as e:
                # Cleanup any temporary files
                for temp_path in temp_files:
                    try:
                        if temp_path.exists():
                            temp_path.unlink()
                    except Exception as cleanup_exc:
                        logger.warning(f"Could not clean up temp file {temp_path}: {cleanup_exc}")
                # Cleanup any uploaded files from this attempt
                for doc in uploaded:
                    doc_path = settings.UPLOADS_DIR / doc.filename
                    if doc_path.exists():
                        try:
                            rollback_hash = compute_file_hash(doc_path)
                            tracker = load_processed_files()
                            if rollback_hash in tracker:
                                del tracker[rollback_hash]
                                save_processed_files(tracker)
                        except Exception:
                            pass
                        doc_path.unlink()
                    if doc.filename in _original_filenames:
                        del _original_filenames[doc.filename]
                raise

    # ── List ───────────────────────────────────────────────────────────────────

    async def list_documents(self) -> DocumentListResponse:
        """Return metadata for every file currently in the uploads directory."""
        with _document_lock:
            logger.info("Listing documents in uploads directory")

            docs: list[DocumentInfo] = []
            for filepath in sorted(settings.UPLOADS_DIR.iterdir()):
                if filepath.is_file() and filepath.name != ".gitkeep":
                    original_name = _original_filenames.get(filepath.name, filepath.name)
                    docs.append(_build_document_info(filepath, original_name))

            logger.info("Found %d document(s)", len(docs))
            return DocumentListResponse(
                message=f"{len(docs)} document(s) found." if docs else "No documents uploaded yet.",
                documents=docs,
                count=len(docs)
            )

    # ── Delete ─────────────────────────────────────────────────────────────────

    @performance_metrics.timeit("document_delete")
    async def delete_document(self, filename: str, background_tasks: Optional[BackgroundTasks] = None) -> DeleteResponse:
        """
        Delete a document from the uploads directory by its stored filename.
        Then schedules background updates for knowledge graph and vector index.

        Raises:
            DocumentNotFoundException: if the file does not exist.
        """
        with _document_lock:
            target = settings.UPLOADS_DIR / filename

            # Safety guard: reject path-traversal attempts
            if not target.resolve().is_relative_to(settings.UPLOADS_DIR.resolve()):
                logger.warning("Path-traversal attempt blocked for filename '%s'", filename)
                raise DocumentNotFoundException(filename)

            if not target.exists() or not target.is_file():
                logger.warning("Delete requested for non-existent file '%s'", filename)
                raise DocumentNotFoundException(filename)

            # Remove hash from processed_files tracker so the file can be re-uploaded
            try:
                file_hash = compute_file_hash(target)
                tracker = load_processed_files()
                if file_hash in tracker:
                    del tracker[file_hash]
                    save_processed_files(tracker)
            except Exception as e:
                logger.warning(f"Could not update processed_files tracker on delete: {e}")

            original_name = _original_filenames.get(filename, filename)
            target.unlink()
            if filename in _original_filenames:
                del _original_filenames[filename]
            logger.info("Deleted document '%s'", filename)
            
            # Queue background task to update graph and FAISS
            if background_tasks:
                job_manager = JobManager()
                job_id = job_manager.create_job()
                background_tasks.add_task(_run_ingestion_pipeline_background, job_id)
                logger.info(f"Queued background cleanup job {job_id} for deletion of {filename}")
                
            return DeleteResponse(
                success=True,
                message=f"'{original_name}' deleted successfully. Knowledge base will be updated shortly.",
                filename=filename,
            )

    # ── Reset ──────────────────────────────────────────────────────────────────

    @performance_metrics.timeit("document_reset")
    async def reset_all(self, background_tasks: BackgroundTasks) -> ResetResponse:
        """
        Delete all uploaded documents, wipe the knowledge graph, FAISS index,
        and processed-files tracker. Clears all in-memory state and job history.
        """
        with _document_lock:
            logger.warning("RESET requested — wiping all documents and knowledge.")

            # 1. Delete all uploaded files
            files_deleted = 0
            for filepath in settings.UPLOADS_DIR.iterdir():
                if filepath.is_file() and filepath.name != ".gitkeep":
                    try:
                        filepath.unlink()
                        files_deleted += 1
                    except Exception as e:
                        logger.warning("Could not delete upload '%s': %s", filepath.name, e)

            # 2. Wipe data artefacts
            graph_path = settings.DATA_DIR / "graph.json"
            faiss_dir = settings.DATA_DIR / "faiss"
            tracker_path = settings.PROCESSED_FILES_TRACKER_PATH

            for path in (graph_path, tracker_path):
                if path.exists():
                    try:
                        path.unlink()
                    except Exception as e:
                        logger.warning("Could not delete '%s': %s", path, e)

            if faiss_dir.exists():
                try:
                    shutil.rmtree(faiss_dir)
                except Exception as e:
                    logger.warning("Could not delete faiss dir: %s", e)

            # 3. Clear in-memory maps
            _original_filenames.clear()
            JobManager().jobs.clear()

            # 4. Reload (now empty) knowledge into memory
            KnowledgeManager().reload()

            logger.warning("RESET complete — %d file(s) removed.", files_deleted)

            job_manager = JobManager()
            job_id = job_manager.create_job()
            job_manager.update_job_status(job_id, JobStatus.READY)

            return ResetResponse(
                success=True,
                message=f"Reset complete. {files_deleted} file(s) deleted and all knowledge wiped.",
                files_deleted=files_deleted,
                job_id=job_id,
            )
