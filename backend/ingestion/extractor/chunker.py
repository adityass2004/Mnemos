class DocumentChunker:
    def split_text(self, text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
        words = text.split()
        chunks = []
        step = chunk_size - overlap
        for i in range(0, len(words), step):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk:
                chunks.append(chunk)
        return chunks
