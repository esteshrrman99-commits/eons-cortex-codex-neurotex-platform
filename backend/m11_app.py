"""M11 loopback-only session prototype. No public login or financial data."""
import hashlib
import hmac
import os
import secrets
import threading
import time
from collections import defaultdict, deque
from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse

app=FastAPI(title="EONS M11 Private Auth",docs_url=None,redoc_url=None,openapi_url=None)
OWNER=os.environ.get("EONS_M9_OWNER_TOKEN","")
TTL=900
lock=threading.Lock()
sessions={}
attempts=defaultdict(deque)

@app.middleware("http")
async def headers(request:Request,call_next):
    response=await call_next(request)
    response.headers["Cache-Control"]="no-store"
    response.headers["X-Content-Type-Options"]="nosniff"
    response.headers["Content-Security-Policy"]="default-src 'none'; frame-ancestors 'none'"
    return response

@app.get("/health")
def health():
    return {"status":"ok","service":"eons-m11","mode":"private","customer_data":"disabled"}

def require_session(authorization):
    raw=(authorization or "").removeprefix("Bearer ").strip()
    digest=hashlib.sha256(raw.encode()).hexdigest()
    with lock:
        expiry=sessions.get(digest,0)
        if not raw or expiry<=time.time():
            sessions.pop(digest,None)
            raise HTTPException(401,"Invalid or expired session")
    return digest

@app.post("/session")
def create_session(request:Request,authorization:str|None=Header(default=None)):
    if len(OWNER)<32:
        raise HTTPException(503,"Owner credential unavailable")
    # Private loopback only, with independent rate limit per client address.
    key=request.client.host if request.client else "unknown"
    now=time.monotonic()
    with lock:
        q=attempts[key]
        while q and q[0]<now-60:q.popleft()
        if len(q)>=5:raise HTTPException(429,"Too many attempts")
        q.append(now)
    raw=(authorization or "").removeprefix("Bearer ").strip()
    if not hmac.compare_digest(raw.encode(),OWNER.encode()):
        raise HTTPException(401,"Unauthorized")
    token=secrets.token_urlsafe(48)
    with lock:
        sessions[hashlib.sha256(token.encode()).hexdigest()]=time.time()+TTL
        attempts[key].clear()
    return {"access_token":token,"token_type":"bearer","expires_in":TTL,"role":"owner"}

@app.get("/session")
def status(authorization:str|None=Header(default=None)):
    require_session(authorization)
    return {"authenticated":True,"role":"owner","customer_data":"disabled"}

@app.delete("/session")
def logout(authorization:str|None=Header(default=None)):
    digest=require_session(authorization)
    with lock:sessions.pop(digest,None)
    return {"revoked":True}
