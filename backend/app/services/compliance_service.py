import logging
from app.models.schemas import ComplianceResponse
from app.services.knowledge_manager import KnowledgeManager

logger = logging.getLogger("Mnemos.ComplianceService")

class ComplianceService:
    def __init__(self):
        self._manager = KnowledgeManager()

    async def check_compliance(self, procedure: str) -> ComplianceResponse:
        issues: list[str] = []
        if self._manager.graph is not None:
            proc_lower = procedure.lower()
            # Find matching document/procedure nodes
            matched_nodes = [
                node_id for node_id, data in self._manager.graph.nodes(data=True)
                if proc_lower in str(data.get("label", "")).lower()
                or proc_lower in str(node_id).lower()
            ]
            if not matched_nodes:
                issues.append(f"Procedure '{procedure}' not found in the knowledge graph.")
            else:
                # Surface any incident nodes linked to this procedure
                for node_id in matched_nodes:
                    for _, target, edge_data in self._manager.graph.out_edges(node_id, data=True):
                        target_data = self._manager.graph.nodes[target]
                        if target_data.get("type") == "Incident":
                            issues.append(
                                f"Linked incident: {target_data.get('label', target)} "
                                f"(relation: {edge_data.get('relation', 'related_to')})"
                            )
        else:
            issues.append("Knowledge graph not loaded — cannot perform compliance check.")

        return ComplianceResponse(
            procedure=procedure,
            compliant=len(issues) == 0,
            issues=issues
        )
