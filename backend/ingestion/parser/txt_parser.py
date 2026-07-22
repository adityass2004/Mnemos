from ingestion.parser.document import Document

class TXTParser:
    def parse(self, file_path: str) -> Document:
        return Document(
            title=file_path.split("/")[-1].split("\\")[-1],
            content="Parsed text content from plain text document.",
            metadata={"character_count": 8900},
            source_type="txt"
        )
