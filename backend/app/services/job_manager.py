import logging
import uuid
from datetime import datetime
from typing import Dict, Optional
from app.models.schemas import JobStatus, JobStatusResponse

logger = logging.getLogger("Mnemos.JobManager")

class JobManager:
    _instance: Optional["JobManager"] = None
    _initialized: bool = False

    def __new__(cls) -> "JobManager":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self.jobs: Dict[str, Dict] = {}  # job_id -> job dict
            self._initialized = True

    def create_job(self) -> str:
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = {
            "job_id": job_id,
            "status": JobStatus.QUEUED,
            "progress": 0,
            "started_at": None,
            "finished_at": None,
            "duration": None,
            "documents_processed": None,
            "errors": []
        }
        logger.info(f"Created new job: {job_id}")
        return job_id

    def get_job(self, job_id: str) -> Optional[Dict]:
        return self.jobs.get(job_id)

    def update_job_status(self, job_id: str, status: JobStatus):
        if job_id not in self.jobs:
            logger.warning(f"Tried to update non-existent job: {job_id}")
            return
        self.jobs[job_id]["status"] = status
        logger.info(f"Job {job_id} status updated to {status}")

        if status == JobStatus.PROCESSING and not self.jobs[job_id]["started_at"]:
            self.jobs[job_id]["started_at"] = datetime.utcnow()

        if status in [JobStatus.COMPLETED, JobStatus.FAILED, JobStatus.READY]:
            if not self.jobs[job_id]["finished_at"]:
                self.jobs[job_id]["finished_at"] = datetime.utcnow()
            if self.jobs[job_id]["started_at"] and self.jobs[job_id]["finished_at"]:
                duration = (self.jobs[job_id]["finished_at"] - self.jobs[job_id]["started_at"]).total_seconds()
                self.jobs[job_id]["duration"] = duration

    def update_job_progress(self, job_id: str, progress: int):
        if job_id not in self.jobs:
            logger.warning(f"Tried to update progress on non-existent job: {job_id}")
            return
        self.jobs[job_id]["progress"] = min(max(progress, 0), 100)
        logger.debug(f"Job {job_id} progress: {progress}%")

    def add_job_error(self, job_id: str, error: str):
        if job_id not in self.jobs:
            logger.warning(f"Tried to add error to non-existent job: {job_id}")
            return
        self.jobs[job_id]["errors"].append(error)
        logger.error(f"Job {job_id} error: {error}")

    def set_documents_processed(self, job_id: str, count: int):
        if job_id not in self.jobs:
            logger.warning(f"Tried to set documents processed on non-existent job: {job_id}")
            return
        self.jobs[job_id]["documents_processed"] = count

    def get_job_status_response(self, job_id: str) -> Optional[JobStatusResponse]:
        job = self.get_job(job_id)
        if not job:
            return None
        return JobStatusResponse(**job)
