from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.schemas import expense as expense_schema
from src.crud import crud_expense, crud_group
from src.api import deps
from src.db import models

router = APIRouter()

@router.post("/groups/{group_id}/expenses", response_model=expense_schema.Expense)
def create_expense_for_group(
    group_id: int,
    *,
    db: Session = Depends(deps.get_db),
    expense_in: expense_schema.ExpenseCreate,
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Create a new expense within a specific group.
    - The current user must be a member of the group.
    - All users involved in the expense (payer and split participants) must be members of the group.
    """
    group = crud_group.get_group(db=db, group_id=group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Security check: Ensure the current user is a member of the group
    if current_user not in group.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group."
        )
    
    try:
        expense = crud_expense.create_expense(db=db, expense_in=expense_in, group=group, creator=current_user)
        return expense
    except crud_expense.CrudError as e:
        # Catch our custom validation errors and return a user-friendly 400 error
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/groups/{group_id}/expenses", response_model=List[expense_schema.Expense])
def read_group_expenses(
    group_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Retrieve all expenses for a specific group.
    The current user must be a member of the group.
    """
    group = crud_group.get_group(db=db, group_id=group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if current_user not in group.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group."
        )

    return crud_expense.get_expenses_for_group(db=db, group_id=group_id)