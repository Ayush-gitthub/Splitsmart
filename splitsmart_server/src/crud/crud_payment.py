from sqlalchemy.orm import Session
from src.db import models
from src.schemas import payment as payment_schema
from src.crud import crud_group
from .crud_expense import CrudError

def create_payment(
    db: Session,
    payment_in: payment_schema.PaymentCreate,
    group: models.Group,
    payer: models.User
) -> models.Payment:
    # --- (Validation logic remains the same) ---
    if payer.id == payment_in.paid_to_id:
        raise CrudError("Cannot record a payment to yourself.")
    member_ids = {member.id for member in group.members}
    if payment_in.paid_to_id not in member_ids:
        raise CrudError("The user receiving the payment is not a member of this group.")

    db_payment = models.Payment(
        amount=payment_in.amount,
        currency=payment_in.currency,
        notes=payment_in.notes,
        group_id=group.id,
        paid_by_id=payer.id,
        paid_to_id=payment_in.paid_to_id
    )
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    # --- THIS IS THE SIMPLER FIX ---
    # By accessing these attributes, we force SQLAlchemy to lazy-load them
    # before the object is returned.
    # _ = db_payment.paid_by_user
    # _ = db_payment.paid_to_user
    
    return db_payment