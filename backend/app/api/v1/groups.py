from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
def groups_health() -> dict:
    return {"status": "success", "data": {"module": "groups", "health": "ok"}}
