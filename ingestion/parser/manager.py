from ingestion.parser.document import Document
from ingestion.parser.pdf_parser import PDFParser
from ingestion.parser.docx_parser import DOCXParser
from ingestion.parser.txt_parser import TXTParser

class ParserManager:
    def __init__(self):
        self.pdf = PDFParser()
        self.docx = DOCXParser()
        self.txt = TXTParser()

    def parse_file(self, file_path: str) -> Document:
        ext = file_path.split(".")[-1].lower()
        if ext == "pdf":
            return self.pdf.parse(file_path)
        elif ext == "docx":
            return self.docx.parse(file_path)
        else:
            return self.txt.parse(file_path)
