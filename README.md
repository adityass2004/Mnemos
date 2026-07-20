<div align="center">

# ⚡ MNEMOS

### *Industrial Memory, Engineered.*

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&pause=1000&color=F5A623&center=true&vCenter=true&width=600&lines=AI-Powered+Industrial+Knowledge+Intelligence;GraphRAG+%2B+Multi-Agent+%2B+LightGBM;Built+for+the+Plant+Floor" alt="Typing SVG" />

<br/>

[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![LightGBM](https://img.shields.io/badge/LightGBM-02569B?style=for-the-badge&logo=lightgbm&logoColor=white)](https://lightgbm.readthedocs.io/)
[![NetworkX](https://img.shields.io/badge/NetworkX-FF6B35?style=for-the-badge&logo=python&logoColor=white)](https://networkx.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-orange?style=for-the-badge)](CONTRIBUTING.md)

<br/>

> *"The Greeks called her Mnemosyne, the goddess born so that humanity would never lose what it learned.*
> *We built MNEMOS for the same reason."*

<br/>

</div>

---

## 🧠 What is MNEMOS?

**MNEMOS** is an AI-powered **Industrial Knowledge Intelligence Platform** that unifies fragmented plant knowledge — engineering drawings, maintenance records, safety procedures, inspection reports, and incident logs — into a single queryable, predictive, and continuously self-updating intelligence layer.

> A 2024 McKinsey study found that industrial professionals spend **35% of their working hours** just searching for information that already exists somewhere in the organisation. MNEMOS ends that.

The system goes **three layers deep** — beyond what any plain RAG chatbot can offer:

| Layer | Technology | What it does |
|---|---|---|
| 🔍 **Retrieval** | RAG + FAISS | Semantic search over all documents |
| 🕸️ **Structure** | Knowledge Graph (NetworkX) | Relationship traversal across equipment, incidents, regulations |
| 📊 **Prediction** | LightGBM | Quantified failure-risk scores with explainability |

---

## ✨ Core Capabilities

<table>
<tr>
<td width="50%">

### 🤖 Expert Copilot Agent
Conversational AI over the full document corpus. Every answer comes with **source citations**, **confidence scores**, and **graph context** not just text.

</td>
<td width="50%">

### 🔬 Maintenance & RCA Agent
Fuses work order history, failure records, and real-time sensor features into a **LightGBM failure-risk model** — giving a quantified probability, not a guess.

</td>
</tr>
<tr>
<td width="50%">

### ⚖️ Compliance Intelligence Agent
Maps active procedures against **OISD, Factory Act, and PESO** regulatory clauses — auto-flagging gaps and generating audit-ready evidence packages in one click.

</td>
<td width="50%">

### 🔁 Lessons-Learned Clustering Agent
Embeds all incident and near-miss reports, runs **unsupervised clustering**, and surfaces recurring failure patterns that no individual reviewer would catch manually.

</td>
</tr>
<tr>
<td width="50%">

### 🕸️ Knowledge Graph Visualizer
Live force-directed graph over all entities — equipment tags, documents, incidents, regulations — linked by real relationships, not keyword overlap.

</td>
<td width="50%">

### 📱 Mobile-First Field Mode
Installable **Progressive Web App** for field technicians. Chat, risk scores, and compliance checks — all accessible from the plant floor, not just the desktop.

</td>
</tr>
</table>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     SOURCE DOCUMENTS                            │
│   P&IDs · Maintenance Logs · Safety Procedures · Incident       │
│   Reports · Inspection Records · Regulatory Docs · Sensor CSVs  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  INGESTION & EXTRACTION LAYER                   │
│   PyMuPDF + Tesseract OCR  →  LLM Entity Extractor (NER)       │
│   Sliding-Window Chunker   →  SentenceTransformers Embeddings   │
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
               ▼                          ▼
┌──────────────────────┐    ┌─────────────────────────────────────┐
│   FAISS Vector Index │    │   Knowledge Graph (NetworkX)        │
│   Semantic Search    │    │   Equipment ↔ Incident ↔ Document   │
│   ~1536-dim vectors  │    │   ↔ Regulation ↔ Personnel          │
└──────────┬───────────┘    └──────────────┬──────────────────────┘
           │                               │
           └──────────────┬────────────────┘
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   MULTI-AGENT LAYER                             │
│  ┌─────────────┐ ┌──────────┐ ┌────────────┐ ┌─────────────┐  │
│  │Expert       │ │Maint/RCA │ │Compliance  │ │Lessons-     │  │
│  │Copilot      │ │+ LightGBM│ │Agent       │ │Learned      │  │
│  │Agent        │ │Risk Model│ │OISD/PESO   │ │Clustering   │  │
│  └─────────────┘ └──────────┘ └────────────┘ └─────────────┘  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                              │
│  /chat · /query · /graph · /risk · /clusters · /compliance      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   React PWA (Vite + TypeScript)                 │
│  Chat + Citations  ·  Graph Viz  ·  Risk Dashboard              │
│  Compliance Panel  ·  Pattern Intelligence  ·  Mobile Mode      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
mnemos/
│
├── 📂 backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── copilot_agent.py        # Expert Q&A with GraphRAG
│   │   │   ├── rca_agent.py            # Root cause + LightGBM risk
│   │   │   ├── compliance_agent.py     # Regulatory gap detection
│   │   │   ├── lessons_agent.py        # Incident pattern clustering
│   │   │   └── industrial_agent.py     # Telemetry anomaly reasoning
│   │   ├── services/
│   │   │   ├── query_service.py        # Knowledge graph query logic
│   │   │   ├── risk_service.py         # Equipment risk evaluation
│   │   │   ├── compliance_service.py   # Compliance audit logic
│   │   │   ├── clusters_service.py     # Pattern cluster retrieval
│   │   │   ├── faiss_wrapper.py        # FAISS vector search interface
│   │   │   ├── knowledge_graph_wrapper.py  # Graph query interface
│   │   │   └── risk_model_wrapper.py   # LightGBM inference interface
│   │   ├── models/
│   │   │   ├── schemas.py              # Pydantic v2 request/response models
│   │   │   └── agent_schemas.py        # Agent-specific output schemas
│   │   ├── api/
│   │   │   └── endpoints.py            # Route definitions + DI
│   │   └── main.py                     # FastAPI app + lifecycle events
│
├── 📂 ingestion/
│   ├── parser/
│   │   ├── pdf_parser.py               # PDF + OCR fallback
│   │   ├── docx_parser.py              # Word document parser
│   │   ├── txt_parser.py               # Plain text parser
│   │   └── manager.py                  # Extension-based router
│   ├── extractor/
│   │   ├── chunker.py                  # Sliding-window chunker
│   │   └── entity_extractor.py         # Equipment, incidents, regs NER
│   ├── embeddings/
│   │   └── pipeline.py                 # SentenceTransformers → FAISS
│   ├── graph/
│   │   ├── graph_builder.py            # NetworkX graph construction
│   │   └── serializer.py               # graph.json export
│   └── pipeline/
│       └── pipeline.py                 # End-to-end ingestion runner
│
├── 📂 frontend/
│   └── src/
│       ├── pages/
│       │   ├── Chat.tsx                # Agent chat + citations + confidence
│       │   ├── Graph.tsx               # Force-directed graph visualizer
│       │   ├── RiskDashboard.tsx       # Equipment risk scoring panel
│       │   ├── Compliance.tsx          # Regulatory audit interface
│       │   ├── PatternIntelligence.tsx # Lessons-learned cluster view
│       │   └── Dashboard.tsx           # Telemetry gauges + anomaly feed
│       ├── layouts/
│       │   └── DashboardLayout.tsx     # Glassmorphism nav + sidebar
│       └── services/
│           └── riskApi.ts              # API service layer
│
├── 📂 shared/                          # Common schemas + constants
└── 📂 docs/                            # Architecture + API docs
```

---

## 🔌 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/health` | System health check |
| `POST` | `/api/v1/chat` | Query the industrial copilot |
| `POST` | `/api/v1/telemetry` | Analyze machine telemetry for anomalies |
| `POST` | `/api/v1/query` | Knowledge graph query |
| `POST` | `/api/v1/ingest` | Ingest a new document |
| `GET` | `/api/v1/graph` | Retrieve full graph structure |
| `GET` | `/api/v1/risk/{equipment}` | Equipment failure risk score |
| `GET` | `/api/v1/clusters` | Incident pattern clusters |
| `GET` | `/api/v1/compliance/{procedure}` | Procedure compliance audit |

---

## 🚀 Getting Started

### Prerequisites
- Python `3.11+`
- Node.js `18+`
- pip + npm

### 1. Clone the Repository

```bash
git clone https://github.com/pixelsout/mnemos.git
cd mnemos
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start the server
uvicorn app.main:app --reload --port 8000
```

### 3. Run the Ingestion Pipeline

```bash
cd ingestion
# Drop your documents into data/documents/
python pipeline/pipeline.py
# Builds FAISS index + graph.json automatically
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | `"Mnemos"` | Application name |
| `APP_ENV` | `"production"` | Environment mode |
| `API_V1_STR` | `"/api/v1"` | API version prefix |
| `CORS_ORIGINS` | `["*"]` | Allowed CORS origins |
| `LOG_LEVEL` | `"INFO"` | Logging verbosity |

---

## 🧩 Tech Stack

<div align="center">

| Layer | Technology |
|-------|-----------|
| **Backend** | FastAPI · Python 3.11 · Pydantic v2 · Uvicorn |
| **Vector Search** | FAISS · SentenceTransformers (`all-MiniLM-L6-v2`) |
| **Knowledge Graph** | NetworkX · Custom Industrial Ontology |
| **ML / Prediction** | LightGBM · scikit-learn · joblib |
| **Clustering** | KMeans on sentence embeddings |
| **Document Parsing** | PyMuPDF · pytesseract · python-docx |
| **Frontend** | React 18 · TypeScript · Vite · Tailwind CSS |
| **Graph Viz** | react-force-graph-2d |
| **State / Data** | TanStack Query · Axios |
| **Icons** | lucide-react |
| **Deployment** | Railway (backend) · Vercel (frontend) |

</div>

---

## 📊 Model Performance

The LightGBM failure-risk model trained on the AI4I 2020 Predictive Maintenance benchmark:

```
              precision    recall    f1-score
─────────────────────────────────────────────
  No Failure     0.97        0.96      0.97
     Failure     0.83        0.87      0.85
─────────────────────────────────────────────
    Accuracy                           0.95
     AUC-ROC                           0.91
```

---

## 🛣️ Roadmap

- [x] FastAPI backend with 9 production endpoints
- [x] Multi-agent system (Copilot, RCA, Compliance, Lessons-Learned)
- [x] End-to-end ingestion pipeline (PDF, DOCX, TXT)
- [x] FAISS vector index + NetworkX knowledge graph
- [x] React PWA frontend (6 views, fully responsive)
- [x] LightGBM failure-risk model
- [ ] Live FAISS + graph database persistence
- [ ] Real-time document ingestion via file watcher
- [ ] WhatsApp / IVR field technician integration
- [ ] Multi-plant knowledge graph federation
- [ ] SHAP-based feature explanation in risk view

---

## 👥 Team — 4AM Club

> *We build at 4AM because that's when the plant never sleeps, and neither do we.*

Built with obsession at **ET AI Hackathon 2026** — Theme: Industrial Intelligence.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ⚡ by the 4AM Club**

*"Once gone, it cannot be recovered." — We made sure it never has to be.*

⭐ Star this repo if MNEMOS made you think differently about industrial knowledge.

</div>
