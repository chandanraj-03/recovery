"""Policy API — view and update merchant policy configuration."""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PolicyUpdate(BaseModel):
    max_automatic_retries: int = 2
    max_customer_messages: int = 1
    min_retry_interval_minutes: int = 30
    max_recovery_window_hours: int = 24
    high_value_threshold: float = 50000.0
    enable_auto_escalation: bool = True
    max_total_recovery_attempts: int = 5


# In-memory policy config (would be DB-backed in production)
current_policy = PolicyUpdate()


@router.get("/policies")
async def get_policies():
    """Get current policy configuration."""
    return current_policy.model_dump()


@router.put("/policies")
async def update_policies(policy: PolicyUpdate):
    """Update policy configuration."""
    global current_policy
    current_policy = policy
    return {"status": "updated", "policy": current_policy.model_dump()}
