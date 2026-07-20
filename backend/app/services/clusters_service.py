from app.models.schemas import ClustersResponse, ClusterItem

class ClustersService:
    async def get_clusters(self) -> ClustersResponse:
        clusters = [
            ClusterItem(cluster_id=1, member_ids=["boiler-1", "boiler-2", "heater-5"]),
            ClusterItem(cluster_id=2, member_ids=["valve-2", "valve-4", "pump-1"])
        ]
        return ClustersResponse(total_clusters=len(clusters), clusters=clusters)
