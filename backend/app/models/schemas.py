from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, List
from datetime import datetime

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

# Document Management Schemas

class DocumentInfo(BaseModel):
    filename: str
    original_name: str
    size_bytes: int
    extension: str
    uploaded_at: str

class UploadResponse(BaseModel):
    success: bool
    message: str
    uploaded: list[DocumentInfo]
    count: int

class DocumentListResponse(BaseModel):
    message: str
    documents: list[DocumentInfo]
    count: int

class DeleteResponse(BaseModel):
    success: bool
    message: str
    filename: str

class ResetResponse(BaseModel):
    success: bool
    message: str
    files_deleted: int
    job_id: str

class KnowledgeStatusResponse(BaseModel):
    documents: int
    vectors: int
    nodes: int
    edges: int
    loaded: bool

# Job Status Schemas

class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    READY = "ready"
    FAILED = "failed"

class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress: Optional[int] = None  # 0-100
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    duration: Optional[float] = None  # in seconds
    documents_processed: Optional[int] = None
    errors: Optional[List[str]] = None

class UploadResponseWithJob(UploadResponse):
    job_id: str
    ingestion_status: str = "queued"

