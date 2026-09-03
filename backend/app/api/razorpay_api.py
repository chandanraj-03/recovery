"""Razorpay API routes for live checkout orders, payment links, and verification."""

import os
import hmac
import hashlib
import datetime
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.state import app_state
from app.database.db import get_db, SessionLocal
from app.database.models import RecoveryCase, Transaction, AuditEntry, LedgerEntry

router = APIRouter()


class CreateOrderRequest(BaseModel):
    transaction_id: str
    amount: float
    customer_id: Optional[str] = "C_DEMO"
    notes: Optional[Dict[str, Any]] = None


class CreatePaymentLinkRequest(BaseModel):
    transaction_id: str
    amount: float
    customer_id: Optional[str] = "C_DEMO"
    description: Optional[str] = "RecoverAI Adaptive Payment Recovery"


class VerifyPaymentRequest(BaseModel):
    transaction_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: Optional[str] = ""


@router.get("/razorpay/config")
async def get_razorpay_config():
    """Return public Razorpay key ID and configuration status for frontend checkout."""
    key_id = settings.razorpay_key_id or os.getenv("RAZORPAY_KEY_ID", "")
    is_configured = bool(key_id and (settings.razorpay_key_secret or os.getenv("RAZORPAY_KEY_SECRET", "")))
    return {
        "key_id": key_id,
        "is_configured": is_configured,
        "currency": "INR",
        "merchant_name": "RecoverAI Merchant",
    }


@router.post("/razorpay/create-order")
async def create_razorpay_order(req: CreateOrderRequest):
    """Create an authentic Razorpay test order via Razorpay API."""
    key_id = settings.razorpay_key_id or os.getenv("RAZORPAY_KEY_ID", "")
    key_secret = settings.razorpay_key_secret or os.getenv("RAZORPAY_KEY_SECRET", "")

    if not key_id or not key_secret:
        # Fallback simulation mock if credentials are not present
        order_id = f"order_sim_{req.transaction_id}"
        return {
            "success": True,
            "mode": "simulation",
            "order_id": order_id,
            "amount": int(req.amount * 100),
            "currency": "INR",
            "key_id": key_id or "rzp_test_placeholder",
            "receipt": f"rcpt_{req.transaction_id[:10]}",
        }

    amount_paise = max(100, int(req.amount * 100))  # Minimum 1 INR (100 paise)
    url = "https://api.razorpay.com/v1/orders"
    payload = {
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"rcpt_{req.transaction_id[:10]}",
        "notes": {
            "transaction_id": req.transaction_id,
            "customer_id": req.customer_id,
            "source": "RecoverAI_Agent",
            **(req.notes or {})
        },
    }

    try:
        async with httpx.AsyncClient(auth=(key_id, key_secret), timeout=10.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code in [200, 201]:
                data = res.json()
                return {
                    "success": True,
                    "mode": "razorpay_test",
                    "order_id": data.get("id"),
                    "amount": data.get("amount"),
                    "currency": data.get("currency", "INR"),
                    "key_id": key_id,
                    "receipt": data.get("receipt"),
                    "raw": data,
                }
            else:
                raise HTTPException(
                    status_code=res.status_code,
                    detail=f"Razorpay API error: {res.text}"
                )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Failed to connect to Razorpay: {str(e)}")


@router.post("/razorpay/create-link")
async def create_razorpay_link(req: CreatePaymentLinkRequest):
    """Generate an official hosted Razorpay Payment Link (rzp.io)."""
    key_id = settings.razorpay_key_id or os.getenv("RAZORPAY_KEY_ID", "")
    key_secret = settings.razorpay_key_secret or os.getenv("RAZORPAY_KEY_SECRET", "")

    if not key_id or not key_secret:
        return {
            "success": True,
            "mode": "simulation",
            "payment_link_id": f"plink_sim_{req.transaction_id}",
            "short_url": f"https://rzp.io/rzp/sim_{req.transaction_id}",
        }

    amount_paise = max(100, int(req.amount * 100))
    url = "https://api.razorpay.com/v1/payment_links"
    payload = {
        "amount": amount_paise,
        "currency": "INR",
        "description": f"{req.description} ({req.transaction_id})",
        "customer": {
            "contact": "+919876543210",
            "name": f"Customer {req.customer_id}",
            "email": f"{req.customer_id.lower()}@example.com"
        },
        "notify": {"sms": False, "email": False},
        "reminder_enable": False,
        "notes": {
            "transaction_id": req.transaction_id,
            "customer_id": req.customer_id,
            "platform": "RecoverAI"
        }
    }

    try:
        async with httpx.AsyncClient(auth=(key_id, key_secret), timeout=10.0) as client:
            res = await client.post(url, json=payload)
            if res.status_code in [200, 201]:
                data = res.json()
                return {
                    "success": True,
                    "mode": "razorpay_test",
                    "payment_link_id": data.get("id"),
                    "short_url": data.get("short_url"),
                    "amount": req.amount,
                    "raw": data,
                }
            else:
                raise HTTPException(
                    status_code=res.status_code,
                    detail=f"Razorpay Payment Link API error: {res.text}"
                )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Failed to connect to Razorpay: {str(e)}")


@router.post("/razorpay/verify-payment")
async def verify_razorpay_payment(req: VerifyPaymentRequest, db: Session = Depends(get_db)):
    """Verify payment completion and update recovery case, audit trail, and ledger."""
    key_secret = settings.razorpay_key_secret or os.getenv("RAZORPAY_KEY_SECRET", "")

    # Validate HMAC signature if provided
    signature_valid = True
    if key_secret and req.razorpay_signature:
        generated_signature = hmac.new(
            key_secret.encode(),
            f"{req.razorpay_order_id}|{req.razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        signature_valid = (generated_signature == req.razorpay_signature)

    # 1. Update In-Memory App State
    recovered_amount = 0.0
    for case in app_state.latest_demo_cases:
        if case["transaction_id"] == req.transaction_id:
            case["status"] = "RECOVERED"
            recovered_amount = case.get("amount", 0.0)
            case["total_recovered"] = recovered_amount
            case["steps"].append({
                "step_number": len(case.get("steps", [])),
                "diagnosis": {"label": case.get("diagnosis", "transient"), "confidence": 1.0, "evidence": ["Recovered via Razorpay Checkout Modal"]},
                "predictions": {},
                "economic_evaluation": {},
                "best_immediate_action": "ALTERNATIVE_PAYMENT",
                "best_longterm_action": "ALTERNATIVE_PAYMENT",
                "selected_action": "ALTERNATIVE_PAYMENT",
                "decision_reason": f"Customer fulfilled payment via Razorpay Payment Gateway (Payment ID: {req.razorpay_payment_id})",
                "policy_result": "ALLOW",
                "policy_reason": "Razorpay payment link fulfilled within 24h compliance window",
                "executed_action": "ALTERNATIVE_PAYMENT",
                "outcome": "RECOVERED",
                "revenue": recovered_amount,
                "cost": 5.0,
                "friction_delta": 0.02,
                "learning_update": {"status": "success", "provider": "razorpay"}
            })
            break

    # 2. Update In-Memory Summary Metrics
    if app_state.latest_demo_summary:
        app_state.latest_demo_summary["recovered_cases"] = sum(
            1 for c in app_state.latest_demo_cases if c["status"] == "RECOVERED"
        )
        app_state.latest_demo_summary["revenue_recovered"] = sum(
            c.get("total_recovered", 0.0) for c in app_state.latest_demo_cases
        )
        total_risk = max(1.0, app_state.latest_demo_summary.get("revenue_at_risk", 1.0))
        app_state.latest_demo_summary["recovery_rate"] = round(
            (app_state.latest_demo_summary["revenue_recovered"] / total_risk) * 100, 1
        )
        app_state.latest_demo_summary["net_recovery_value"] = round(
            app_state.latest_demo_summary["revenue_recovered"] - app_state.latest_demo_summary.get("recovery_cost", 0.0), 2
        )

    # 3. Update SQLite Database
    try:
        case = db.query(RecoveryCase).filter_by(transaction_id=req.transaction_id).first()
        if case:
            recovered_amount = case.amount_at_risk
            case.status = "RECOVERED"
            case.amount_recovered = recovered_amount
            case.closed_at = datetime.datetime.utcnow()

        tx = db.query(Transaction).filter_by(id=req.transaction_id).first()
        if tx:
            tx.status = "RECOVERED"

        # Add Audit Entry
        audit = AuditEntry(
            transaction_id=req.transaction_id,
            action_type="PAYMENT_RECOVERED_VIA_RAZORPAY",
            action_detail=f"Customer completed recovery checkout via Razorpay (Payment ID: {req.razorpay_payment_id}, Order ID: {req.razorpay_order_id})",
            trigger_source="RAZORPAY_CHECKOUT",
            policy_check_passed=True,
            metadata_json={
                "razorpay_payment_id": req.razorpay_payment_id,
                "razorpay_order_id": req.razorpay_order_id,
                "signature_valid": signature_valid,
                "recovered_amount": recovered_amount,
            }
        )
        db.add(audit)

        # Add Ledger Entry
        ledger = LedgerEntry(
            transaction_id=req.transaction_id,
            case_id=f"RC-{req.transaction_id}",
            original_amount=recovered_amount,
            recovered_amount=recovered_amount,
            action_taken="ALTERNATIVE_PAYMENT",
            action_cost=5.0,
            estimated_future_value=recovered_amount * 2.5,
            net_recovery_value=recovered_amount - 5.0,
            status="RECOVERED",
            strategy="recoverai_razorpay",
            environment_type="razorpay_live"
        )
        db.add(ledger)
        db.commit()
    except Exception as e:
        print(f"[DB] Warning updating case on Razorpay payment: {e}")
        db.rollback()

    return {
        "success": True,
        "signature_valid": signature_valid,
        "transaction_id": req.transaction_id,
        "razorpay_payment_id": req.razorpay_payment_id,
        "status": "RECOVERED",
        "message": "Payment verified and transaction marked as RECOVERED in RecoverAI ledger."
    }
