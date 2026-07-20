from app.models.agent_schemas import CopilotOutput

class CopilotAgent:
    async def execute(self, query: str) -> CopilotOutput:
        return CopilotOutput(
            message=f"Industrial assistant copilot resolved query: '{query}'",
            suggested_steps=[
                "Confirm system telemetry metrics",
                "Verify sensor connection status"
            ]
        )
