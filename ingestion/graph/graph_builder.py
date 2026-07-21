import networkx as nx

class GraphBuilder:
    def __init__(self):
        self.graph = nx.DiGraph()

    def add_node(self, node_id: str, label: str, node_type: str, properties: dict = None):
        props = properties or {}
        self.graph.add_node(node_id, label=label, type=node_type, **props)

    def add_edge(self, source: str, target: str, relation: str, properties: dict = None):
        props = properties or {}
        if relation in ["mentions", "references", "related_to", "contains"]:
            self.graph.add_edge(source, target, relation=relation, **props)
