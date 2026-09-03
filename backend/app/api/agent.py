"""Agent AI API — endpoints for LLM explanations and interactive Ops chat."""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

from app.core.state import app_state
from app.services.llm_service import chat_with_ops_agent, explain_recovery_decision

router = APIRouter()


class ChatRequest(BaseModel):
    query: str


@router.post("/agent/chat")
async def chat_agent(req: ChatRequest):
    """Interact with RecoverAI's AI Ops Agent powered by Groq (openai/gpt-oss-120b)."""
    response_text = chat_with_ops_agent(
        user_query=req.query,
        summary_metrics=app_state.latest_demo_summary,
        recent_cases_summary=app_state.latest_demo_cases[:5] if app_state.latest_demo_cases else None,
    )
    return {
        "query": req.query,
        "response": response_text,
        "model": "openai/gpt-oss-120b",
    }


@router.get("/agent/explain/{transaction_id}")
async def explain_case(transaction_id: str):
    """Generate an executive explanation for a specific transaction case using Groq LLM."""
    for case in app_state.latest_demo_cases:
        if case["transaction_id"] == transaction_id:
            step = case["steps"][0] if case["steps"] else None
            if not step:
                return {"explanation": "No step data available to explain."}

            explanation = explain_recovery_decision(
                transaction_id=case["transaction_id"],
                amount=case["amount"],
                diagnosis_label=case["diagnosis"],
                diagnosis_confidence=case["diagnosis_confidence"],
                evidence=case.get("diagnosis_evidence", []),
                selected_action=step["selected_action"],
                best_immediate_action=step.get("best_immediate_action", "UNKNOWN"),
                best_longterm_action=step.get("best_longterm_action", "UNKNOWN"),
                policy_result=step["policy_result"],
                policy_reason=step["policy_reason"],
                outcome=step["outcome"],
            )
            return {
                "transaction_id": transaction_id,
                "explanation": explanation,
                "model": "openai/gpt-oss-120b",
            }

    return {"error": "Transaction not found in active session"}
