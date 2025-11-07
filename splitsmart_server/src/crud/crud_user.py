from sqlalchemy.orm import Session
from src.db import models
from src.schemas import user as user_schema
from src.core.security import get_password_hash
from typing import Optional
def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Fetches a user from the database by their email."""
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: user_schema.UserCreate) -> models.User:
    """Creates a new user in the database."""
    hashed_password = get_password_hash(user.password)
    # Create a new SQLAlchemy User model instance
    db_user = models.User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    # Add the instance to the session, commit, and refresh to get the new ID
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user