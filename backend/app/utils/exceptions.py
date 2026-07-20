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

async def antigravity_exception_handler(request: Request, exc: AntigravityException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.__class__.__name__, "message": exc.message}
    )
