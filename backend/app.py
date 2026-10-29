"""M9 secure backend foundation. Private-loopback only; no financial data ingestion."""
import hashlib
import hmac
import os
import secrets
import sqlite3
import time
from contextlib import closing
from pathlib import Path
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse

app = FastAPI(title="EONS M9 Private API", docs_url=None, redoc_url=None, openapi_url=None)
DB = Path(os.environ.get("EONS_M9_DB", "/var/lib/eons-m9/audit.sqlite3"))
TOKEN = os.environ.get("EONS_M9_OWNER_TOKEN", "")

def initialize():
    DB.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    with closing(sqlite3.connect(DB)) as conn:
        conn.execute("CREATE TABLE IF NOT EXISTS audit (id INTEGER PRIMARY KEY, ts INTEGER NOT NULL, event TEXT NOT NULL, outcome TEXT NOT NULL)")
        conn.commit()
    DB.chmod(0o600)

def audit(event, outcome):
    with closing(sqlite3.connect(DB)) as conn:
        conn.execute("INSERT INTO audit(ts,event,outcome) VALUES(?,?,?)", (int(time.time()),event,outcome))
        conn.commit()

@app.get("/health")
def health():
    return {"status":"ok","service":"eons-m9","mode":"private","customer_data":"disabled"}

@app.get("/owner/status")
def owner_status(authorization: str | None = Header(default=None)):
    if len(TOKEN) < 32:
        raise HTTPException(503,"Owner token not configured")
    supplied = (authorization or "").removeprefix("Bearer ").strip()
    if not hmac.compare_digest(supplied.encode(),TOKEN.encode()):
        audit("owner_status","denied")
        raise HTTPException(401,"Unauthorized")
    audit("owner_status","allowed")
    return {"status":"authenticated","data_ingestion":"disabled","audit":"enabled"}

@app.middleware("http")
async def secure_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"]="no-store"
    response.headers["X-Content-Type-Options"]="nosniff"
    response.headers["X-Frame-Options"]="DENY"
    response.headers["Content-Security-Policy"]="default-src 'none'; frame-ancestors 'none'"
    return response

initialize()
