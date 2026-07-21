import logging
import os
import json
import faiss
import networkx as nx
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger("Mnemos.KnowledgeManager")

class KnowledgeManager:
    _instance: Optional["KnowledgeManager"] = None
    _initialized: bool = False

    def __new__(cls) -> "KnowledgeManager":
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def __init__(self):
        if not self._initialized:
            self._service_dir = Path(__file__).resolve().parent
            self._app_dir = self._service_dir.parent
            self._backend_dir = self._app_dir.parent
            self._data_dir = self._backend_dir / "data"
            self._graph_path = self._data_dir / "graph.json"
            self._faiss_dir = self._data_dir / "faiss"
            self._index_path = self._faiss_dir / "index.faiss"
            self._metadata_path = self._faiss_dir / "metadata.json"
            
            self.graph: Optional[nx.DiGraph] = None
            self.faiss_index: Optional[faiss.Index] = None
            self.metadata: Optional[list[dict[str, Any]]] = None
            self.loaded: bool = False
            
            self._initialized = True
            self.load()

    def load(self) -> None:
        """Load graph.json, FAISS index, and metadata.json into memory"""
        try:
            logger.info("Loading knowledge from disk...")
            
            # Load graph.json
            if self._graph_path.exists():
                with open(self._graph_path, "r", encoding="utf-8") as f:
                    graph_data = json.load(f)
                self.graph = nx.DiGraph()
                for node in graph_data["nodes"]:
                    self.graph.add_node(node["id"], **node.get("properties", {}), label=node.get("label"), type=node.get("type"))
                for edge in graph_data["edges"]:
                    self.graph.add_edge(edge["source"], edge["target"], **edge.get("properties", {}), relation=edge.get("relation"))
                logger.info(f"Loaded graph: {self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges")
            else:
                logger.warning(f"graph.json not found at {self._graph_path}")
                self.graph = None

            # Load FAISS index
            if self._index_path.exists():
                self.faiss_index = faiss.read_index(str(self._index_path))
                logger.info(f"Loaded FAISS index: {self.faiss_index.ntotal} vectors")
            else:
                logger.warning(f"index.faiss not found at {self._index_path}")
                self.faiss_index = None

            # Load metadata.json
            if self._metadata_path.exists():
                with open(self._metadata_path, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                logger.info(f"Loaded metadata: {len(self.metadata)} chunks")
            else:
                logger.warning(f"metadata.json not found at {self._metadata_path}")
                self.metadata = None

            self.loaded = self.graph is not None and self.faiss_index is not None and self.metadata is not None
            logger.info(f"Knowledge loading complete. Loaded: {self.loaded}")
            
        except Exception as e:
            logger.error(f"Failed to load knowledge: {e}", exc_info=True)
            self.graph = None
            self.faiss_index = None
            self.metadata = None
            self.loaded = False

    def reload(self) -> None:
        """Reload all knowledge from disk"""
        logger.info("Reloading knowledge...")
        self.load()

    def get_status(self) -> dict[str, Any]:
        """Get current knowledge status as per endpoint spec"""
        num_documents = 0
        if self.graph is not None:
            num_documents = sum(1 for _, data in self.graph.nodes(data=True) if data.get("type") == "Document")
        
        num_vectors = 0
        if self.faiss_index is not None:
            num_vectors = self.faiss_index.ntotal
        
        num_nodes = 0
        num_edges = 0
        if self.graph is not None:
            num_nodes = self.graph.number_of_nodes()
            num_edges = self.graph.number_of_edges()
        
        return {
            "documents": num_documents,
            "vectors": num_vectors,
            "nodes": num_nodes,
            "edges": num_edges,
            "loaded": self.loaded
        }
