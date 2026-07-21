import logging
from typing import Any
from app.services.knowledge_manager import KnowledgeManager

logger = logging.getLogger("Mnemos.KnowledgeGraphWrapper")

class KnowledgeGraphWrapper:
    def __init__(self):
        self.manager = KnowledgeManager()
        
    async def query_nodes(self, node_type: str | None = None) -> list[dict[str, Any]]:
        if self.manager.graph is None:
            logger.warning("Knowledge graph not loaded.")
            return []
        
        try:
            nodes = []
            for node_id, data in self.manager.graph.nodes(data=True):
                if node_type is None or data.get("type") == node_type:
                    nodes.append({
                        "id": node_id,
                        "type": data.get("type", "unknown"),
                        "label": data.get("label", node_id),
                        **data.get("properties", {})
                    })
            return nodes
        except Exception as e:
            logger.error(f"Error querying nodes: {e}", exc_info=True)
            return []

    async def add_relationship(self, source: str, target: str, relation: str) -> bool:
        return True
