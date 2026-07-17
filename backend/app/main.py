from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from contextlib import asynccontextmanager
from app.database.database import engine, Base
from app.database.seed import seed_data
import os

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB and seed if using in-memory or fresh SQLite
    # This ensures Vercel deployments work out-of-the-box without Neon configured
    db_url = os.getenv("DATABASE_URL", "")
    if not db_url or "sqlite" in db_url:
        Base.metadata.create_all(bind=engine)
        try:
            seed_data()
        except Exception as e:
            print(f"Seeding error or already seeded: {e}")
    yield

app = FastAPI(title="KSP Datathon 2026 - Conversational AI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/hackathon
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    sessionId: str
    message: str
    lang: str = "en"

class ChatResponse(BaseModel):
    answer: str
    sql: str
    tablesUsed: List[str]
    confidence: float
    visualizationType: Optional[str] = None
    data: Optional[dict] = None

@app.get("/")
def read_root():
    return {"message": "KSP API is running"}

@app.post("/api/v1/chat/query", response_model=ChatResponse)
def query_chat(req: ChatRequest):
    # TODO: integrate with LangGraph agent
    return ChatResponse(
        answer="This is a stub answer.",
        sql="SELECT * FROM CaseMaster LIMIT 10;",
        tablesUsed=["CaseMaster"],
        confidence=0.9
    )

@app.get("/api/v1/network/{accusedId}")
def get_network(accusedId: str):
    # TODO: implement co-accused network retrieval
    return {"nodes": [], "edges": []}

@app.get("/api/v1/hotspots")
def get_hotspots(district: Optional[str]=None, crimeSubHead: Optional[str]=None, from_date: Optional[str]=None, to_date: Optional[str]=None):
    # TODO: implement hotspot binning
    return {"cells": []}

@app.get("/api/v1/audit/logs")
def get_audit_logs():
    return {"logs": []}
