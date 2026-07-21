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
        """Standard process and index (initializes or overwrites the index)"""
        os.makedirs(output_dir, exist_ok=True)
        
        # Save raw embeddings
        embeddings = self.model.encode(chunks, convert_to_numpy=True)
        np.save(os.path.join(output_dir, "embeddings.npy"), embeddings)
        
        # Save index
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

    def add_embeddings(self, chunks: list[str], metadata_list: list[dict], output_dir: str):
        """Incrementally add new embeddings and rebuild index"""
        if not chunks or not metadata_list:
            return
            
        os.makedirs(output_dir, exist_ok=True)
        new_embeddings = self.model.encode(chunks, convert_to_numpy=True)
        
        embeddings_path = os.path.join(output_dir, "embeddings.npy")
        metadata_path = os.path.join(output_dir, "metadata.json")
        
        # Load existing data if available
        existing_embeddings = None
        existing_metadata = []
        
        if os.path.exists(embeddings_path):
            try:
                existing_embeddings = np.load(embeddings_path)
            except Exception:
                existing_embeddings = None
        
        if os.path.exists(metadata_path):
            try:
                with open(metadata_path, "r", encoding="utf-8") as f:
                    existing_metadata = json.load(f)
            except Exception:
                existing_metadata = []
        
        # Combine embeddings
        if existing_embeddings is not None and len(existing_embeddings) > 0:
            combined_embeddings = np.concatenate([existing_embeddings, new_embeddings], axis=0)
        else:
            combined_embeddings = new_embeddings
        
        np.save(embeddings_path, combined_embeddings)
        
        # Build combined metadata list
        start_idx = len(existing_metadata)
        for idx, (chunk, meta) in enumerate(zip(chunks, metadata_list)):
            existing_metadata.append({
                "chunk_id": str(start_idx + idx),
                "text": chunk,
                "metadata": meta
            })
        
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(existing_metadata, f, indent=2)
        
        # Rebuild index from combined embeddings
        index = faiss.IndexFlatL2(self.dimension)
        index.add(combined_embeddings.astype("float32"))
        faiss.write_index(index, os.path.join(output_dir, "index.faiss"))

    def remove_embeddings(self, document_id: str, output_dir: str):
        """Remove embeddings and metadata belonging to a document and rebuild index"""
        metadata_path = os.path.join(output_dir, "metadata.json")
        embeddings_path = os.path.join(output_dir, "embeddings.npy")
        
        if not os.path.exists(metadata_path) or not os.path.exists(embeddings_path):
            return
            
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
            embeddings = np.load(embeddings_path)
        except Exception:
            return
            
        # Find indices of chunks to keep
        keep_indices = []
        keep_metadata = []
        
        for idx, entry in enumerate(metadata):
            entry_doc_id = entry.get("metadata", {}).get("document_id")
            if entry_doc_id != document_id:
                keep_indices.append(idx)
                keep_metadata.append(entry)
                
        # If no changes, do nothing
        if len(keep_indices) == len(metadata):
            return
            
        if not keep_indices:
            # All removed
            if os.path.exists(metadata_path):
                os.remove(metadata_path)
            if os.path.exists(embeddings_path):
                os.remove(embeddings_path)
            index_path = os.path.join(output_dir, "index.faiss")
            if os.path.exists(index_path):
                os.remove(index_path)
            return
            
        # Update embeddings and metadata records
        filtered_embeddings = embeddings[keep_indices]
        np.save(embeddings_path, filtered_embeddings)
        
        # Reset chunk_id values to match sequential positions
        for idx, entry in enumerate(keep_metadata):
            entry["chunk_id"] = str(idx)
            
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(keep_metadata, f, indent=2)
            
        # Rebuild index
        index = faiss.IndexFlatL2(self.dimension)
        index.add(filtered_embeddings.astype("float32"))
        faiss.write_index(index, os.path.join(output_dir, "index.faiss"))
