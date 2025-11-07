from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from src.db.models import SplitType # Import the Enum for use in the schema
from .user import User # To show user details in responses

# --- Schemas for Splits ---
# This defines an individual's share in an expense.
# It will be used in both request (create) and response models.
class ExpenseSplitBase(BaseModel):
    user_id: int
    owed_amount: float = Field(..., gt=0, description="Amount must be positive")

class ExpenseSplitCreate(ExpenseSplitBase):
    pass

class ExpenseSplit(ExpenseSplitBase):
    user: User # In responses, we want the full user object, not just the ID

    class Config:
        from_attributes = True


# --- Base Schema for the Expense itself ---
class ExpenseBase(BaseModel):
    description: str = Field(..., max_length=255)
    total_amount: float = Field(..., gt=0, description="Total amount must be positive")
    currency: str = Field("USD", max_length=3)
    split_type: SplitType = SplitType.equally


# --- Schema for Creating an Expense ---
# This is the most complex schema. It's what the frontend sends to create an expense.
class ExpenseCreate(ExpenseBase):
    paid_by_id: int
    # The frontend must provide the list of users and how much each one owes.
    splits: List[ExpenseSplitCreate]


# --- Schema for Responses ---
# This is what we return from the API when a user requests expense details.
class Expense(ExpenseBase):
    id: int
    group_id: int
    paid_by: User # The full user object of the person who paid
    created_at: datetime
    splits: List[ExpenseSplit] = []

    class Config:
        from_attributes = True