from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.schemas import user as user_schema
from src.api import deps
from src.db import models
from src.core import financial_advisor
from src.crud import crud_user

router = APIRouter()

@router.get("/me", response_model=user_schema.User)
def read_users_me(
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get current user.
    """
    return current_user

@router.get("/me/financial-advice", response_model=str)
async def get_my_advice(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Analyzes the current user's spending across all groups and provides personalized advice.
    """
    # 1. Gather the data
    spending_summary = crud_user.get_user_spending_summary(db=db, user_id=current_user.id)
    
    # 2. Call the AI
    advice = await financial_advisor.get_user_financial_advice(user_spending_summary=spending_summary)
    return advice