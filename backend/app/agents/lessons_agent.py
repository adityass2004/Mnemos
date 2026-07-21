import json
import logging
from pathlib import Path
from app.models.agent_schemas import LessonsOutput

logger = logging.getLogger("Mnemos.LessonsAgent")

_INCIDENTS_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "incidents.json"

def _load_incidents() -> list[dict]:
    try:
        with open(_INCIDENTS_PATH, "r", encoding="utf-8") as f:
            return json.load(f).get("incidents", [])
    except Exception as e:
        logger.error(f"Failed to load incidents.json: {e}")
        return []

_INCIDENTS = _load_incidents()


class LessonsAgent:
    async def execute(self, query: str) -> LessonsOutput:
        lower = query.lower()
        matched = [
            f"{inc['id']} ({inc['date']}): {inc['title']} — {inc['text']}"
            for inc in _INCIDENTS
            if any(kw in inc.get("text", "").lower() or kw in inc.get("title", "").lower()
                   for kw in lower.split())
        ] or [
            f"{inc['id']} ({inc['date']}): {inc['title']}"
            for inc in _INCIDENTS[:3]
        ]
        return LessonsOutput(
            historical_incidents=matched[:5],
            preventative_measures=[
                "Review and action all open maintenance work orders.",
                "Ensure lubrication and inspection routes are not overdue.",
                "Log all near-misses to the lessons-learned database."
            ]
        )
