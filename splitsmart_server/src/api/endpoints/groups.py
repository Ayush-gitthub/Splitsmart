from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.schemas import balance as balance_schema 
from src.schemas import group as group_schema
from src.schemas import user as user_schema
from src.crud import crud_group, crud_user, crud_expense
from src.api import deps
from src.db import models
from src.core import financial_advisor
from src.schemas.expense import Expense
from src.schemas.balance import UserBalance 
router = APIRouter()

@router.post("/", response_model=group_schema.Group)
def create_group(
    *,
    db: Session = Depends(deps.get_db),
    group_in: group_schema.GroupCreate,
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Create a new group. The user creating the group is automatically the owner and first member.
    """
    group = crud_group.create_group_with_owner(db=db, group=group_in, owner=current_user)
    return group

@router.get("/", response_model=List[group_schema.Group])
def read_user_groups(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Retrieve all groups the current user is a member of.
    """
    groups = crud_group.get_groups_for_user(db=db, user_id=current_user.id)
    return groups

@router.get("/{group_id}", response_model=group_schema.Group)
def read_group(
    group_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Retrieve details for a specific group.
    Ensures the current user is a member of the group they are trying to access.
    """
    group = crud_group.get_group(db=db, group_id=group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user not in group.members:
        raise HTTPException(status_code=403, detail="Not authorized to access this group")
        
    return group

@router.post("/{group_id}/members", response_model=group_schema.Group)
def add_group_member(
    group_id: int,
    user_to_add: user_schema.UserBase, # We only need the email to find the user
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Add a new member to a group. Only a current member can add others.
    """
    group = crud_group.get_group(db=db, group_id=group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    # Security Check: Ensure the user adding a member is part of the group
    if current_user not in group.members:
        raise HTTPException(status_code=403, detail="Not authorized to add members to this group")

    # Find the user to be added by their email
    user = crud_user.get_user_by_email(db, email=user_to_add.email)
    if not user:
        raise HTTPException(status_code=404, detail="User to add not found")

    # Add the user to the group
    updated_group = crud_group.add_member_to_group(db=db, group=group, user=user)
    return updated_group

@router.get("/{group_id}/balances", response_model=List[balance_schema.UserBalance])
def read_group_balances(
    group_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Retrieve the net balance for each member of a specific group.
    - Positive balance: The group owes this user money.
    - Negative balance: This user owes the group money.
    """
    group = crud_group.get_group(db=db, group_id=group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if current_user not in group.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group."
        )

    return crud_group.get_group_balances(db=db, group_id=group_id)

@router.get("/{group_id}/financial-advice", response_model=str)
async def get_group_advice(
    group_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Analyzes the group's spending and provides AI-powered financial advice.
    """
    group = crud_group.get_group(db=db, group_id=group_id)
    if not group or current_user not in group.members:
        raise HTTPException(status_code=403, detail="Not authorized to access this group")

    # 1. Gather the data from the database
    expenses_db = crud_expense.get_expenses_for_group(db=db, group_id=group_id)
    balances_data = crud_group.get_group_balances(db=db, group_id=group_id)
    
    # 2. Convert raw data to Pydantic models
    expenses_pydantic = [Expense.model_validate(exp) for exp in expenses_db]
    balances_pydantic = [UserBalance(**bal) for bal in balances_data]
    
    # 3. Call the AI with the Pydantic models
    advice = await financial_advisor.get_group_financial_advice(
        expenses=expenses_pydantic, balances=balances_pydantic
    )
    return advice