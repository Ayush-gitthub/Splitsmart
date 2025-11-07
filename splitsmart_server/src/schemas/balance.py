from pydantic import BaseModel
from typing import Optional

class UserBalance(BaseModel):
    user_id: int
    email: str
    full_name: Optional[str] = None
    balance: float # Positive means they are owed money, negative means they owe money