from pydantic import BaseModel, Field
from typing import Optional, List
from .user import User  # Import the User schema to use in responses

# --- Base Schema ---
class GroupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)

# --- Schemas for Operations ---
class GroupCreate(GroupBase):
    pass

class GroupUpdate(GroupBase):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=255)

# --- Schema for Responses ---
# This will be the main schema returned from the API
class Group(GroupBase):
    id: int
    created_by_id: int
    members: List[User] = [] # Return a list of full User objects

    class Config:
        from_attributes = True