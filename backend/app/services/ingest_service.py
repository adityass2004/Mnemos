import uuid
import logging
from app.models.schemas import IngestRequest, IngestResponse
from app.services.knowledge_manager import KnowledgeManager

logger = logging.getLogger("Mnemos.IngestService")

class IngestService:
    def __init__(self):
        self._manager = KnowledgeManager()

    async def ingest_document(self, request: IngestRequest) -> IngestResponse:
        doc_id = f"doc-{uuid.uuid4().hex[:8]}"
        nodes_extracted = 0
        if self._manager.graph is not None:
            nodes_extracted = self._manager.graph.number_of_nodes()
        return IngestResponse(
            document_id=doc_id,
            status="SUCCESS",
            nodes_extracted=nodes_extracted
        )
