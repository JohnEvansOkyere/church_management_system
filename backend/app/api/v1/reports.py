from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def reports_health() -> dict:
    return {"status": "success", "data": {"module": "reports", "health": "ok"}}
