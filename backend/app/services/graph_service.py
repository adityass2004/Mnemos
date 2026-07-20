from app.models.schemas import GraphResponse, GraphNode, GraphEdge

class GraphService:
    async def get_graph(self) -> GraphResponse:
        nodes = [
            GraphNode(id="boiler-1", label="Boiler", properties={"location": "Sector A", "pressure_limit": "200psi"}),
            GraphNode(id="valve-2", label="Safety Valve", properties={"type": "Relief", "status": "Open"})
        ]
        edges = [
            GraphEdge(source="boiler-1", target="valve-2", relation="regulated_by")
        ]
        return GraphResponse(nodes=nodes, edges=edges)
