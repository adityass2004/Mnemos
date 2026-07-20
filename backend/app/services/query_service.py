from app.models.schemas import QueryRequest, QueryResponse

class QueryService:
    async def query_knowledge_graph(self, request: QueryRequest) -> QueryResponse:
        return QueryResponse(
            result=f"Query '{request.prompt}' processed. Found relevant relationships.",
            sources=["knowledge_graph_v1.json", "industrial_logs_2026.csv"]
        )
