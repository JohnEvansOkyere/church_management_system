from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def events_health() -> dict:
    return {"status": "success", "data": {"module": "events", "health": "ok"}}
