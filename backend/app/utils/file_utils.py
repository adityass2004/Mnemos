
import hashlib
import logging
import os
import re
import tempfile
import time
from pathlib import Path
from typing import Optional, Tuple
from zipfile import BadZipFile

# Try to import pypdf for PDF validation
try:
    import pypdf
except ImportError:
    pypdf = None

from app.config.settings import settings

logger = logging.getLogger(__name__)

def ensure_directories():
    """Ensure all required directories exist"""
    for directory in [
        settings.UPLOADS_DIR,
        settings.TEMP_DIR,
        settings.DATA_DIR
    ]:
        directory.mkdir(parents=True, exist_ok=True)
        logger.debug(f"Ensured directory exists: {directory}")

def compute_file_hash(file_path: Path) -> str:
    """Compute SHA-256 hash of a file"""
    hash_sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_sha256.update(chunk)
    return hash_sha256.hexdigest()

def is_valid_extension(filename: str) -> Tuple[bool, Optional[str]]:
    """Check if file extension is allowed"""
    ext = Path(filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        return False, f"Disallowed extension: {ext}, allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
    return True, None

def is_valid_size(file_size_bytes: int) -> Tuple[bool, Optional[str]]:
    """Check if file size is within limits"""
    if file_size_bytes > settings.MAX_UPLOAD_SIZE:
        size_mb = settings.MAX_UPLOAD_SIZE / (1024 * 1024)
        return False, f"File too large: {file_size_bytes} bytes, max {size_mb:.2f} MB"
    return True, None

def load_processed_files() -> dict:
    """Load the processed files tracker from disk"""
    import json
    if not settings.PROCESSED_FILES_TRACKER_PATH.exists():
        return {}
    try:
        with open(settings.PROCESSED_FILES_TRACKER_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading processed files tracker: {e}")
        return {}

def save_processed_files(tracker: dict):
    """Save the processed files tracker to disk"""
    import json
    ensure_directories()
    try:
        with open(settings.PROCESSED_FILES_TRACKER_PATH, "w", encoding="utf-8") as f:
            json.dump(tracker, f, indent=2)
    except Exception as e:
        logger.error(f"Error saving processed files tracker: {e}")

def is_duplicate_file(file_hash: str, exclude_filename: Optional[str] = None) -> Tuple[bool, Optional[str], Optional[str]]:
    """Check if a file with the same hash already exists using tracker or directory search"""
    tracker = load_processed_files()
    if file_hash in tracker:
        entry = tracker[file_hash]
        filename = entry.get("filename")
        original_name = entry.get("original_name")
        if exclude_filename and filename == exclude_filename:
            return False, None, None
        return True, filename, original_name
    
    # Fallback to directory scan in case tracker is out of sync
    if settings.UPLOADS_DIR.exists():
        for existing_file in settings.UPLOADS_DIR.iterdir():
            if exclude_filename and existing_file.name == exclude_filename:
                continue
            if existing_file.is_file() and existing_file.name != ".gitkeep":
                try:
                    existing_hash = compute_file_hash(existing_file)
                    if existing_hash == file_hash:
                        return True, existing_file.name, existing_file.name
                except Exception as e:
                    logger.warning(f"Could not hash file {existing_file}: {e}")

    return False, None, None

def validate_pdf(file_path: Path) -> Tuple[bool, Optional[str]]:
    """Validate a PDF file is not corrupt"""
    try:
        import pypdf
        with open(file_path, "rb") as f:
            reader = pypdf.PdfReader(f)
            if len(reader.pages) > 0:
                _ = reader.pages[0]
            _ = reader.metadata
        return True, None
    except Exception as e:
        logger.error(f"PDF validation failed for {file_path}: {e}")
        return False, f"Corrupt or invalid PDF file: {str(e)}"

def validate_docx(file_path: Path) -> Tuple[bool, Optional[str]]:
    """Validate a DOCX file is not corrupt"""
    try:
        # DOCX is a zip file, try to open it
        with open(file_path, "rb") as f:
            # Just check if it's a valid zip without reading all contents
            from zipfile import ZipFile
            with ZipFile(f, "r") as zf:
                # Check for required files in DOCX
                required_files = ["_rels/.rels", "word/document.xml"]
                for req_file in required_files:
                    if req_file not in zf.namelist():
                        return False, f"Invalid DOCX: missing {req_file}"
        return True, None
    except BadZipFile:
        return False, "Corrupt DOCX file: not a valid ZIP archive"
    except Exception as e:
        logger.error(f"DOCX validation failed for {file_path}: {e}")
        return False, f"Corrupt or invalid DOCX file: {str(e)}"

def validate_txt(file_path: Path) -> Tuple[bool, Optional[str]]:
    """Validate a TXT file is readable"""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            f.read(100)  # Read first 100 bytes as a quick check
        return True, None
    except UnicodeDecodeError:
        return False, "Invalid text file: encoding not UTF-8"
    except Exception as e:
        logger.error(f"TXT validation failed for {file_path}: {e}")
        return False, f"Corrupt or invalid text file: {str(e)}"

def validate_md(file_path: Path) -> Tuple[bool, Optional[str]]:
    """Validate a Markdown file (same as TXT for now)"""
    return validate_txt(file_path)

def validate_file(file_path: Path, filename: str) -> Tuple[bool, Optional[str]]:
    """Run all validations on a file"""
    ext = Path(filename).suffix.lower()

    # Basic validation
    valid, msg = is_valid_extension(filename)
    if not valid:
        return False, msg

    file_size = file_path.stat().st_size
    valid, msg = is_valid_size(file_size)
    if not valid:
        return False, msg

    # Format-specific validation
    if ext == ".pdf":
        valid, msg = validate_pdf(file_path)
        if not valid:
            return False, msg
    elif ext == ".docx":
        valid, msg = validate_docx(file_path)
        if not valid:
            return False, msg
    elif ext == ".txt":
        valid, msg = validate_txt(file_path)
        if not valid:
            return False, msg
    elif ext == ".md":
        valid, msg = validate_md(file_path)
        if not valid:
            return False, msg

    return True, None

def get_temporary_file_path(suffix: str = "") -> Path:
    """Get a temporary file path"""
    fd, temp_path = tempfile.mkstemp(suffix=suffix, dir=settings.TEMP_DIR)
    os.close(fd)
    return Path(temp_path)

def cleanup_temporary_files(older_than_hours: Optional[int] = None):
    """Clean up temporary files"""
    if older_than_hours is None:
        older_than_hours = settings.TEMP_FILE_RETENTION_HOURS

    cutoff = time.time() - (older_than_hours * 3600)
    deleted_count = 0

    if not settings.TEMP_DIR.exists():
        return 0

    for temp_file in settings.TEMP_DIR.iterdir():
        try:
            if temp_file.is_file() and temp_file.stat().st_mtime < cutoff:
                temp_file.unlink()
                deleted_count += 1
                logger.debug(f"Deleted temporary file: {temp_file}")
        except Exception as e:
            logger.warning(f"Could not delete temporary file {temp_file}: {e}")

    if deleted_count > 0:
        logger.info(f"Cleaned up {deleted_count} temporary files")

    return deleted_count
