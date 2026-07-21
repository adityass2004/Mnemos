import json
import logging
from pathlib import Path
from app.models.schemas import ClustersResponse, ClusterItem

logger = logging.getLogger("Mnemos.ClustersService")

_CLUSTERS_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "clusters.json"


class ClustersService:
    async def get_clusters(self) -> ClustersResponse:
        try:
            with open(_CLUSTERS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            clusters = [
                ClusterItem(
                    cluster_id=c["id"],
                    member_ids=[inc["id"] for inc in c.get("incidents", [])]
                )
                for c in data.get("clusters", [])
            ]
            return ClustersResponse(total_clusters=data.get("total_clusters", len(clusters)), clusters=clusters)
        except Exception as e:
            logger.error(f"Failed to load clusters.json: {e}")
            return ClustersResponse(total_clusters=0, clusters=[])
