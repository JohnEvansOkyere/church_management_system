from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"client_encoding": "utf8"},
    pool_pre_ping=True,
    pool_recycle=300,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def check_database_connection() -> None:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
