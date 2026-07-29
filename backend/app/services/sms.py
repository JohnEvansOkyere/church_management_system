from dataclasses import dataclass
from uuid import uuid4

import httpx

from app.core.config import settings


@dataclass
class SMSResult:
    successful_count: int
    failed_count: int
    provider_response: dict
    provider_message_id: str | None = None
    credits_used: int | None = None


def send_sms(phone_numbers: list[str], message: str) -> SMSResult:
    """Send SMS through the configured Ghana provider."""
    if not phone_numbers:
        return SMSResult(successful_count=0, failed_count=0, provider_response={})

    provider = settings.SMS_PROVIDER.strip().lower()
    if provider == "arkesel":
        return _send_arkesel(phone_numbers, message)
    if provider == "moolre":
        return _send_moolre(phone_numbers, message)
    raise RuntimeError(f"Unsupported SMS provider: {settings.SMS_PROVIDER}")


def _send_arkesel(phone_numbers: list[str], message: str) -> SMSResult:
    if not settings.ARKESEL_API_KEY:
        raise RuntimeError("Arkesel SMS is not configured")

    endpoint = f"{settings.ARKESEL_BASE_URL.rstrip('/')}/api/v2/sms/send"
    request_body = {
        "sender": settings.ARKESEL_SENDER_ID,
        "message": message,
        "recipients": phone_numbers,
    }
    try:
        response = httpx.post(
            endpoint,
            headers={"api-key": settings.ARKESEL_API_KEY, "Content-Type": "application/json"},
            json=request_body,
            timeout=30.0,
        )
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Arkesel request failed: {exc}") from exc

    payload = _response_payload(response)
    if response.status_code >= 400 or payload.get("status") != "success":
        detail = payload.get("message") or payload.get("detail") or response.text
        raise RuntimeError(f"Arkesel rejected the SMS: {detail}")

    data = payload.get("data") or {}
    return SMSResult(
        successful_count=len(phone_numbers),
        failed_count=0,
        provider_response=payload,
        provider_message_id=data.get("id") or payload.get("id"),
        credits_used=data.get("credits_used"),
    )


def _send_moolre(phone_numbers: list[str], message: str) -> SMSResult:
    if not settings.MOOLRE_VAS_KEY:
        raise RuntimeError("Moolre SMS is not configured")

    endpoint = f"{settings.MOOLRE_BASE_URL.rstrip('/')}/open/sms/send"
    request_body = {
        "type": 1,
        "senderid": settings.MOOLRE_SENDER_ID,
        "messages": [
            {"recipient": phone_number, "message": message, "ref": uuid4().hex}
            for phone_number in phone_numbers
        ],
    }
    try:
        response = httpx.post(
            endpoint,
            headers={
                "X-API-VASKEY": settings.MOOLRE_VAS_KEY,
                "Content-Type": "application/json",
            },
            json=request_body,
            timeout=30.0,
        )
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Moolre request failed: {exc}") from exc

    payload = _response_payload(response)
    if response.status_code >= 400 or payload.get("status") not in (1, "1"):
        detail = payload.get("message") or payload.get("detail") or response.text
        raise RuntimeError(f"Moolre rejected the SMS: {detail}")

    data = payload.get("data") or {}
    return SMSResult(
        successful_count=len(phone_numbers),
        failed_count=0,
        provider_response=payload,
        provider_message_id=data.get("id") if isinstance(data, dict) else None,
        credits_used=data.get("credits_used") if isinstance(data, dict) else None,
    )


def _response_payload(response: httpx.Response) -> dict:
    try:
        payload = response.json()
    except ValueError:
        return {"raw": response.text}
    return payload if isinstance(payload, dict) else {"raw": payload}
