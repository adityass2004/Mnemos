import os
import sys
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from ingestion.parser.manager import ParserManager
from ingestion.extractor.chunker import DocumentChunker
from ingestion.extractor.entity_extractor import EntityExtractor
from ingestion.embeddings.pipeline import EmbeddingPipeline
from ingestion.graph.graph_builder import GraphBuilder
from ingestion.graph.serializer import GraphSerializer

class IngestionPipeline:
    def __init__(self):
        self.parser_manager = ParserManager()
        self.chunker = DocumentChunker()
        self.extractor = EntityExtractor()
        self.embedding_pipeline = EmbeddingPipeline()
        self.graph_builder = GraphBuilder()
        self.serializer = GraphSerializer()

    def run(self, input_dir: str, output_dir: str):
        print(f"Starting Ingestion Pipeline...")
        
        if not os.path.exists(input_dir):
            raise FileNotFoundError(f"Input directory does not exist: {input_dir}")

        os.makedirs(output_dir, exist_ok=True)
        
        files = [os.path.join(input_dir, f) for f in os.listdir(input_dir) if os.path.isfile(os.path.join(input_dir, f))]
        file_count = len(files)
        print(f"Scanned input directory. Found {file_count} files to process.")
        
        if file_count == 0:
            raise FileNotFoundError(f"No files found in input directory: {input_dir}")

        all_chunks = []
        all_metadata = []
        
        total_eq = 0
        total_inc = 0
        total_reg = 0
        
        print("Stage 1: Parsing documents and extracting entities...")
        for file_path in files:
            doc = self.parser_manager.parse_file(file_path)
            doc_id = f"doc_{doc.title.replace('.', '_')}"
            
            self.graph_builder.add_node(
                node_id=doc_id,
                label=doc.title,
                node_type="Document",
                properties={"source_type": doc.source_type}
            )
            
            chunks = self.chunker.split_text(doc.content)
            chunk_count = len(chunks)
            print(f"Processed document '{doc.title}': split into {chunk_count} chunks.")
            
            for idx, chunk_text in enumerate(chunks):
                chunk_id = f"{doc_id}_chunk_{idx}"
                all_chunks.append(chunk_text)
                
                meta = {"document_id": doc_id, "chunk_index": idx}
                all_metadata.append(meta)
                
                entities = self.extractor.extract_from_chunk(chunk_text)
                total_eq += len(entities.equipment)
                total_inc += len(entities.incidents)
                total_reg += len(entities.regulations)
                
                self.graph_builder.add_node(
                    node_id=chunk_id,
                    label=f"Chunk {idx}",
                    node_type="Chunk",
                    properties={"text_preview": chunk_text[:50]}
                )
                self.graph_builder.add_edge(doc_id, chunk_id, "contains")
                
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
                    
        print(f"Extracted entity counts:")
        print(f" - Total Equipment instances: {total_eq}")
        print(f" - Total Incident instances: {total_inc}")
        print(f" - Total Regulation instances: {total_reg}")
        
        print("Stage 2: Generating vector embeddings...")
        faiss_dir = os.path.join(output_dir, "faiss")
        print(f"Embedding statistics: processing {len(all_chunks)} chunks with dimensions {self.embedding_pipeline.dimension}.")
        self.embedding_pipeline.process_and_index(all_chunks, all_metadata, faiss_dir)
        
        print("Stage 3: Serializing industrial knowledge graph...")
        graph_path = os.path.join(output_dir, "graph.json")
        self.serializer.serialize_to_json(self.graph_builder.graph, graph_path)
        
        node_count = self.graph_builder.graph.number_of_nodes()
        edge_count = self.graph_builder.graph.number_of_edges()
        print(f"Knowledge graph details: {node_count} nodes and {edge_count} edges.")
        
        print("Stage 4: Verifying output file existence...")
        index_file = os.path.join(faiss_dir, "index.faiss")
        meta_file = os.path.join(faiss_dir, "metadata.json")
        
        if not os.path.exists(graph_path):
            raise FileNotFoundError(f"Verification failed: {graph_path} was not generated.")
        if not os.path.exists(index_file):
            raise FileNotFoundError(f"Verification failed: {index_file} was not generated.")
        if not os.path.exists(meta_file):
            raise FileNotFoundError(f"Verification failed: {meta_file} was not generated.")
            
        print("Verification successful: all assets generated successfully.")
        
        print("=== Ingestion Pipeline Execution Summary ===")
        print(f"Total files processed: {file_count}")
        print(f"Total chunks indexed: {len(all_chunks)}")
        print(f"Total graph nodes: {node_count}")
        print(f"Total graph edges: {edge_count}")
        print(f"Output files stored successfully.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_dir", type=str, required=True)
    parser.add_argument("--output_dir", type=str, required=True)
    args = parser.parse_args()
    
    pipeline = IngestionPipeline()
    pipeline.run(args.input_dir, args.output_dir)
