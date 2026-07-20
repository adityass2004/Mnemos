from ingestion.parser.document import Document
from ingestion.parser.ocr_fallback import OCRFallback

class PDFParser:
    def __init__(self):
        self.ocr = OCRFallback()

    def parse(self, file_path: str) -> Document:
        if "scanned" in file_path.lower():
            return self.ocr.perform_ocr(file_path)

        return Document(
            title=file_path.split("/")[-1].split("\\")[-1],
            content="Parsed textual content extracted from PDF document format.",
            metadata={"pages": 5, "pdf_version": "1.7"},
            source_type="pdf"
        )
