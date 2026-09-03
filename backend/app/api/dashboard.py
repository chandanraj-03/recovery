"""Dashboard API — overview metrics for the merchant dashboard."""

from fastapi import APIRouter
from app.core.state import app_state

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard():
    """Get overview dashboard metrics."""
    summary = app_state.latest_demo_summary
    if not summary:
        return {
            "revenue_at_risk": 0,
            "revenue_recovered": 0,
            "recovery_rate": 0,
            "incremental_revenue": 0,
            "active_cases": 0,
            "policy_stops": 0,
            "escalations": 0,
            "total_cases": 0,
            "net_recovery_value": 0,
            "avg_recovery_value": 0,
            "recovery_cost": 0,
            "has_data": False,
        }
    return {**summary, "has_data": True}
