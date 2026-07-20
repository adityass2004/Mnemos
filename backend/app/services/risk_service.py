from app.models.schemas import RiskResponse

class RiskService:
    async def get_risk(self, equipment: str) -> RiskResponse:
        return RiskResponse(
            equipment=equipment,
            risk_level="MODERATE",
            score=0.45,
            details=["Slight vibration deviation", "Operating hours near maintenance window threshold"]
        )
