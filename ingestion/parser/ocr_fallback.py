from ingestion.parser.document import Document

class OCRFallback:
    def perform_ocr(self, file_path: str) -> Document:
        return Document(
            title=file_path.split("/")[-1].split("\\")[-1],
            content="Extracted scanned document text via simulated optical character recognition fallback.",
            metadata={"ocr_processed": True},
            source_type="image_scan"
        )
