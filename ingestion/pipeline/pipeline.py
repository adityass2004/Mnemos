import os
import sys
import argparse
import logging
from datetime import datetime, timezone

logger = logging.getLogger("Mnemos.IngestionPipeline")

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
INGESTION_ROOT = os.path.dirname(os.path.dirname(CURRENT_DIR))
BACKEND_ROOT = os.path.join(INGESTION_ROOT, "backend")

# Ensure ingestion can import backend application modules when executed from the repository root.
sys.path.insert(0, BACKEND_ROOT)
from ingestion.parser.manager import ParserManager
from ingestion.extractor.chunker import DocumentChunker
from ingestion.extractor.entity_extractor import EntityExtractor
from ingestion.embeddings.pipeline import EmbeddingPipeline
from ingestion.graph.graph_builder import GraphBuilder
from ingestion.graph.serializer import GraphSerializer
from app.utils.file_utils import compute_file_hash, load_processed_files, save_processed_files

class IngestionPipeline:
    def __init__(self):
        self.parser_manager = ParserManager()
        self.chunker = DocumentChunker()
        self.extractor = EntityExtractor()
        self.embedding_pipeline = EmbeddingPipeline()
        self.graph_builder = GraphBuilder()
        self.serializer = GraphSerializer()

    def run(self, input_dir: str, output_dir: str, progress_callback=None):
        logger.info("Starting Incremental Ingestion Pipeline...")
        
        if progress_callback:
            progress_callback(5)
        
        if not os.path.exists(input_dir):
            raise FileNotFoundError(f"Input directory does not exist: {input_dir}")

        os.makedirs(output_dir, exist_ok=True)
        faiss_dir = os.path.join(output_dir, "faiss")
        os.makedirs(faiss_dir, exist_ok=True)
        
        # 1. Load existing graph
        graph_path = os.path.join(output_dir, "graph.json")
        if os.path.exists(graph_path):
            try:
                import json
                with open(graph_path, "r", encoding="utf-8") as f:
                    graph_data = json.load(f)
                for node in graph_data.get("nodes", []):
                    self.graph_builder.add_node(
                        node_id=node["id"],
                        label=node.get("label"),
                        node_type=node.get("type"),
                        properties=node.get("properties", {})
                    )
                for edge in graph_data.get("edges", []):
                    self.graph_builder.add_edge(
                        source=edge["source"],
                        target=edge["target"],
                        relation=edge.get("relation"),
                        properties=edge.get("properties", {})
                    )
                logger.info("Loaded existing graph structure: %d nodes, %d edges", 
                            self.graph_builder.graph.number_of_nodes(), 
                            self.graph_builder.graph.number_of_edges())
            except Exception as e:
                logger.warning(f"Could not load existing graph: {e}")
        
        # 2. Get list of files in uploads
        files = [os.path.join(input_dir, f) for f in os.listdir(input_dir) 
                 if os.path.isfile(os.path.join(input_dir, f)) and not f.startswith('.')]
        
        # 3. Load processed files tracker
        processed_tracker = load_processed_files()
        
        # Track hash to file path for current files
        current_hashes = {}
        for fpath in files:
            if os.path.basename(fpath) == ".gitkeep":
                continue
            try:
                fhash = compute_file_hash(fpath)
                current_hashes[fhash] = fpath
            except Exception as e:
                logger.error(f"Error computing hash for {fpath}: {e}")
                
        # 4. Handle Deletions: Files in tracker but no longer in uploads
        hashes_to_remove = []
        for fhash, info in list(processed_tracker.items()):
            filename = info.get("filename")
            doc_id = info.get("document_id")
            
            # Check if this filename is still in uploads
            still_exists = any(os.path.basename(fpath) == filename for fpath in files)
            if not still_exists:
                logger.info(f"Detected deletion of document: {filename} (doc_id: {doc_id})")
                hashes_to_remove.append(fhash)
                
                # Remove from graph
                if doc_id and self.graph_builder.graph.has_node(doc_id):
                    # Find all chunk nodes contained in document
                    chunks_to_remove = []
                    for u, v, data in list(self.graph_builder.graph.edges(data=True)):
                        if u == doc_id and data.get("relation") == "contains":
                            chunks_to_remove.append(v)
                            
                    # Remove document node
                    self.graph_builder.graph.remove_node(doc_id)
                    
                    # Remove chunk nodes
                    for chunk in chunks_to_remove:
                        if self.graph_builder.graph.has_node(chunk):
                            self.graph_builder.graph.remove_node(chunk)
                            
                    # Clean up orphan entity nodes (Equipment, Incident, Regulation)
                    orphan_nodes = [node for node, degree in dict(self.graph_builder.graph.degree()).items() 
                                    if degree == 0 and node != doc_id]
                    for orphan in orphan_nodes:
                        self.graph_builder.graph.remove_node(orphan)
                
                # Remove from FAISS index and metadata
                if doc_id:
                    self.embedding_pipeline.remove_embeddings(doc_id, faiss_dir)
                    
        # Update tracker with removals
        for fhash in hashes_to_remove:
            if fhash in processed_tracker:
                del processed_tracker[fhash]
                
        # 5. Handle Additions/Modifications
        new_files_to_process = []
        for fhash, fpath in current_hashes.items():
            tracker_entry = processed_tracker.get(fhash)
            if tracker_entry is None:
                # Never seen before
                new_files_to_process.append((fhash, fpath))
            else:
                # Seen before but not yet processed by ingestion
                if not tracker_entry.get("processed_at") or not tracker_entry.get("document_id"):
                    new_files_to_process.append((fhash, fpath))
                else:
                    logger.debug("Skipping already processed file %s", fpath)

        logger.info("Ingestion pipeline updates: %d new files to process, %d deleted files to remove.",
                    len(new_files_to_process), len(hashes_to_remove))
        
        if progress_callback:
            progress_callback(10)
            
        total_new = len(new_files_to_process)
        
        for idx, (fhash, file_path) in enumerate(new_files_to_process):
            filename = os.path.basename(file_path)
            doc = self.parser_manager.parse_file(file_path)
            doc_id = f"doc_{doc.title.replace('.', '_')}"
            
            # Add doc node
            self.graph_builder.add_node(
                node_id=doc_id,
                label=doc.title,
                node_type="Document",
                properties={"source_type": doc.source_type}
            )
            
            chunks = self.chunker.split_text(doc.content)
            chunk_count = len(chunks)
            logger.info("Processed document '%s': split into %d chunks.", doc.title, chunk_count)
            
            doc_chunks = []
            doc_metadata = []
            
            for c_idx, chunk_text in enumerate(chunks):
                chunk_id = f"{doc_id}_chunk_{c_idx}"
                doc_chunks.append(chunk_text)
                doc_metadata.append({"document_id": doc_id, "chunk_index": c_idx})
                
                self.graph_builder.add_node(
                    node_id=chunk_id,
                    label=f"Chunk {c_idx}",
                    node_type="Chunk",
                    properties={"text_preview": chunk_text[:50]}
                )
                self.graph_builder.add_edge(doc_id, chunk_id, "contains")
                
                entities = self.extractor.extract_from_chunk(chunk_text)
                
                for eq in entities.equipment:
                    eq_id = f"eq_{eq.lower()}"
                    self.graph_builder.add_node(node_id=eq_id, label=eq, node_type="Equipment")
                    self.graph_builder.add_edge(chunk_id, eq_id, "mentions")
                    
                for inc in entities.incidents:
                    inc_id = f"inc_{inc.lower()}"
                    self.graph_builder.add_node(node_id=inc_id, label=inc, node_type="Incident")
                    self.graph_builder.add_edge(chunk_id, inc_id, "mentions")
                    
                for reg in entities.regulations:
                    reg_id = f"reg_{reg.lower()}"
                    self.graph_builder.add_node(node_id=reg_id, label=reg, node_type="Regulation")
                    self.graph_builder.add_edge(chunk_id, reg_id, "mentions")
            
            # Embed and index document chunks
            self.embedding_pipeline.add_embeddings(doc_chunks, doc_metadata, faiss_dir)
            
            # Record in tracker — preserve original_name if already set by upload service
            existing_entry = processed_tracker.get(fhash, {})
            processed_tracker[fhash] = {
                "filename": filename,
                "original_name": existing_entry.get("original_name") or doc.title,
                "document_id": doc_id,
                "processed_at": datetime.now(timezone.utc).isoformat()
            }
            
            if progress_callback and total_new > 0:
                progress = 10 + int(70 * (idx + 1) / total_new)
                progress_callback(progress)
                
        # 6. Save final graph.json
        self.serializer.serialize_to_json(self.graph_builder.graph, graph_path)
        
        # 7. Save processed_files.json tracker
        save_processed_files(processed_tracker)
        
        if progress_callback:
            progress_callback(100)
            
        node_count = self.graph_builder.graph.number_of_nodes()
        edge_count = self.graph_builder.graph.number_of_edges()
        
        logger.info("=== Incremental Ingestion Summary ===")
        logger.info("Total graph nodes: %d", node_count)
        logger.info("Total graph edges: %d", edge_count)
        logger.info("Incremental updates completed successfully.")
        
        return len(files)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_dir", type=str, required=True)
    parser.add_argument("--output_dir", type=str, required=True)
    args = parser.parse_args()
    
    pipeline = IngestionPipeline()
    pipeline.run(args.input_dir, args.output_dir)
