from pydantic import BaseModel, EmailStr
from typing import List
from .user import User  # To display user details in the friend list

# An enum to represent the status of a friendship, matching the database model
from enum import Enum

class FriendshipStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    blocked = "blocked"

# Schema for sending a friend request. The user can be identified by email.
class FriendRequestCreate(BaseModel):
    email: EmailStr

# Schema for displaying a friendship in a list.
# It includes the status and the full user object of the friend.
class Friendship(BaseModel):
    friend: User
    status: FriendshipStatus

    class Config:
        from_attributes = True