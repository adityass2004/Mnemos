"""
test_documents.py
Quick smoke-test for the three document management endpoints.
Run with: python test_documents.py  (server must be running on port 8000)
"""

import http.client
import json
import os
import tempfile
import urllib.error
import urllib.request

BASE = "http://localhost:8000/api/v1"


def get(path: str):
    with urllib.request.urlopen(BASE + path) as r:
        return r.status, json.loads(r.read())


def post_multipart(path: str, filepaths: list[str]):
    boundary = "MnemosTestBoundary12345"
    body = b""
    for filepath in filepaths:
        fname = os.path.basename(filepath)
        with open(filepath, "rb") as f:
            data = f.read()
        body += (
            f"--{boundary}\r\n"
            f'Content-Disposition: form-data; name="files"; filename="{fname}"\r\n'
            f"Content-Type: application/octet-stream\r\n\r\n"
        ).encode() + data + b"\r\n"
    body += f"--{boundary}--\r\n".encode()

    conn = http.client.HTTPConnection("localhost", 8000)
    conn.request(
        "POST",
        "/api/v1" + path,
        body,
        {"Content-Type": f"multipart/form-data; boundary={boundary}"},
    )
    resp = conn.getresponse()
    return resp.status, json.loads(resp.read())


def delete(path: str):
    req = urllib.request.Request(BASE + path, method="DELETE")
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())


def sep(title: str):
    print(f"\n{'=' * 60}")
    print(f"  {title}")
    print("=" * 60)


# ── Create temp test files ─────────────────────────────────────────────────────
tmp = tempfile.mkdtemp()
pdf_path = os.path.join(tmp, "maintenance_report.pdf")
txt_path = os.path.join(tmp, "field_notes.txt")
md_path  = os.path.join(tmp, "safety_procedure.md")
bad_path = os.path.join(tmp, "plant_photo.jpg")

with open(pdf_path, "wb") as f:
    f.write(b"%PDF-1.4 fake pdf content for mnemos test")
with open(txt_path, "w") as f:
    f.write("Field notes: valve V-302 showing abnormal pressure readings.")
with open(md_path, "w") as f:
    f.write("# Safety Procedure SP-12\n\nFollow lockout/tagout protocol.")
with open(bad_path, "wb") as f:
    f.write(b"\xff\xd8\xff fake jpg bytes")


# ── TEST 1: Upload valid files ─────────────────────────────────────────────────
sep("TEST 1: POST /documents/upload  (PDF + TXT + MD)")
status, body = post_multipart("/documents/upload", [pdf_path, txt_path, md_path])
print(f"HTTP Status : {status}")
print(json.dumps(body, indent=2))
assert status == 200, f"Expected 200, got {status}"
assert body["success"] is True
assert body["count"] == 3
saved_filename = body["uploaded"][0]["filename"]
print(f"\n✓ PASS — {body['count']} file(s) uploaded, first saved as: {saved_filename}")


# ── TEST 2: List documents ─────────────────────────────────────────────────────
sep("TEST 2: GET /documents")
status, body2 = get("/documents")
print(f"HTTP Status : {status}")
print(json.dumps(body2, indent=2))
assert status == 200, f"Expected 200, got {status}"
assert body2["count"] >= 3
print(f"\n✓ PASS — {body2['count']} document(s) found in uploads/")


# ── TEST 3: Delete one document ────────────────────────────────────────────────
sep(f"TEST 3: DELETE /documents/{saved_filename}")
status, body3 = delete(f"/documents/{saved_filename}")
print(f"HTTP Status : {status}")
print(json.dumps(body3, indent=2))
assert status == 200, f"Expected 200, got {status}"
assert body3["success"] is True
print(f"\n✓ PASS — document '{saved_filename}' deleted")


# ── TEST 4: Delete non-existent document (expect 404) ─────────────────────────
sep("TEST 4: DELETE /documents/does_not_exist.pdf  (expect 404)")
status, body4 = delete("/documents/does_not_exist.pdf")
print(f"HTTP Status : {status}")
print(json.dumps(body4, indent=2))
assert status == 404, f"Expected 404, got {status}"
print("\n✓ PASS — 404 returned for missing document")


# ── TEST 5: Upload unsupported file type (expect 415) ─────────────────────────
sep("TEST 5: POST /documents/upload  (.jpg — expect 415)")
status, body5 = post_multipart("/documents/upload", [bad_path])
print(f"HTTP Status : {status}")
print(json.dumps(body5, indent=2))
assert status == 415, f"Expected 415, got {status}"
print("\n✓ PASS — 415 returned for unsupported file type")


# ── Summary ────────────────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("  ALL 5 TESTS PASSED ✓")
print("=" * 60)
