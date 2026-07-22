# MNEMOS — Developer Instructions

> This document is the canonical developer guide for the Mnemos backend.
> Keep it up to date with every significant change.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Repository Layout](#2-repository-layout)
3. [Backend Setup](#3-backend-setup)
4. [Environment Variables](#4-environment-variables)
5. [Running the Server](#5-running-the-server)
6. [Document Upload — Workflow](#6-document-upload--workflow)
7. [API Reference](#7-api-reference)
8. [Adding a New Endpoint](#8-adding-a-new-endpoint)
9. [Exception Handling](#9-exception-handling)
10. [Logging](#10-logging)
11. [Testing Endpoints](#11-testing-endpoints)
12. [Important Rules](#12-important-rules)

---

## 1. Project Overview

Mnemos is an AI-powered Industrial Knowledge Intelligence Platform.
It ingests plant documents (PDFs, DOCX, TXT, Markdown) and exposes them through a multi-agent GraphRAG backend built on FastAPI.

---

## 2. Repository Layout

```
ET_Backend/
├── backend/
│   ├── app/
│   │   ├── agents/          # LLM agent logic
│   │   ├── api/
│   │   │   ├── endpoints.py     # Core routes (chat, telemetry, graph, …)
│   │   │   └── documents.py     # Document upload/list/delete routes
│   │   ├── config/
│   │   │   └── settings.py      # Pydantic-Settings config
│   │   ├── models/
│   │   │   └── schemas.py       # All Pydantic request/response models
│   │   ├── services/
│   │   │   ├── document_service.py   # Upload, list, delete business logic
│   │   │   └── …                     # Other service files
│   │   ├── utils/
│   │   │   ├── exceptions.py    # Custom exception hierarchy
│   │   │   └── logging_config.py
│   │   └── main.py              # FastAPI app factory + middleware
│   ├── uploads/                 # Runtime document storage (git-tracked via .gitkeep)
│   ├── tests/
│   └── requirements.txt
├── ingestion/                   # Standalone ingestion pipeline (DO NOT run manually)
├── frontend/
└── README.md
```

---

## 3. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Copy and fill in environment variables
cp .env.example .env
```

---

## 4. Environment Variables

| Variable          | Default        | Description                        |
|-------------------|----------------|------------------------------------|
| `APP_NAME`        | `"Mnemos"`     | Application name                   |
| `APP_ENV`         | `"production"` | Environment mode                   |
| `API_V1_STR`      | `"/api/v1"`    | API version prefix                 |
| `CORS_ORIGINS`    | `["*"]`        | Allowed CORS origins               |
| `LOG_LEVEL`       | `"INFO"`       | Logging verbosity                  |
| `GEMINI_API_KEY`  | *(none)*       | Google Gemini API key for agents   |

---

## 5. Running the Server

```bash
# From the backend/ directory:
uvicorn app.main:app --reload --port 8000
```

Interactive API docs are available at:
- Swagger UI → http://localhost:8000/docs
- ReDoc      → http://localhost:8000/redoc

---

## 6. Document Upload — Workflow

> **The backend completely owns document ingestion.**
> Users must never run `pipeline.py` manually.

### How it works

1. A client `POST`s one or more files to `/api/v1/documents/upload`.
2. The backend validates every file extension **before** saving any file.  
   If any file is unsupported, the entire request is rejected with HTTP **415**.
3. Valid files receive a UUID-based stored filename (e.g. `a3f8…ef1c.pdf`) to prevent collisions.
4. Files are written to `backend/uploads/`.
5. The response includes the stored filename, original name, size, extension, and upload timestamp for each file.

### Supported file types

| Extension | Format               |
|-----------|----------------------|
| `.pdf`    | PDF documents        |
| `.txt`    | Plain text           |
| `.docx`   | Microsoft Word       |
| `.md`     | Markdown             |

### Uploaded file storage

All uploaded files land in `backend/uploads/`.
This directory is tracked in git via a `.gitkeep` file; actual uploads are excluded by `.gitignore`.

---

## 7. API Reference

### Core Endpoints

| Method   | Endpoint                          | Description                          |
|----------|-----------------------------------|--------------------------------------|
| `GET`    | `/api/v1/health`                  | Health check                         |
| `POST`   | `/api/v1/chat`                    | Industrial copilot query             |
| `POST`   | `/api/v1/telemetry`               | Machine telemetry anomaly analysis   |
| `POST`   | `/api/v1/query`                   | Knowledge graph query                |
| `POST`   | `/api/v1/ingest`                  | Legacy text-only ingest              |
| `GET`    | `/api/v1/graph`                   | Full graph structure                 |
| `GET`    | `/api/v1/risk/{equipment}`        | Equipment failure risk score         |
| `GET`    | `/api/v1/clusters`                | Incident pattern clusters            |
| `GET`    | `/api/v1/compliance/{procedure}`  | Regulatory compliance audit          |

### Document Endpoints

| Method   | Endpoint                            | Description                          |
|----------|-------------------------------------|--------------------------------------|
| `POST`   | `/api/v1/documents/upload`          | Upload one or more documents         |
| `GET`    | `/api/v1/documents`                 | List all uploaded documents          |
| `DELETE` | `/api/v1/documents/{filename}`      | Delete a document by stored filename |

#### POST `/api/v1/documents/upload`

- **Content-Type:** `multipart/form-data`
- **Field:** `files` (one or more)
- **Supported:** `.pdf`, `.txt`, `.docx`, `.md`

**Success response (200):**
```json
{
  "success": true,
  "uploaded": [
    {
      "filename": "a3f8ef1c.pdf",
      "original_name": "maintenance_report.pdf",
      "size_bytes": 204800,
      "extension": ".pdf",
      "uploaded_at": "2026-07-21T09:00:00+00:00"
    }
  ],
  "count": 1
}
```

**Error response (415) — unsupported extension:**
```json
{
  "error": "UnsupportedFileTypeException",
  "message": "File 'photo.jpg' has unsupported extension '.jpg'. Allowed: .pdf, .txt, .docx, .md"
}
```

#### GET `/api/v1/documents`

Returns a list of all documents currently in `backend/uploads/`.

```json
{
  "documents": [...],
  "count": 3
}
```

#### DELETE `/api/v1/documents/{filename}`

- `filename` is the UUID-based stored name returned by the upload endpoint.
- Returns **404** if the file does not exist.

```json
{
  "success": true,
  "message": "Document 'a3f8ef1c.pdf' deleted successfully.",
  "filename": "a3f8ef1c.pdf"
}
```

---

## 8. Adding a New Endpoint

1. Add request/response Pydantic models to `app/models/schemas.py`.
2. Add business logic to a service class in `app/services/`.
3. Add the route to `app/api/endpoints.py` or create a new router file in `app/api/`.
4. If using a new router, import and mount it in `app/main.py`.
5. Update this file and `README.md`.

---

## 9. Exception Handling

All exceptions extend `AntigravityException` in `app/utils/exceptions.py`.

| Exception Class               | HTTP Status | When raised                          |
|-------------------------------|-------------|--------------------------------------|
| `AntigravityException`        | 400         | Generic base exception               |
| `TelemetryAnomalyException`   | 422         | Telemetry anomaly detected           |
| `AgentFailureException`       | 500         | Agent-level failure                  |
| `UnsupportedFileTypeException`| 415         | Unsupported file extension uploaded  |
| `DocumentNotFoundException`   | 404         | Document not found for delete        |

The global handler `antigravity_exception_handler` is registered in `main.py` and converts all `AntigravityException` subclasses into structured JSON error responses.

---

## 10. Logging

All modules use Python's standard `logging` library with the `"Mnemos"` logger hierarchy.

```python
import logging
logger = logging.getLogger("Mnemos.MyModule")
```

Log level is controlled by the `LOG_LEVEL` environment variable (default: `INFO`).
Configuration lives in `app/utils/logging_config.py`.

---

## 11. Testing Endpoints

Use the Swagger UI at http://localhost:8000/docs or the `curl` examples below.

```bash
# Health check
curl http://localhost:8000/api/v1/health

# Upload two files
curl -X POST http://localhost:8000/api/v1/documents/upload \
  -F "files=@report.pdf" \
  -F "files=@notes.txt"

# List all uploaded documents
curl http://localhost:8000/api/v1/documents

# Delete a document (use the 'filename' from the upload response)
curl -X DELETE http://localhost:8000/api/v1/documents/a3f8ef1c2b3d4e5f.pdf

# Test rejection of unsupported file
curl -X POST http://localhost:8000/api/v1/documents/upload \
  -F "files=@photo.jpg"
```

---

## 12. Important Rules

- **Never run `ingestion/pipeline/pipeline.py` manually.** The backend owns document ingestion end-to-end.
- **Never commit real documents** to `backend/uploads/`. The directory is `.gitignore`-d; only `.gitkeep` is tracked.
- **All new exceptions must extend `AntigravityException`** so the global handler catches them.
- **All new schemas must live in `app/models/schemas.py`** unless they are agent-specific (use `agent_schemas.py`).
- **Every endpoint must be logged** at entry and exit using the module-level logger.




# INSTRUCTIONS.md

# Industrial Knowledge Intelligence Platform Development Guidelines

These instructions apply to every prompt, every generated file, and every development iteration.

---

# General Rules

- Produce production-ready code only.
- Never generate placeholder implementations unless explicitly requested.
- Never generate duplicate code.
- Never copy code from public repositories.
- Avoid plagiarism by generating original implementations.
- Follow Clean Architecture principles.
- Follow SOLID principles whenever applicable.
- Keep modules loosely coupled and highly cohesive.
- Write modular, reusable, and scalable code.
- Maintain consistent naming conventions across the project.
- Every generated file must compile with the rest of the project.
- Never break previously implemented functionality.
- Never introduce unnecessary dependencies.
- Always preserve backward compatibility unless explicitly instructed otherwise.
- Design every feature for deployment, not just local execution.

---

# Code Style Rules

- Do not write comments.
- Do not generate commented code.
- Do not generate TODO, FIXME, or placeholder comments.
- Do not generate banner or documentation comments unless explicitly requested.
- Use meaningful names for variables, classes, functions, and files.
- Prefer small, focused functions.
- Prefer composition over inheritance.
- Keep business logic separate from routing, UI, and persistence.
- Follow the existing project structure and coding conventions.

---

# Project Continuity

Before generating any code:

1. Read README.md completely.
2. Read this INSTRUCTIONS.md completely.
3. Understand the existing architecture.
4. Identify completed modules.
5. Identify pending modules.
6. Continue from the existing implementation.
7. Never regenerate completed features.
8. Preserve compatibility with existing APIs and modules.

README.md is the single source of truth for project progress.

Never ignore README.md.

---

# README Update Policy

At the end of every successful task:

Update README.md automatically.

Include:

- Completed modules
- Pending modules
- Folder structure
- API endpoints
- Frontend pages
- Backend services
- Integration status
- Environment variables
- Dependencies
- Deployment status
- Current build status
- Known limitations
- Remaining work
- Next recommended task

Never overwrite previous progress.

Append only meaningful updates.

---

# Development Workflow

For every prompt:

Step 1

Read README.md.

Step 2

Read INSTRUCTIONS.md.

Step 3

Analyze existing implementation.

Step 4

Generate only missing functionality.

Step 5

Verify imports.

Step 6

Verify folder structure.

Step 7

Verify integration.

Step 8

Verify build.

Step 9

Update README.md.

---

# Architecture Rules

Always preserve these layers.

Backend

- API
- Controllers
- Services
- Knowledge Manager
- Agents
- Models
- Schemas
- Utils
- Config

Frontend

- Pages
- Components
- Hooks
- Services
- Context
- Types
- Layouts

Shared

- Contracts
- Constants
- Schemas
- Types

Never violate architectural boundaries.

---

# Backend Rules

The backend is the owner of the knowledge base.

Users must never execute the ingestion pipeline manually.

The backend must provide APIs for:

- Uploading documents
- Listing documents
- Deleting documents
- Processing documents
- Checking processing status
- Querying the knowledge base
- Health checks
- Knowledge statistics

Whenever documents are uploaded:

Upload
↓

Store
↓

Run ingestion automatically
↓

Generate graph.json
↓

Generate FAISS index
↓

Generate metadata
↓

Reload the Knowledge Manager
↓

Return success

No backend restart should ever be required after successful ingestion.

---

# Knowledge Base Rules

The backend must always keep:

graph.json

index.faiss

metadata.json

synchronized.

The backend must automatically reload these artifacts whenever regeneration completes successfully.

Never require manual copying of generated files.

Never require manual execution of pipeline.py in production.

---

# Frontend Rules

The frontend must never execute backend logic.

The frontend communicates only through APIs.

Required capabilities:

- Upload documents
- View uploaded documents
- Delete documents
- Monitor processing progress
- Query the knowledge base
- Display graphs
- Display risk analysis
- Display compliance information

No page reloads.

No hardcoded URLs.

No hardcoded API responses.

---

# Dependency Rules

Install only required dependencies.

Never replace existing packages unnecessarily.

Remove unused dependencies if introduced accidentally.

---

# File Generation Rules

Generate only files related to the current task.

Never regenerate unrelated modules.

Never rename folders unless instructed.

Never delete existing project files unless explicitly requested.

---

# Integration Rules

Every new module must integrate with existing functionality.

Existing APIs must remain compatible.

Existing frontend pages must remain functional.

Every generated feature must be tested against the current project.

Avoid breaking changes.

---

# Testing Rules

Every completed task must include verification.

Verify:

- Backend builds successfully.
- Frontend builds successfully.
- Ingestion pipeline executes successfully.
- Graph generation succeeds.
- FAISS generation succeeds.
- Metadata generation succeeds.
- Backend loads knowledge successfully.
- APIs return expected responses.
- Frontend communicates correctly with backend.

If an issue is found:

Fix it.

Retest.

Only finish when the feature works correctly.

---

# Deployment Rules

The application must be deployable without manual intervention.

The deployed workflow must be:

Frontend
↓

Upload Documents
↓

Backend Upload API
↓

Automatic Ingestion
↓

Knowledge Reload
↓

Ready for Queries

No manual terminal commands.

No manual file movement.

No manual backend restart.

---

# Quality Checklist

Before finishing every prompt verify:

- Project builds successfully.
- No syntax errors.
- No duplicate code.
- No unused imports.
- No dead code.
- No placeholder implementations.
- No comment lines.
- No plagiarism.
- Folder structure remains consistent.
- Backend integration verified.
- Frontend integration verified.
- README.md updated.

---

# Prompt Continuation Rules

Every prompt is a continuation of the previous work.

Never restart the project.

Never recreate completed modules.

Always continue from README.md.

If README.md conflicts with the current request, ask for clarification before making changes.

---

# Output Rules

After every prompt:

1. Generate requested code.
2. Verify integration.
3. Verify project consistency.
4. Run or update tests where appropriate.
5. Update README.md.
6. Stop.

Never generate unrelated features.

---

# Goal

Deliver a single, production-ready Industrial Knowledge Intelligence Platform where:

- Frontend, backend, and knowledge pipeline are fully integrated.
- Users only interact through the frontend.
- The backend automatically manages document ingestion, indexing, graph generation, and knowledge reloading.
- The application is deployment-ready with minimal manual operations.
- Independently developed modules integrate seamlessly without requiring major refactoring.