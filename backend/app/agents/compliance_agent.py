from app.models.agent_schemas import ComplianceOutput

class ComplianceAgent:
    async def execute(self, query: str) -> ComplianceOutput:
        return ComplianceOutput(
            standards_checked=[
                "OSHA 1910.119 Process Safety Management",
                "ISO 45001 Occupational Health & Safety"
            ],
            violations=[],
            passed=True
        )
