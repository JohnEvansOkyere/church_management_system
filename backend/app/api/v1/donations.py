from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def donations_health() -> dict:
    return {"status": "success", "data": {"module": "donations", "health": "ok"}}
