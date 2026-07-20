from typing import Any

class KnowledgeGraphWrapper:
    async def query_nodes(self, node_type: str) -> list[dict[str, Any]]:
        return [
            {"id": "boiler-1", "type": "Boiler", "status": "operational"},
            {"id": "pump-2", "type": "Pump", "status": "warning"}
        ]

    async def add_relationship(self, source: str, target: str, relation: str) -> bool:
        return True
