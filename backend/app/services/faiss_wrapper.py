from typing import Any

class FaissWrapper:
    async def index_text(self, text: str, doc_id: str) -> bool:
        return True

    async def search_vector(self, query_vector: list[float], top_k: int = 5) -> list[dict[str, Any]]:
        return [
            {"doc_id": "doc-1", "score": 0.89, "content": "Boiler emergency venting standards"},
            {"doc_id": "doc-2", "score": 0.74, "content": "Safety valve inspection checklist"}
        ]
