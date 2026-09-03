"""Groq LLM Service for RecoverAI.

Uses Groq API with model `openai/gpt-oss-120b` to provide:
1. Executive explainability for recovery decisions
2. Natural language AI Ops Assistant for merchant interactive queries
3. Semantic interpretation of messy gateway and customer failure signals

Safety guarantee: LLM outputs are strictly explanatory and advisory.
All execution actions MUST pass through the deterministic policy engine.
"""

import os
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings


GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def get_groq_credentials():
    api_key = settings.groq_api_key or settings.llm_api_key or os.getenv("GROQ_API_KEY") or os.getenv("LLM_API_KEY")
    model = settings.groq_model or os.getenv("GROQ_MODEL", "openai/gpt-oss-120b")
    return api_key, model


def call_groq_llm(
    messages: List[Dict[str, str]],
    system_prompt: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 1000,
) -> str:
    """Execute a chat completion with Groq LLM."""
    api_key, model = get_groq_credentials()
    if not api_key:
        return "LLM API Key not configured. Using deterministic rule explanations."

    full_messages = []
    if system_prompt:
        full_messages.append({"role": "system", "content": system_prompt})
    full_messages.extend(messages)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": model,
        "messages": full_messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            res = client.post(GROQ_API_URL, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                return f"Groq API returned status {res.status_code}: {res.text[:120]}"
    except Exception as e:
        return f"Could not connect to Groq LLM: {str(e)}"


def explain_recovery_decision(
    transaction_id: str,
    amount: float,
    diagnosis_label: str,
    diagnosis_confidence: float,
    evidence: List[str],
    selected_action: str,
    best_immediate_action: str,
    best_longterm_action: str,
    policy_result: str,
    policy_reason: str,
    outcome: str,
) -> str:
    """Generate an executive-level audit explanation for a recovery decision."""
    system_prompt = (
        "You are RecoverAI's Senior Revenue Strategy Agent. Explain why this payment recovery decision "
        "was made. Clearly contrast immediate recovery value versus long-term customer relationship value, "
        "and mention how the deterministic policy engine verified safety. Keep your response concise (3-4 bullet points), "
        "professional, and grounded in the data."
    )

    user_content = f"""
Transaction ID: {transaction_id}
Amount: ₹{amount:,.0f}
Inferred Diagnosis: {diagnosis_label} (Confidence: {diagnosis_confidence:.0%})
Evidence: {', '.join(evidence)}
Agent Selected Action: {selected_action}
Immediate Revenue Best Action: {best_immediate_action}
Long-Term Value Best Action: {best_longterm_action}
Policy Result: {policy_result} ({policy_reason})
Execution Outcome: {outcome}
"""

    return call_groq_llm(
        messages=[{"role": "user", "content": user_content}],
        system_prompt=system_prompt,
        temperature=0.2,
        max_tokens=400,
    )


def chat_with_ops_agent(
    user_query: str,
    summary_metrics: Optional[Dict[str, Any]] = None,
    recent_cases_summary: Optional[List[Dict[str, Any]]] = None,
) -> str:
    """Respond to merchant operational commands and queries."""
    system_prompt = (
        "You are RecoverAI's AI Operations Agent for merchants. You specialize in payment failure recovery, "
        "bounded sequential workflows, customer friction economics, and adaptive contextual bandits (Thompson Sampling). "
        "Explain your reasoning clearly and concisely. If asked why a specific action like delayed retry or stop was chosen, "
        "cite the balance between immediate recovery probability and customer friction erosion. "
        "Mention that all actions are strictly bounded by deterministic policy checks."
    )

    context_str = ""
    if summary_metrics:
        context_str += f"\nCurrent Platform Metrics:\n"
        context_str += f"- Revenue at Risk: ₹{summary_metrics.get('revenue_at_risk', 0):,.0f}\n"
        context_str += f"- Revenue Recovered: ₹{summary_metrics.get('revenue_recovered', 0):,.0f} ({summary_metrics.get('recovery_rate', 0)}%)\n"
        context_str += f"- Incremental vs Baseline: +₹{summary_metrics.get('incremental_revenue', 0):,.0f}\n"
        context_str += f"- Policy Stops: {summary_metrics.get('policy_stops', 0)} cases\n"
        context_str += f"- Human Escalations: {summary_metrics.get('escalations', 0)} cases\n"

    if recent_cases_summary:
        context_str += f"\nRecent Sample Cases: {len(recent_cases_summary)} cases in memory.\n"

    user_message = f"{context_str}\nMerchant Query: {user_query}"

    return call_groq_llm(
        messages=[{"role": "user", "content": user_message}],
        system_prompt=system_prompt,
        temperature=0.3,
        max_tokens=600,
    )
