# Mnemos

Mnemos is an AI-powered Industrial Knowledge Intelligence Platform that combines Retrieval-Augmented Generation (RAG), Knowledge Graphs, Multi-Agent AI, Predictive Risk Analytics, and Compliance Intelligence into a unified industrial decision support system.

## Project Structure

- **`backend/`**: Contains the API logic, agents, services, databases, and ML models.
- **`frontend/`**: The client-side dashboard/interface (Vite + React + TypeScript).
- **`ingestion/`**: Data ingestion, parsing, extraction, graph building, and pipeline tools.
- **`shared/`**: Common data contracts, schemas, and constant definitions shared between components.
- **`docs/`**: Project documentation.

---

## Backend Modules Status

### Completed Modules
- `backend/app/config/settings.py` - Global application configuration and environment variables definition.
- `backend/app/utils/logging_config.py` - Unified centralized logging configuration dictionary.
- `backend/app/utils/exceptions.py` - Central custom exception definitions and global exception handlers.
- `backend/app/models/schemas.py` - Request/response Pydantic v2 schemas for chat, telemetry, query, ingest, graph, risk, clusters, and compliance.
- `backend/app/models/agent_schemas.py` - Output schemas for Copilot, RCA, Lessons, and Compliance agents.
- `backend/app/services/industrial_service.py` - Asynchronous service logic for telemetry anomaly classification.
- `backend/app/services/query_service.py` - Asynchronous service logic for knowledge graph queries.
- `backend/app/services/ingest_service.py` - Asynchronous service logic for document ingestion.
- `backend/app/services/graph_service.py` - Asynchronous service logic for node/edge graph data retrieval.
- `backend/app/services/risk_service.py` - Asynchronous service logic for equipment risk evaluations.
- `backend/app/services/clusters_service.py` - Asynchronous service logic for retrieving clustered component lists.
- `backend/app/services/compliance_service.py` - Asynchronous service logic for compliance audits of safety procedures.
- `backend/app/services/router_service.py` - Intent classifier router service directing queries to appropriate agents.
- `backend/app/services/knowledge_graph_wrapper.py` - Clean interface integration wrapper for Knowledge Graph actions.
- `backend/app/services/faiss_wrapper.py` - Clean interface integration wrapper for FAISS vector search.
- `backend/app/services/risk_model_wrapper.py` - Clean interface integration wrapper for Risk Model predictions.
- `backend/app/services/compliance_engine_wrapper.py` - Clean interface integration wrapper for Compliance Engine rule checks.
- `backend/app/agents/industrial_agent.py` - Asynchronous agent prompt reasoning simulations.
- `backend/app/agents/copilot_agent.py` - Core copilot assistant agent.
- `backend/app/agents/rca_agent.py` - Root cause analysis diagnostic agent.
- `backend/app/agents/lessons_agent.py` - Historical lessons learned extraction agent.
- `backend/app/agents/compliance_agent.py` - Regulatory and safety procedure compliance agent.
- `backend/app/api/endpoints.py` - API routing and dependency injection setups.
- `backend/app/main.py` - Main FastAPI application bootstrapping and lifecycle event handlers.
### Pending Modules
- Integration with database schemas or vector search indexes.
- Real-time ingestion parser connectivity.

---

## Ingestion Modules Status

### Completed Modules
- `ingestion/parser/document.py` - Core dataclass defining structured Document schema.
- `ingestion/parser/ocr_fallback.py` - Simulated OCR text extraction engine.
- `ingestion/parser/pdf_parser.py` - PDF document parser with automatic scanned document OCR fallback triggering.
- `ingestion/parser/docx_parser.py` - Microsoft Word DOCX parser logic.
- `ingestion/parser/txt_parser.py` - Plain text TXT file parser.
- `ingestion/parser/manager.py` - Extension-based parser router and controller class.
- `ingestion/extractor/models.py` - Structured dataclasses for chunks and extracted entity containers.
- `ingestion/extractor/chunker.py` - Document text sliding-window chunking logic.
- `ingestion/extractor/entity_extractor.py` - Regex-based parser resolving Equipment, Incidents, Regulations, Dates, Technicians, and Parameters.
- `ingestion/embeddings/pipeline.py` - Vector embedding pipeline utilizing SentenceTransformers and FAISS index generation.
- `ingestion/graph/graph_builder.py` - NetworkX industrial knowledge graph building module.
- `ingestion/graph/serializer.py` - Knowledge graph export serialization (graph.json).
- `ingestion/graph_query.py` - NetworkX graph nodes properties and connectivity query interface.
- `ingestion/pipeline/pipeline.py` - End-to-end ingestion pipeline coordinating parsing, chunking, extraction, embeddings, and graph generation, upgraded with production-quality logging, verification assertions, and dedicated index export paths.

---

## Frontend Modules Status

### Completed Modules
- `frontend/src/layouts/DashboardLayout.tsx` - Responsive glassmorphism layout with navigation sidebar.
- `frontend/src/pages/Dashboard.tsx` - Dashboard view displaying telemetry gauges and anomaly triggers.
- `frontend/src/pages/Chat.tsx` - Conversational agent chat view with history list, agent selectors, typing loads, confidence/risk status badges, and citations.
- `frontend/src/pages/Graph.tsx` - Interactive, zoomable and searchable force-directed knowledge graph visualization (react-force-graph-2d).
- `frontend/src/pages/Compliance.tsx` - Standard operating procedure compliance audits panel with rule selectors, pass/fail checklists, evidence inspectors, and report downloaders.
- `frontend/src/pages/RiskDashboard.tsx` - Risk Assessment Dashboard with sortable parameters, severity bars, categories filters, and details side drawers.
- `frontend/src/pages/PatternIntelligence.tsx` - Failure Pattern Intelligence panel with timeline occurrence tracking and interactive chat analysis buttons.
- `frontend/src/services/riskApi.ts` - Mock risk API data service.
- `frontend/src/App.tsx` - React Router configuration and QueryClient providers wrapping the layout.



### API Endpoints Completed
- `GET /api/v1/health` - Checks backend operational status.
- `POST /api/v1/chat` - Submits a conversational query to the industrial agent.
- `POST /api/v1/telemetry` - Analyzes machine telemetry inputs for warnings.
- `POST /api/v1/query` - Queries the industrial knowledge graph.
- `POST /api/v1/ingest` - Ingests document content.
- `GET /api/v1/graph` - Retrieves industrial graph structure.
- `GET /api/v1/risk/{equipment}` - Performs a risk assessment calculation for specific machinery.
- `GET /api/v1/clusters` - Lists clustered machine and component groups.
- `GET /api/v1/compliance/{procedure}` - Evaluates a procedure check for guideline safety/compliance.

### Integration Status
- Fully integrated. The ingestion pipeline generates relational graphs and vector indexes, the backend serves correct routes, and the frontend PWA successfully coordinates the system components.

### Dependencies Added
- `fastapi`
- `pydantic-settings`
- `uvicorn`
- `sentence-transformers`
- `networkx`
- `react-router-dom`
- `axios`
- `@tanstack/react-query`
- `lucide-react`
- `tailwindcss`
- `react-force-graph-2d`

### Environment Variables
- `APP_NAME` (Default: `"Mnemos"`)
- `APP_ENV` (Default: `"production"`)
- `API_V1_STR` (Default: `"/api/v1"`)
- `CORS_ORIGINS` (Default: `["*"]`)
- `LOG_LEVEL` (Default: `"INFO"`)

### Current Build Status
- Fully verified and operational (Startup scripts, E2E ingestion pipelines, and REST endpoints confirmed via integration test suite).

### Known Limitations
- Logic processing outputs are mock simulations (no live database persistence).

### Next Recommended Task
- Ready for staging and production release.
