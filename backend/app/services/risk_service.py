import csv
import logging
from pathlib import Path
from app.models.schemas import RiskResponse
from app.services.risk_model_wrapper import RiskModelWrapper

logger = logging.getLogger("Mnemos.RiskService")

_CSV_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "equipment_features.csv"
_NUMERIC_FEATURES = [
    "age_years", "days_since_last_maintenance", "maintenance_frequency_per_year",
    "avg_operating_temp_c", "avg_operating_pressure_bar", "num_incidents_last_2_years",
    "num_near_misses_last_year", "sensor_anomaly_count_30d", "overdue_inspection"
]

def _load_equipment_features() -> dict[str, dict]:
    features: dict[str, dict] = {}
    try:
        with open(_CSV_PATH, newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                features[row["equipment_id"].upper()] = row
    except Exception as e:
        logger.error(f"Failed to load equipment_features.csv: {e}")
    return features

_EQUIPMENT_FEATURES = _load_equipment_features()


class RiskService:
    def __init__(self):
        self._wrapper = RiskModelWrapper()

    async def get_risk(self, equipment: str) -> RiskResponse:
        row = _EQUIPMENT_FEATURES.get(equipment.upper())
        if row is None:
            return RiskResponse(
                equipment=equipment,
                risk_level="UNKNOWN",
                score=0.0,
                details=[f"Equipment '{equipment}' not found in feature database."]
            )

        features = {f: float(row.get(f, 0)) for f in _NUMERIC_FEATURES}
        result = await self._wrapper.predict_failure(features)
        prob = result["failure_probability"]

        if prob >= 0.7:
            risk_level = "HIGH"
        elif prob >= 0.4:
            risk_level = "MODERATE"
        else:
            risk_level = "LOW"

        details = [
            f"Equipment type: {row.get('equipment_type', 'N/A')}",
            f"Age: {row.get('age_years')} years",
            f"Days since last maintenance: {row.get('days_since_last_maintenance')}",
            f"Sensor anomalies (30d): {row.get('sensor_anomaly_count_30d')}",
            f"Incidents (last 2 years): {row.get('num_incidents_last_2_years')}",
        ]
        if row.get("overdue_inspection") == "1":
            details.append("Inspection is overdue.")

        return RiskResponse(
            equipment=equipment,
            risk_level=risk_level,
            score=round(prob, 4),
            details=details
        )
