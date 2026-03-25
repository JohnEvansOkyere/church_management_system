import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.v1 import attendance, auth, communication, donations, events, groups, members, reports

app = FastAPI(title="Living Spring CMS API", version="1.0.0")

os.makedirs("uploads/members", exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-vercel-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(members.router, prefix="/api/v1/members", tags=["Members"])
app.include_router(attendance.router, prefix="/api/v1/attendance", tags=["Attendance"])
app.include_router(donations.router, prefix="/api/v1/donations", tags=["Donations"])
app.include_router(groups.router, prefix="/api/v1/groups", tags=["Groups"])
app.include_router(events.router, prefix="/api/v1/events", tags=["Events"])
app.include_router(communication.router, prefix="/api/v1/communication", tags=["Communication"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])


@app.get("/")
def root() -> dict:
    return {"status": "success", "data": {"message": "Living Spring CMS API is running"}}
