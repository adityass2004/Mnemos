from fastapi import Request
from fastapi.responses import JSONResponse

class AntigravityException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)

class TelemetryAnomalyException(AntigravityException):
    def __init__(self, message: str):
        super().__init__(message, status_code=422)

class AgentFailureException(AntigravityException):
    def __init__(self, message: str):
        super().__init__(message, status_code=500)

class DocumentNotFoundException(AntigravityException):
    def __init__(self, filename: str):
        super().__init__(f"Document not found: {filename}", status_code=404)

class UnsupportedFileTypeException(AntigravityException):
    def __init__(self, filename: str, extension: str, allowed: list):
        allowed_str = ", ".join(allowed)
        super().__init__(f"'{filename}' has an unsupported file type ('{extension}'). Allowed types: {allowed_str}.", status_code=415)

class FileTooLargeException(AntigravityException):
    def __init__(self, filename: str, size_bytes: int, max_size_bytes: int):
        size_mb = size_bytes / (1024 * 1024)
        max_mb = max_size_bytes / (1024 * 1024)
        super().__init__(f"'{filename}' is too large ({size_mb:.1f} MB). Maximum allowed size is {max_mb:.0f} MB.", status_code=413)

class DuplicateFileException(AntigravityException):
    def __init__(self, filename: str, existing_filename: str):
        super().__init__(f"'{filename}' is a duplicate of an already uploaded file ('{existing_filename}'). Duplicate files are not allowed.", status_code=409)

class InvalidFileException(AntigravityException):
    def __init__(self, filename: str, reason: str):
        super().__init__(f"'{filename}' could not be processed: {reason}", status_code=422)

class IngestionTimeoutException(AntigravityException):
    def __init__(self, job_id: str):
        super().__init__(f"Ingestion job '{job_id}' timed out. The document may be too large or complex. Please try again.", status_code=504)

class IngestionFailedException(AntigravityException):
    def __init__(self, job_id: str, reason: str):
        super().__init__(f"Ingestion job '{job_id}' failed: {reason}", status_code=500)

async def antigravity_exception_handler(request: Request, exc: AntigravityException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.__class__.__name__, "message": exc.message}
    )
