import os
import json
import numpy as np
import faiss
from sentence_transformers import SentenceTransformer

class EmbeddingPipeline:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()

    def process_and_index(self, chunks: list[str], metadata_list: list[dict], output_dir: str):
        os.makedirs(output_dir, exist_ok=True)
        
        embeddings = self.model.encode(chunks, convert_to_numpy=True)
        
        index = faiss.IndexFlatL2(self.dimension)
        index.add(embeddings.astype("float32"))
        
        faiss.write_index(index, os.path.join(output_dir, "index.faiss"))
        
        metadata_records = []
        for idx, (chunk, meta) in enumerate(zip(chunks, metadata_list)):
            metadata_records.append({
                "chunk_id": str(idx),
                "text": chunk,
                "metadata": meta
            })
            
        with open(os.path.join(output_dir, "metadata.json"), "w", encoding="utf-8") as f:
            json.dump(metadata_records, f, indent=2)
