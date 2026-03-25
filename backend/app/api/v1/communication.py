from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def communication_health() -> dict:
    return {"status": "success", "data": {"module": "communication", "health": "ok"}}
