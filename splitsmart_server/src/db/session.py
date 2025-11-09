from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.core.config import settings

# The engine is the entry point to the database. It's configured with our URL.
# The pool_pre_ping checks connections for liveness before they are used.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)

# A SessionLocal class is a factory for new Session objects.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# This is a dependency for our API endpoints.
# It creates a new session for each request, and ensures it's closed afterward.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()