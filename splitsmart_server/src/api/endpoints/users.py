from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.schemas import user as user_schema
from src.api import deps
from src.db import models

router = APIRouter()

@router.get("/me", response_model=user_schema.User)
def read_users_me(
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get current user.
    """
    return current_user