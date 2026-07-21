import joblib
import logging
import numpy as np
from pathlib import Path

logger = logging.getLogger("Mnemos.RiskModelWrapper")

_MODELS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "models"

class RiskModelWrapper:
    _model = None
    _feature_names: list[str] | None = None

    def _load(self):
        if self._model is None:
            try:
                self._model = joblib.load(_MODELS_DIR / "risk_model.pkl")
                self._feature_names = joblib.load(_MODELS_DIR / "feature_names.pkl")
                logger.info("Risk model loaded.")
            except Exception as e:
                logger.error(f"Failed to load risk model: {e}")

    async def predict_failure(self, features: dict[str, float]) -> dict[str, float]:
        self._load()
        if self._model is None or self._feature_names is None:
            return {"failure_probability": 0.0, "anomaly_score": 0.0}
        try:
            row = np.array([[features.get(f, 0.0) for f in self._feature_names]], dtype=np.float32)
            prob = float(self._model.predict_proba(row)[0][1])
            return {"failure_probability": prob, "anomaly_score": prob}
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return {"failure_probability": 0.0, "anomaly_score": 0.0}
