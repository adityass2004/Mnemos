from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Any, Optional
from app.models.schemas import (
    ChatRequest, ChatResponse, TelemetryRequest, TelemetryResponse,
    QueryRequest, QueryResponse, IngestRequest, IngestResponse,
    GraphResponse, RiskResponse, ClustersResponse, ComplianceResponse,
    KnowledgeStatusResponse
)
from app.agents.industrial_agent import IndustrialAgent
from app.services.industrial_service import IndustrialService
from app.services.query_service import QueryService
from app.services.ingest_service import IngestService
from app.services.graph_service import GraphService
from app.services.risk_service import RiskService
from app.services.clusters_service import ClustersService
from app.services.compliance_service import ComplianceService
from app.services.knowledge_manager import KnowledgeManager
from app.utils.logging_config import performance_metrics

router = APIRouter()


# Health check schemas
class HealthDetails(BaseModel):
    faiss_loaded: bool
    graph_loaded: bool
    uploads_writable: bool
    temp_writable: bool

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str = "1.0.0"
    details: Optional[HealthDetails] = None


class MetricsResponse(BaseModel):
    metrics: dict[str, Optional[dict[str, Any]]]


async def get_agent() -> IndustrialAgent:
    return IndustrialAgent()


async def get_service() -> IndustrialService:
    return IndustrialService()


async def get_query_service() -> QueryService:
    return QueryService()


async def get_ingest_service() -> IngestService:
    return IngestService()


async def get_graph_service() -> GraphService:
    return GraphService()


async def get_risk_service() -> RiskService:
    return RiskService()


async def get_clusters_service() -> ClustersService:
    return ClustersService()


async def get_compliance_service() -> ComplianceService:
    return ComplianceService()


@router.get("/health", response_model=HealthResponse)
async def health_endpoint() -> HealthResponse:
    from app.config.settings import settings
    from app.services.knowledge_manager import KnowledgeManager
    import os
    
    manager = KnowledgeManager()
    faiss_loaded = manager.faiss_index is not None
    graph_loaded = manager.graph is not None
    
    # Check directory writability
    uploads_writable = False
    if settings.UPLOADS_DIR.exists():
        uploads_writable = os.access(str(settings.UPLOADS_DIR), os.W_OK)
        
    temp_writable = False
    if settings.TEMP_DIR.exists():
        temp_writable = os.access(str(settings.TEMP_DIR), os.W_OK)
        
    status = "healthy"
    if not uploads_writable or not temp_writable:
        status = "degraded"
        
    details = HealthDetails(
        faiss_loaded=faiss_loaded,
        graph_loaded=graph_loaded,
        uploads_writable=uploads_writable,
        temp_writable=temp_writable
    )
    
    return HealthResponse(
        status=status,
        service="Mnemos Industrial Knowledge Intelligence Platform",
        version="1.0.0",
        details=details
    )


@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest, agent: IndustrialAgent = Depends(get_agent)) -> ChatResponse:
    return await agent.process_query(request)


@router.post("/telemetry", response_model=TelemetryResponse)
async def telemetry_endpoint(request: TelemetryRequest, service: IndustrialService = Depends(get_service)) -> TelemetryResponse:
    return await service.analyze_telemetry(request)


@router.post("/query", response_model=QueryResponse)
async def query_endpoint(request: QueryRequest, service: QueryService = Depends(get_query_service)) -> QueryResponse:
    return await service.query_knowledge_graph(request)


@router.post("/ingest", response_model=IngestResponse)
async def ingest_endpoint(request: IngestRequest, service: IngestService = Depends(get_ingest_service)) -> IngestResponse:
    return await service.ingest_document(request)


@router.get("/graph", response_model=GraphResponse)
async def graph_endpoint(service: GraphService = Depends(get_graph_service)) -> GraphResponse:
    return await service.get_graph()


@router.get("/risk/{equipment}", response_model=RiskResponse)
async def risk_endpoint(equipment: str, service: RiskService = Depends(get_risk_service)) -> RiskResponse:
    return await service.get_risk(equipment)


@router.get("/clusters", response_model=ClustersResponse)
async def clusters_endpoint(service: ClustersService = Depends(get_clusters_service)) -> ClustersResponse:
    return await service.get_clusters()


@router.get("/compliance/{procedure}", response_model=ComplianceResponse)
async def compliance_endpoint(procedure: str, service: ComplianceService = Depends(get_compliance_service)) -> ComplianceResponse:
    return await service.check_compliance(procedure)


@router.get("/knowledge/status", response_model=KnowledgeStatusResponse)
async def knowledge_status_endpoint() -> KnowledgeStatusResponse:
    knowledge_manager = KnowledgeManager()
    return KnowledgeStatusResponse(**knowledge_manager.get_status())


@router.get("/metrics", response_model=MetricsResponse)
async def metrics_endpoint() -> MetricsResponse:
    return MetricsResponse(metrics=performance_metrics.get_all_stats())


