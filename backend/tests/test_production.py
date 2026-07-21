import os
import sys
import shutil
import tempfile
import pytest
from pathlib import Path

# Add backend directory to sys.path
_BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

from fastapi.testclient import TestClient
from app.main import app
from app.config.settings import settings
from app.utils.file_utils import compute_file_hash, load_processed_files, save_processed_files

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_test_directories():
    # Store original settings
    orig_uploads = settings.UPLOADS_DIR
    orig_temp = settings.TEMP_DIR
    orig_data = settings.DATA_DIR
    orig_max_size = settings.MAX_UPLOAD_SIZE
    
    # Create temporary directories for testing
    test_dir = Path(tempfile.mkdtemp())
    settings.UPLOADS_DIR = test_dir / "uploads"
    settings.TEMP_DIR = test_dir / "tmp"
    settings.DATA_DIR = test_dir / "data"
    settings.PROCESSED_FILES_TRACKER_PATH = settings.DATA_DIR / "processed_files.json"
    settings.EMBEDDINGS_PATH = settings.DATA_DIR / "embeddings.npy"
    
    # Ensure they exist
    settings.UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    settings.TEMP_DIR.mkdir(parents=True, exist_ok=True)
    settings.DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    yield
    
    # Clean up
    shutil.rmtree(test_dir)
    
    # Restore original settings
    settings.UPLOADS_DIR = orig_uploads
    settings.TEMP_DIR = orig_temp
    settings.DATA_DIR = orig_data
    settings.MAX_UPLOAD_SIZE = orig_max_size

def test_health_endpoint():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["healthy", "degraded"]
    assert "details" in data
    assert "faiss_loaded" in data["details"]

def test_metrics_endpoint():
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "metrics" in data

def test_max_upload_size():
    # Set max upload size to 10 bytes
    settings.MAX_UPLOAD_SIZE = 10
    
    large_content = b"This content is definitely longer than 10 bytes."
    response = client.post(
        "/api/v1/documents/upload",
        files=[("files", ("test.txt", large_content, "text/plain"))]
    )
    
    assert response.status_code == 413
    assert "too large" in response.json()["message"]

def test_duplicate_detection():
    # Upload first time
    content = b"Unique content for duplicate test."
    response1 = client.post(
        "/api/v1/documents/upload",
        files=[("files", ("dup_test.txt", content, "text/plain"))]
    )
    assert response1.status_code == 200
    job_id = response1.json()["job_id"]
    filename = response1.json()["uploaded"][0]["filename"]
    
    # Manually populate tracker as pipeline runs asynchronously
    # and background tasks don't block the TestClient unless explicitly run
    fhash = compute_file_hash(settings.UPLOADS_DIR / filename)
    tracker = load_processed_files()
    tracker[fhash] = {
        "filename": filename,
        "original_name": "dup_test.txt",
        "document_id": "doc_dup_test_txt"
    }
    save_processed_files(tracker)
    
    # Upload same content again
    response2 = client.post(
        "/api/v1/documents/upload",
        files=[("files", ("dup_test_copy.txt", content, "text/plain"))]
    )
    
    assert response2.status_code == 409
    assert "duplicate" in response2.json()["message"]

def test_corrupt_pdf_validation():
    corrupt_pdf_content = b"This is not a valid PDF file structure."
    response = client.post(
        "/api/v1/documents/upload",
        files=[("files", ("corrupt.pdf", corrupt_pdf_content, "application/pdf"))]
    )
    
    assert response.status_code == 422
    assert "Corrupt or invalid PDF" in response.json()["message"]

def test_unsupported_file_type():
    unsupported_content = b"image bytes"
    response = client.post(
        "/api/v1/documents/upload",
        files=[("files", ("photo.png", unsupported_content, "image/png"))]
    )
    
    assert response.status_code == 415
    assert "unsupported extension" in response.json()["message"]
