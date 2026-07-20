from pydantic import BaseModel, Field

class ChatRequest(BaseModel):
    query: str = Field(min_length=1)
    context: dict[str, str] | None = None

class ChatResponse(BaseModel):
    reply: str
    confidence: float = Field(ge=0.0, le=1.0)
    actions: list[str]

class TelemetryRequest(BaseModel):
    machine_id: str = Field(min_length=1)
    temperature: float = Field(gt=0.0)
    pressure: float = Field(gt=0.0)
    vibration: float = Field(gt=0.0)

class TelemetryResponse(BaseModel):
    machine_id: str
    status: str
    anomaly_detected: bool
    recommendation: str

class QueryRequest(BaseModel):
    prompt: str = Field(min_length=1)

class QueryResponse(BaseModel):
    result: str
    sources: list[str]

class IngestRequest(BaseModel):
    document_title: str = Field(min_length=1)
    content: str = Field(min_length=1)

class IngestResponse(BaseModel):
    document_id: str
    status: str
    nodes_extracted: int

class GraphNode(BaseModel):
    id: str
    label: str
    properties: dict[str, str]

class GraphEdge(BaseModel):
    source: str
    target: str
    relation: str

class GraphResponse(BaseModel):
    nodes: list[GraphNode]
    edges: list[GraphEdge]

class RiskResponse(BaseModel):
    equipment: str
    risk_level: str
    score: float
    details: list[str]

class ClusterItem(BaseModel):
    cluster_id: int
    member_ids: list[str]

class ClustersResponse(BaseModel):
    total_clusters: int
    clusters: list[ClusterItem]

class ComplianceResponse(BaseModel):
    procedure: str
    compliant: bool
    issues: list[str]

