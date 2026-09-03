"""FastAPI application — RecoverAI backend.

Mounts all API routers, manages app state (experiment engine, memory),
and handles startup initialization.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api import dashboard, recovery, experiments, policies, ledger, memory, audit, agent, razorpay_api
from app.services.experiment_engine import ExperimentEngine
from app.services.recovery_memory import RecoveryMemory
from app.learning.contextual_bandit import ContextualBandit
from app.database.db import init_db


from app.core.state import app_state


from app.database.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    # Initialize database and demo data
    init_db()
    seed_database()
    print("[OK] RecoverAI database initialized & seeded")
    print("[READY] RecoverAI backend ready - Simulation Mode")
    yield
    print("RecoverAI shutting down")


app = FastAPI(
    title="RecoverAI",
    description="Adaptive Recovery Sequencing for Long-Term Revenue",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers
app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(recovery.router, prefix="/api", tags=["Recovery"])
app.include_router(experiments.router, prefix="/api", tags=["Experiments"])
app.include_router(policies.router, prefix="/api", tags=["Policies"])
app.include_router(ledger.router, prefix="/api", tags=["Ledger"])
app.include_router(memory.router, prefix="/api", tags=["Memory"])
app.include_router(audit.router, prefix="/api", tags=["Audit"])
app.include_router(agent.router, prefix="/api", tags=["Agent"])
app.include_router(razorpay_api.router, prefix="/api", tags=["Razorpay"])


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "mode": "simulation", "version": "1.0.0"}
