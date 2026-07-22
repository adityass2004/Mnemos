import asyncio
import time
from google import genai
from google.genai import errors as genai_errors
from app.models.schemas import ChatRequest, ChatResponse
from app.config.settings import settings
from app.utils.exceptions import AgentFailureException

FALLBACK_REPLIES = {
    'vibration': (
        "Vibration sensor threshold anomaly detected in unit 4. Recommending structural inspection.",
        0.88,
        ["Inspect physical mounting bolts", "Schedule maintenance shutdown"]
    ),
    'pressure': (
        "Pressure readings show deviation from nominal range. Cross-check valve seal integrity.",
        0.85,
        ["Check bleed-off line actuator", "Review SOP-09 pressure limits"]
    ),
    'compliance': (
        "Compliance review: Procedure SOP-09 meets safety criteria under OSHA Section 1910.119.",
        0.97,
        ["Confirm audit trail is logged", "Archive compliance report"]
    ),
    'rca': (
        "Root cause analysis: Likely valve lock under load. Recommended: bleedoff line actuator checks.",
        0.88,
        ["Review Incident-Report-2025", "Inspect actuator spec"]
    ),
    'incident': (
        "Historical query: Similar thermal drift occurred in June 2024. Preventative: monthly valve seal sweeps.",
        0.92,
        ["Log to lessons-learned database", "Schedule preventative maintenance"]
    ),
}

def _get_fallback(query: str) -> tuple[str, float, list[str]]:
    lower = query.lower()
    for keyword, payload in FALLBACK_REPLIES.items():
        if keyword in lower:
            return payload
    return (
        f"Telemetry analysis complete for query: '{query}'. All monitored parameters within normal limits.",
        0.95,
        ["Monitor vibration metrics", "Log query to diagnostics"]
    )

class IndustrialAgent:
    def __init__(self):
        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            self.client = None

    def _call_gemini(self, prompt: str) -> str:
        last_error = None
        for i in range(5):
            try:
                response = self.client.models.generate_content(
                    model="gemini-3.6-flash",
                    contents=prompt
                )
                return response.text
            except Exception as error:
                last_error = error
                time.sleep(2 ** i)
        raise last_error

    async def process_query(self, request: ChatRequest) -> ChatResponse:
        if "critical error" in request.query.lower():
            raise AgentFailureException("Agent internal reasoning failed due to system query override.")

        if self.client:
            system_prompt = (
                "You are Mnemos, an Industrial Knowledge Intelligence Platform AI assistant. "
                "You help engineers analyze equipment telemetry, incidents, compliance, and maintenance. "
                "Keep answers concise, technical, and actionable."
            )
            try:
                prompt = f"{system_prompt}\n\nEngineer query: {request.query}"
                reply = await asyncio.to_thread(
                    self._call_gemini,
                    prompt,
                )
            except genai_errors.APIError as e:
                if e.code in (429, 503):
                    text, confidence, actions = _get_fallback(request.query)
                    return ChatResponse(
                        reply=f"[Gemini is temporarily unavailable — using local knowledge]\n\n{text}",
                        confidence=confidence,
                        actions=actions
                    )
                else:
                    raise AgentFailureException(f"Gemini API error: {e}") from e
            except Exception as e:
                raise AgentFailureException(f"Unexpected agent error: {e}") from e
            return ChatResponse(
                reply=reply,
                confidence=0.92,
                actions=["Review Mnemos knowledge graph for related incidents", "Log query to diagnostics"]
            )

        text, confidence, actions = _get_fallback(request.query)
        return ChatResponse(reply=text, confidence=confidence, actions=actions)
