import json
import networkx as nx

class GraphSerializer:
    def serialize_to_json(self, graph: nx.DiGraph, output_path: str):
        nodes = []
        for node_id, data in graph.nodes(data=True):
            nodes.append({
                "id": node_id,
                "label": data.get("label", node_id),
                "type": data.get("type", "unknown"),
                "properties": {k: v for k, v in data.items() if k not in ["label", "type"]}
            })
            
        edges = []
        for source, target, data in graph.edges(data=True):
            edges.append({
                "source": source,
                "target": target,
                "relation": data.get("relation", "related_to"),
                "properties": {k: v for k, v in data.items() if k != "relation"}
            })
            
        payload = {
            "nodes": nodes,
            "edges": edges
        }
        
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, indent=2)
