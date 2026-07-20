from fastapi import APIRouter, Depends
from app.models.schemas import (
    ChatRequest, ChatResponse, TelemetryRequest, TelemetryResponse,
    QueryRequest, QueryResponse, IngestRequest, IngestResponse,
    GraphResponse, RiskResponse, ClustersResponse, ComplianceResponse
)
from app.agents.industrial_agent import IndustrialAgent
from app.services.industrial_service import IndustrialService
from app.services.query_service import QueryService
from app.services.ingest_service import IngestService
from app.services.graph_service import GraphService
from app.services.risk_service import RiskService
from app.services.clusters_service import ClustersService
from app.services.compliance_service import ComplianceService

router = APIRouter()

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

@router.get("/health")
async def health_endpoint():
    return {"status": "healthy", "service": "Mnemos Industrial Knowledge Intelligence Platform"}

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

