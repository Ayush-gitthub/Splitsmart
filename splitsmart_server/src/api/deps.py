from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from src.db import models
from src.crud import crud_user
from src.schemas import token as token_schema
from src.core import security
from src.core.config import settings
from src.db.session import get_db

# This tells FastAPI where to look for the token.
# The tokenUrl should point to our login endpoint.
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/v1/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> models.User:
    """
    Dependency to get the current user from a JWT token.
    1. Decodes the JWT.
    2. Validates the token data.
    3. Fetches the user from the database.
    4. Raises an exception if any step fails.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = token_schema.TokenData(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    user = crud_user.get_user_by_email(db, email=token_data.email)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    # You could add a check here for user.status == 'active' if needed
    
    return user