import json
import logging
from pathlib import Path
from app.models.agent_schemas import RcaOutput

logger = logging.getLogger("Mnemos.RcaAgent")

_INCIDENTS_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "incidents.json"

def _load_incidents() -> list[dict]:
    try:
        with open(_INCIDENTS_PATH, "r", encoding="utf-8") as f:
            return json.load(f).get("incidents", [])
    except Exception as e:
        logger.error(f"Failed to load incidents.json: {e}")
        return []

_INCIDENTS = _load_incidents()


class RcaAgent:
    async def execute(self, query: str) -> RcaOutput:
        lower = query.lower()
        relevant = [
            inc for inc in _INCIDENTS
            if any(kw in inc.get("text", "").lower() or kw in inc.get("title", "").lower()
                   for kw in lower.split())
        ]
        if not relevant:
            relevant = _INCIDENTS[:2]

        causes = [f"{inc['id']}: {inc['title']} ({inc['date']})" for inc in relevant[:3]]
        scores = {inc["id"]: round(1.0 / (i + 1), 2) for i, inc in enumerate(relevant[:3])}
        tests = [
            "Inspect equipment referenced in matched incidents.",
            "Review maintenance logs for overdue tasks.",
            "Check sensor anomaly counts against historical baseline."
        ]
        return RcaOutput(
            possible_causes=causes,
            confidence_scores=scores,
            recommended_tests=tests
        )
