"""Memory API — what the adaptive system has learned."""

from fastapi import APIRouter
from app.core.state import app_state

router = APIRouter()


@router.get("/memory")
async def get_memory():
    """Get recovery memory entries (segment-level learning)."""
    records = app_state.recovery_memory.get_all_records()
    bandit_params = app_state.bandit.get_all_params()
    return {
        "memory_records": records,
        "bandit_params": bandit_params,
        "total_updates": app_state.bandit.total_updates,
    }


@router.post("/memory/clear")
async def clear_memory():
    """Clear all recovery memory and bandit parameters."""
    app_state.recovery_memory.clear()
    app_state.bandit.reset(seed=42)
    return {"status": "cleared"}
