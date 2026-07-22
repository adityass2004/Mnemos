import networkx as nx

def graph_query(graph: nx.DiGraph, query_node: str) -> dict:
    if query_node not in graph:
        return {"error": "Node not found"}
        
    neighbors = list(graph.successors(query_node)) + list(graph.predecessors(query_node))
    node_data = graph.nodes[query_node]
    
    return {
        "node_id": query_node,
        "type": node_data.get("type", "unknown"),
        "properties": {k: v for k, v in node_data.items() if k != "type"},
        "connections": neighbors
    }

