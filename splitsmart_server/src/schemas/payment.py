from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

from .user import User # To show user details in the response

class PaymentBase(BaseModel):
    amount: float = Field(..., gt=0, description="Payment amount must be positive")
    currency: str = Field("USD", max_length=3)
    notes: Optional[str] = None

# --- Schema for Creating a Payment ---
# To create a payment, we need to know who paid whom.
class PaymentCreate(PaymentBase):
    paid_to_id: int

# --- Schema for API Responses ---
class Payment(PaymentBase):
    id: int
    group_id: int
    paid_by_user: User  # The user who made the payment
    paid_to_user: User  # The user who received the payment
    timestamp: datetime

    class Config:
        from_attributes = True