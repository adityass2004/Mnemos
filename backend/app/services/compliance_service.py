from app.models.schemas import ComplianceResponse

class ComplianceService:
    async def check_compliance(self, procedure: str) -> ComplianceResponse:
        return ComplianceResponse(
            procedure=procedure,
            compliant=True,
            issues=[]
        )
