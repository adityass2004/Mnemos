import logging
from typing import Any
from sentence_transformers import SentenceTransformer
from app.services.knowledge_manager import KnowledgeManager

logger = logging.getLogger("Mnemos.FaissWrapper")

class FaissWrapper:
    def __init__(self):
        self.manager = KnowledgeManager()
        self.embedder = SentenceTransformer("all-MiniLM-L6-v2")
        
    async def index_text(self, text: str, doc_id: str) -> bool:
        return True

    async def search_vector(self, query: str, top_k: int = 5) -> list[dict[str, Any]]:
        if self.manager.faiss_index is None or self.manager.metadata is None:
            logger.warning("FAISS index or metadata not loaded.")
            return []
        
        try:
            query_embedding = self.embedder.encode([query], convert_to_numpy=True).astype("float32")
            distances, indices = self.manager.faiss_index.search(query_embedding, top_k)
            
            results = []
            for dist, idx in zip(distances[0], indices[0]):
                if idx < len(self.manager.metadata):
                    meta = self.manager.metadata[idx]
                    results.append({
                        "doc_id": meta.get("metadata", {}).get("document_id", f"chunk-{idx}"),
                        "score": float(1.0 - (dist / 2.0)),  # Convert L2 distance to a similarity score
                        "content": meta.get("text", "")
                    })
            return results
        except Exception as e:
            logger.error(f"Error during vector search: {e}", exc_info=True)
            return []
