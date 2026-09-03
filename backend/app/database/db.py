"""Database engine and session management for RecoverAI."""

from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, DeclarativeBase

from app.core.config import settings


# Create engine - SQLite for hackathon simplicity
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    echo=False,
)

# Enable WAL mode for SQLite (better concurrent reads)
if "sqlite" in settings.database_url:
    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


def get_db():
    """Dependency for FastAPI - yields a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables."""
    from app.database.models import (  # noqa: F401
        Customer, Transaction, PaymentEvent,
        RecoveryCase, RecoveryStep, AuditEntry,
        LedgerEntry, RecoveryMemoryEntry, ExperimentRun,
        ExperimentResult, PolicyConfigModel
    )
    Base.metadata.create_all(bind=engine)


def drop_db():
    """Drop all tables - for testing/reset."""
    Base.metadata.drop_all(bind=engine)
