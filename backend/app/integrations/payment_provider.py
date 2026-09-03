"""Payment Provider Interface and Adapters.

Clearly separates DEMO / SIMULATION MODE from RAZORPAY TEST MODE.
Never requires real money movement. Supports fallback to simulation when
Razorpay credentials are not configured.
"""

import os
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class PaymentExecutionResult:
    success: bool
    status: str
    provider_reference: str
    amount: float
    message: str
    raw_response: Dict[str, Any]


class BasePaymentProvider(ABC):
    """Abstract interface for payment actions."""

    @abstractmethod
    def retry_payment(self, transaction_id: str, amount: float, customer_id: str) -> PaymentExecutionResult:
        """Trigger an immediate or scheduled payment retry."""
        pass

    @abstractmethod
    def request_alternative_payment(self, transaction_id: str, amount: float, customer_id: str, preferred_method: Optional[str] = None) -> PaymentExecutionResult:
        """Send a payment link or alternative checkout invoice."""
        pass

    @abstractmethod
    def send_recovery_reminder(self, transaction_id: str, customer_id: str, channel: str = "sms") -> PaymentExecutionResult:
        """Dispatch a single compliant recovery notification."""
        pass


class SimulationPaymentProvider(BasePaymentProvider):
    """Default simulation provider for controlled evaluations."""

    def retry_payment(self, transaction_id: str, amount: float, customer_id: str) -> PaymentExecutionResult:
        return PaymentExecutionResult(
            success=True,
            status="simulated_retry_dispatched",
            provider_reference=f"sim_pay_{transaction_id}",
            amount=amount,
            message="Payment retry dispatched to simulated gateway",
            raw_response={"mode": "simulation", "action": "retry"},
        )

    def request_alternative_payment(self, transaction_id: str, amount: float, customer_id: str, preferred_method: Optional[str] = None) -> PaymentExecutionResult:
        return PaymentExecutionResult(
            success=True,
            status="simulated_alt_payment_offered",
            provider_reference=f"sim_link_{transaction_id}",
            amount=amount,
            message=f"Alternative payment ({preferred_method or 'UPI/Card'}) link generated",
            raw_response={"mode": "simulation", "action": "alternative_payment"},
        )

    def send_recovery_reminder(self, transaction_id: str, customer_id: str, channel: str = "sms") -> PaymentExecutionResult:
        return PaymentExecutionResult(
            success=True,
            status="simulated_message_sent",
            provider_reference=f"sim_msg_{transaction_id}",
            amount=0.0,
            message=f"Recovery message sent via {channel}",
            raw_response={"mode": "simulation", "action": "recovery_message"},
        )


class RazorpayTestProvider(BasePaymentProvider):
    """Razorpay Test Mode Integration.

    Uses test credentials (rzp_test_...) to create test payment links and customer tokens.
    Safe for sandbox testing; does not move real funds.
    """

    def __init__(self, key_id: Optional[str] = None, key_secret: Optional[str] = None):
        self.key_id = key_id or os.getenv("RAZORPAY_KEY_ID", "")
        self.key_secret = key_secret or os.getenv("RAZORPAY_KEY_SECRET", "")
        self.is_configured = bool(self.key_id and self.key_secret)

    def retry_payment(self, transaction_id: str, amount: float, customer_id: str) -> PaymentExecutionResult:
        if not self.is_configured:
            # Fallback gracefully
            return SimulationPaymentProvider().retry_payment(transaction_id, amount, customer_id)

        try:
            import httpx
            # In Razorpay test mode, create a standard test order or payment link
            # Auth header with key_id : key_secret
            url = "https://api.razorpay.com/v1/orders"
            payload = {
                "amount": int(amount * 100),  # in paise
                "currency": "INR",
                "receipt": f"rcpt_{transaction_id[:10]}",
                "notes": {"customer_id": customer_id, "recovery_mode": "rzp_test"}
            }
            with httpx.Client(auth=(self.key_id, self.key_secret), timeout=10.0) as client:
                res = client.post(url, json=payload)
                if res.status_code in [200, 201]:
                    data = res.json()
                    return PaymentExecutionResult(
                        success=True,
                        status="razorpay_test_order_created",
                        provider_reference=data.get("id", f"order_{transaction_id}"),
                        amount=amount,
                        message="Razorpay test order generated successfully",
                        raw_response=data
                    )
                else:
                    return PaymentExecutionResult(
                        success=False,
                        status="razorpay_error",
                        provider_reference="",
                        amount=amount,
                        message=f"Razorpay test API error: {res.text[:100]}",
                        raw_response={"error": res.text}
                    )
        except Exception as e:
            return PaymentExecutionResult(
                success=False,
                status="razorpay_exception",
                provider_reference="",
                amount=amount,
                message=f"Could not connect to Razorpay test API: {str(e)}",
                raw_response={"exception": str(e)}
            )

    def request_alternative_payment(self, transaction_id: str, amount: float, customer_id: str, preferred_method: Optional[str] = None) -> PaymentExecutionResult:
        if not self.is_configured:
            return SimulationPaymentProvider().request_alternative_payment(transaction_id, amount, customer_id, preferred_method)

        try:
            import httpx
            url = "https://api.razorpay.com/v1/payment_links"
            payload = {
                "amount": int(amount * 100),
                "currency": "INR",
                "description": f"RecoverAI Payment for {transaction_id}",
                "customer": {"contact": "+919876543210", "name": f"Customer {customer_id}"},
                "notify": {"sms": False, "email": False},
                "reminder_enable": False,
                "notes": {"customer_id": customer_id, "recovery_action": "alternative_payment"}
            }
            with httpx.Client(auth=(self.key_id, self.key_secret), timeout=10.0) as client:
                res = client.post(url, json=payload)
                if res.status_code in [200, 201]:
                    data = res.json()
                    return PaymentExecutionResult(
                        success=True,
                        status="razorpay_test_payment_link_created",
                        provider_reference=data.get("id", ""),
                        amount=amount,
                        message=f"Razorpay test payment link: {data.get('short_url', '')}",
                        raw_response=data
                    )
                else:
                    return PaymentExecutionResult(
                        success=False,
                        status="razorpay_error",
                        provider_reference="",
                        amount=amount,
                        message=f"Razorpay link error: {res.text[:100]}",
                        raw_response={"error": res.text}
                    )
        except Exception as e:
            return PaymentExecutionResult(
                success=False,
                status="razorpay_exception",
                provider_reference="",
                amount=amount,
                message=f"Failed to generate Razorpay link: {str(e)}",
                raw_response={"exception": str(e)}
            )

    def send_recovery_reminder(self, transaction_id: str, customer_id: str, channel: str = "sms") -> PaymentExecutionResult:
        # In test mode, notifications are simulated or logged safely
        return PaymentExecutionResult(
            success=True,
            status="razorpay_test_notification_logged",
            provider_reference=f"rzp_notif_{transaction_id}",
            amount=0.0,
            message=f"Razorpay sandbox reminder recorded for {channel}",
            raw_response={"mode": "razorpay_test", "channel": channel}
        )


def get_payment_provider(mode: str = "simulation") -> BasePaymentProvider:
    if mode == "razorpay_test":
        return RazorpayTestProvider()
    return SimulationPaymentProvider()
