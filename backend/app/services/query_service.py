import logging
from app.models.schemas import QueryRequest, QueryResponse
from app.services.faiss_wrapper import FaissWrapper

logger = logging.getLogger("Mnemos.QueryService")

class QueryService:
    def __init__(self):
        self._faiss = FaissWrapper()

    async def query_knowledge_graph(self, request: QueryRequest) -> QueryResponse:
        results = await self._faiss.search_vector(request.prompt, top_k=5)
        if not results:
            return QueryResponse(result="No relevant knowledge found.", sources=[])
        combined = " ".join(r["content"] for r in results if r.get("content"))
        sources = list({r["doc_id"] for r in results if r.get("doc_id")})
        return QueryResponse(result=combined[:2000], sources=sources)
