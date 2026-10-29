import os
os.environ.setdefault("EONS_M9_OWNER_TOKEN","test-"+"x"*48)
from fastapi.testclient import TestClient
from app import app
client=TestClient(app)
assert client.get("/health").status_code==200
assert client.get("/session").status_code==401
assert client.post("/session",headers={"Authorization":"Bearer wrong"}).status_code==401
res=client.post("/session",headers={"Authorization":"Bearer "+os.environ["EONS_M9_OWNER_TOKEN"]})
assert res.status_code==200,res.text
token=res.json()["access_token"]
auth={"Authorization":"Bearer "+token}
assert client.get("/session",headers=auth).status_code==200
assert client.delete("/session",headers=auth).status_code==200
assert client.get("/session",headers=auth).status_code==401
print("M11_AUTH_TESTS=PASS")
