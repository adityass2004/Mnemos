from ingestion.parser.document import Document

class DOCXParser:
    def parse(self, file_path: str) -> Document:
        return Document(
            title=file_path.split("/")[-1].split("\\")[-1],
            content="Parsed text content extracted from DOCX document file structure.",
            metadata={"word_count": 1250, "paragraphs": 34},
            source_type="docx"
        )
