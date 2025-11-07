from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# --- Base Schemas ---
# These contain the common fields that are shared across different operations.

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

# --- Schemas for Specific Operations ---

# Schema for creating a new user. Inherits from UserBase.
# It requires a password, which we don't want to expose in other schemas.
class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=72)

# Schema for updating a user. All fields are optional.
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

# Schema for reading user data. Inherits from UserBase.
# This is what we will return from the API. It should NEVER include the password.
class User(UserBase):
    id: int

    # This tells Pydantic to read the data even if it's not a dict,
    # but an ORM model (or any other arbitrary object with attributes).
    class Config:
        from_attributes = True