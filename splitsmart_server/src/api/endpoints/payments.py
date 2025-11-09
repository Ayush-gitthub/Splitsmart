from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.schemas import payment as payment_schema
from src.crud import crud_payment, crud_group
from src.api import deps
from src.db import models

router = APIRouter()

@router.post("/groups/{group_id}/payments", response_model=payment_schema.Payment)
def record_payment(
    group_id: int,
    *,
    db: Session = Depends(deps.get_db),
    payment_in: payment_schema.PaymentCreate,
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Record a payment made by the current user to another user within a group.
    """
    group = crud_group.get_group(db=db, group_id=group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # Security check: User must be a member of the group to record a payment
    if current_user not in group.members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group."
        )

    try:
        payment = crud_payment.create_payment(
            db=db, payment_in=payment_in, group=group, payer=current_user
        )
        return payment
    except crud_payment.CrudError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))