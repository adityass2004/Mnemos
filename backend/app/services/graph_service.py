import logging
from app.models.schemas import GraphResponse, GraphNode, GraphEdge
from app.services.knowledge_manager import KnowledgeManager

logger = logging.getLogger("Mnemos.GraphService")

class GraphService:
    def __init__(self):
        self.manager = KnowledgeManager()
        
    async def get_graph(self) -> GraphResponse:
        if self.manager.graph is None:
            logger.warning("Knowledge graph not loaded, returning empty graph.")
            return GraphResponse(nodes=[], edges=[])
            
        nodes = []
        for node_id, data in self.manager.graph.nodes(data=True):
            nodes.append(
                GraphNode(
                    id=node_id,
                    label=data.get("label", node_id),
                    properties={k: str(v) for k, v in data.get("properties", {}).items()}
                )
            )
            
        edges = []
        for source, target, data in self.manager.graph.edges(data=True):
            edges.append(
                GraphEdge(
                    source=source,
                    target=target,
                    relation=data.get("relation", "related_to")
                )
            )
            
        return GraphResponse(nodes=nodes, edges=edges)
