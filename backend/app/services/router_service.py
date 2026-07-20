from typing import Any
from app.agents.copilot_agent import CopilotAgent
from app.agents.rca_agent import RcaAgent
from app.agents.lessons_agent import LessonsAgent
from app.agents.compliance_agent import ComplianceAgent

class RouterService:
    def __init__(self):
        self.copilot = CopilotAgent()
        self.rca = RcaAgent()
        self.lessons = LessonsAgent()
        self.compliance = ComplianceAgent()

    async def route_and_execute(self, query: str) -> dict[str, Any]:
        query_lower = query.lower()

        if any(kw in query_lower for kw in ["rca", "cause", "fail", "why"]):
            output = await self.rca.execute(query)
            return {"agent": "RcaAgent", "output": output.model_dump()}

        if any(kw in query_lower for kw in ["lesson", "history", "past", "incident"]):
            output = await self.lessons.execute(query)
            return {"agent": "LessonsAgent", "output": output.model_dump()}

        if any(kw in query_lower for kw in ["compliance", "standard", "regulation", "safe"]):
            output = await self.compliance.execute(query)
            return {"agent": "ComplianceAgent", "output": output.model_dump()}

        output = await self.copilot.execute(query)
        return {"agent": "CopilotAgent", "output": output.model_dump()}
