from app.models.schemas import IngestRequest, IngestResponse

class IngestService:
    async def ingest_document(self, request: IngestRequest) -> IngestResponse:
        return IngestResponse(
            document_id="doc-9821-ab",
            status="SUCCESS",
            nodes_extracted=14
        )
