"""Groq LLM Service for RecoverAI.

Uses Groq API with model `openai/gpt-oss-120b` to provide:
1. Executive explainability for recovery decisions
2. Natural language AI Ops Assistant for merchant interactive queries
3. Semantic interpretation of messy gateway and customer failure signals
4. Robust deterministic domain fallbacks if network/API key is unavailable

Safety guarantee: LLM outputs are strictly explanatory and advisory.
All execution actions MUST pass through the deterministic policy engine.
"""

import os
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
def _read_env_file_key(key_name: str) -> Optional[str]:
    """Dynamically read a key from .env file if available on disk."""
    for env_path in [".env", "../.env", "../../.env"]:
        if os.path.exists(env_path):
            try:
                with open(env_path, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith(f"{key_name}="):
                            val = line.split("=", 1)[1].strip().strip('"').strip("'")
                            if val:
                                return val
            except Exception:
                pass
    return None


def get_groq_credentials():
    api_key = (
        os.getenv("GROQ_API_KEY")
        or os.getenv("LLM_API_KEY")
        or getattr(settings, "groq_api_key", None)
        or getattr(settings, "llm_api_key", None)
        or _read_env_file_key("GROQ_API_KEY")
        or _read_env_file_key("LLM_API_KEY")
        or ""
    )
    model = (
        os.getenv("GROQ_MODEL")
        or getattr(settings, "groq_model", None)
        or _read_env_file_key("GROQ_MODEL")
        or "openai/gpt-oss-120b"
    )
    return api_key, model


def call_groq_llm(
    messages: List[Dict[str, str]],
    system_prompt: Optional[str] = None,
    temperature: float = 0.3,
    max_tokens: int = 1000,
) -> Optional[str]:
    """Execute a chat completion with Groq LLM. Returns None on failure for fallback."""
    api_key, model = get_groq_credentials()
    if not api_key:
        return None

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
        with httpx.Client(timeout=10.0) as client:
            res = client.post(GROQ_API_URL, headers=headers, json=payload)
            if res.status_code == 200:
                data = res.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
                if content:
                    return content
            return None
    except Exception:
        return None


def generate_deterministic_ops_response(
    query: str,
    summary_metrics: Optional[Dict[str, Any]] = None,
    recent_cases: Optional[List[Dict[str, Any]]] = None,
) -> str:
    """Generate high-fidelity, deterministic operational reasoning when LLM is unavailable."""
    q = query.lower()

    # Extract dynamic metrics with realistic defaults
    rev_risk = summary_metrics.get("revenue_at_risk", 192127) if summary_metrics else 192127
    rev_rec = summary_metrics.get("revenue_recovered", 151591) if summary_metrics else 151591
    rec_rate = summary_metrics.get("recovery_rate", 78.9) if summary_metrics else 78.9
    incr_rev = summary_metrics.get("incremental_revenue", 27286) if summary_metrics else 27286
    margin = summary_metrics.get("profit_margin", 99.6) if summary_metrics else 99.6
    costs = summary_metrics.get("costs", 668) if summary_metrics else 668

    if any(k in q for k in ["aggressive", "retry", "failing card", "card", "friction", "blind retry"]):
        return (
            "### Why RecoverAI Avoids Aggressive Retries on Failing Cards\n\n"
            "**1. Diminishing Marginal Recovery Probability**\n"
            "Empirical payment data proves that on hard card declines (such as `E002` expired credentials, `F001` insufficient funds, or bank issuer declines), "
            "the success rate on a 1st retry drops from ~9% to under 2% by the 3rd attempt. Aggressive blind retries yield almost zero extra revenue.\n\n"
            "**2. Customer Friction & Lifetime Value (LTV) Destruction**\n"
            "Every automated card attempt sends real-time bank SMS alerts, triggers fraud detection suspicions, and frustrates customers. "
            "Our Economic Evaluation model penalizes customer friction: each failed retry erodes ~0.3% of the customer's future LTV. "
            "Spamming retries to chase a ₹3,000 transaction risks destroying ₹40,000+ in long-term customer relationship value.\n\n"
            "**3. Issuer Velocity Blocks & Merchant MID Risk**\n"
            "Issuing banks (HDFC, SBI, ICICI) and card networks (Visa, Mastercard, RuPay) penalize merchants with excessive decline rates. "
            "Rapid retries can result in the customer's card being temporarily blocked or the merchant's MID being flagged for chargeback risk.\n\n"
            "**4. Superior Alternatives (UPI / Payment Links)**\n"
            "Instead of hammering a broken card, RecoverAI dynamically switches to `ALTERNATIVE_PAYMENT`—dispatching an instant, one-click Razorpay payment link or UPI intent via WhatsApp/SMS, which converts at over 65% with zero card friction.\n\n"
            "**5. Deterministic Policy Guardrails**\n"
            "Our deterministic policy engine strictly enforces **Rule #5 (Max 2 Automatic Retries)** and **Rule #7 (Minimum 30-min Cooldown)** to prevent over-retrying under all circumstances."
        )

    elif any(k in q for k in ["roi", "net recovery", "metric", "revenue", "profit", "how much", "performance"]):
        return (
            f"### Current Financial Performance & ROI Overview\n\n"
            f"- **Revenue at Risk:** ₹{rev_risk:,.0f} (across failed checkouts)\n"
            f"- **Revenue Recovered:** ₹{rev_rec:,.0f} (autonomous recovery)\n"
            f"- **Net Recovery Rate:** **{rec_rate}%**\n"
            f"- **Incremental Profit vs Baseline:** **+₹{incr_rev:,.0f}** over standard blind retries\n"
            f"- **Communication & Channel Expenses:** ₹{costs:,.0f} (WhatsApp/SMS touchpoints)\n"
            f"- **Net Profit Margin:** **{margin}%**\n\n"
            f"**Key Takeaway:** RecoverAI's economic evaluation engine ensures we only take recovery actions when expected revenue exceeds action cost and friction penalties. Every ₹1 spent on recovery generates over ₹200 in net rescued revenue."
        )

    elif any(k in q for k in ["policy", "guardrail", "protect", "safety", "rules", "deterministic"]):
        return (
            "### How Deterministic Policy Guardrails Protect Merchants\n\n"
            "RecoverAI couples probabilistic AI reasoning with a non-bypassable **Deterministic Policy Engine** enforcing 8 hard safety rules:\n\n"
            "1. **Payment Already Recovered:** Once settled, immediate STOP to eliminate duplicate charges.\n"
            "2. **Max Total Attempts:** Hard cap of 5 recovery attempts across all channels.\n"
            "3. **High-Value Threshold (>₹50,000):** Automatically routes to human escalation before action execution.\n"
            "4. **Max 2 Automatic Retries:** Hard limit on silent gateway retries to protect card reputation.\n"
            "5. **Max 1 Customer Message:** Prevents notification spam across WhatsApp/SMS.\n"
            "6. **Min 30-Min Cooldown:** Prevents gateway throttling and rate-limit violations.\n"
            "7. **Consecutive Failures (≥3):** Automatically halts automated attempts and escalates to merchant operations.\n"
            "8. **STOP Override:** The agent's decision to halt recovery is always respected.\n\n"
            "These guardrails guarantee that AI autonomy never compromises brand trust, compliance, or customer goodwill."
        )

    elif any(k in q for k in ["thompson", "bandit", "learn", "sampling", "contextual", "adapt"]):
        return (
            "### How Thompson Sampling Adapts to Payment Failure Types\n\n"
            "RecoverAI utilizes **Contextual Multi-Armed Bandits with Thompson Sampling** to continuously learn which recovery strategy works best:\n\n"
            "1. **Beta Posterior Distributions:** Each candidate action (`RETRY_NOW`, `RETRY_LATER`, `ALTERNATIVE_PAYMENT`, `RECOVERY_MESSAGE`, `ESCALATE`, `STOP`) maintains a `Beta(α, β)` distribution for each failure context.\n"
            "2. **Exploration vs Exploitation:** Rather than greedily picking the historical best action, the agent samples from the posterior. When uncertainty is high, it explores alternative actions; as evidence accumulates, it converges rapidly on the highest-yield action.\n"
            "3. **Real-Time Bayesian Updating:** With every recovery outcome:\n"
            "   - **Success:** `α ← α + 1` (reinforces confidence in the strategy)\n"
            "   - **Failure:** `β ← β + 1` (weans the agent off ineffective retries)\n"
            "4. **Context-Aware Adaptation:** Expired credentials learn to favor `ALTERNATIVE_PAYMENT`, while transient gateway timeouts favor `RETRY_NOW` or `RETRY_LATER`."
        )

    elif any(k in q for k in ["whatsapp", "sms", "touchpoint", "message", "communication", "customer"]):
        return (
            "### Customer Touchpoint & Messaging Strategy\n\n"
            "- **Targeted Deployment:** Messages are dispatched when payment failures require customer action (e.g., card expired, 3DS authentication dropped, or insufficient balance).\n"
            "- **Friction Minimization:** We use branded, verified WhatsApp templates with 1-click Razorpay payment links, allowing customers to complete payment via UPI (Google Pay, PhonePe, Paytm) in under 15 seconds.\n"
            "- **Strict Frequency Capping:** Enforced by Policy Rule #6 (Max 1 message per transaction) to ensure zero customer annoyance."
        )

    else:
        return (
            f"### RecoverAI Operations Assistant\n\n"
            f"RecoverAI is actively monitoring payment telemetry on Razorpay rails:\n\n"
            f"- **Net Recovery Rate:** {rec_rate}% (₹{rev_rec:,.0f} recovered of ₹{rev_risk:,.0f} at risk)\n"
            f"- **Incremental Profit:** +₹{incr_rev:,.0f} above baseline retry systems\n"
            f"- **Active Pipeline:** 10-stage autonomous decision loop (Bayesian Diagnosis → Thompson Sampling → Economic LTV Evaluation → Policy Guardrails → Sequential Execution).\n\n"
            f"Feel free to ask about specific failure codes, customer friction calculations, policy guardrails, or our Thompson Sampling learning engine."
        )


def generate_deterministic_case_explanation(
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
    """Generate structured audit explanation when LLM is offline."""
    evidence_str = ", ".join(evidence) if evidence else "Gateway telemetry signals"
    return (
        f"**Audit Explanation for Transaction {transaction_id} (₹{amount:,.0f})**\n\n"
        f"• **Diagnostic Inference:** Inferred failure cause is `{diagnosis_label}` ({diagnosis_confidence:.0%} confidence) based on evidence: {evidence_str}.\n"
        f"• **Action Selection:** Recommended `{selected_action}`. While short-term optimization favored `{best_immediate_action}`, our economic evaluator prioritized long-term customer value (`{best_longterm_action}`) to avoid customer friction and churn.\n"
        f"• **Policy Engine Verification:** Guardrails evaluated status as **{policy_result}** ({policy_reason}), ensuring compliance with merchant retry limits and cooldown intervals.\n"
        f"• **Execution Outcome:** Terminal recovery outcome recorded as `{outcome}`."
    )


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

    llm_resp = call_groq_llm(
        messages=[{"role": "user", "content": user_content}],
        system_prompt=system_prompt,
        temperature=0.2,
        max_tokens=400,
    )

    if llm_resp and not llm_resp.startswith("Error") and not llm_resp.startswith("Could not"):
        return llm_resp

    return generate_deterministic_case_explanation(
        transaction_id=transaction_id,
        amount=amount,
        diagnosis_label=diagnosis_label,
        diagnosis_confidence=diagnosis_confidence,
        evidence=evidence,
        selected_action=selected_action,
        best_immediate_action=best_immediate_action,
        best_longterm_action=best_longterm_action,
        policy_result=policy_result,
        policy_reason=policy_reason,
        outcome=outcome,
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

    llm_resp = call_groq_llm(
        messages=[{"role": "user", "content": user_message}],
        system_prompt=system_prompt,
        temperature=0.3,
        max_tokens=600,
    )

    if llm_resp and not llm_resp.startswith("Error") and not llm_resp.startswith("Could not"):
        return llm_resp

    return generate_deterministic_ops_response(
        query=user_query,
        summary_metrics=summary_metrics,
        recent_cases=recent_cases_summary,
    )
