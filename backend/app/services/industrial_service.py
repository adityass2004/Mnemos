from app.models.schemas import TelemetryRequest, TelemetryResponse
from app.utils.exceptions import TelemetryAnomalyException

class IndustrialService:
    async def analyze_telemetry(self, request: TelemetryRequest) -> TelemetryResponse:
        anomaly = False
        status = "OPERATIONAL"
        recommendation = "No intervention required. Continue monitoring."

        if request.temperature > 100.0 or request.pressure > 150.0:
            anomaly = True
            status = "CRITICAL"
            recommendation = "Initiate emergency cooling system and pressure relief valve."
            if request.temperature > 150.0:
                raise TelemetryAnomalyException("Critical safety threshold breached. Automatic shutdown required.")

        return TelemetryResponse(
            machine_id=request.machine_id,
            status=status,
            anomaly_detected=anomaly,
            recommendation=recommendation
        )
