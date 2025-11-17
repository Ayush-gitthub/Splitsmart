from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from src.schemas import friendship as friendship_schema
from src.schemas import user as user_schema
from src.crud import crud_friendship
from src.api import deps
from src.db import models

router = APIRouter()

@router.post("/requests", status_code=status.HTTP_201_CREATED)
def send_request(
    *,
    db: Session = Depends(deps.get_db),
    request_in: friendship_schema.FriendRequestCreate,
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Send a friend request to another user by their email.
    """
    try:
        crud_friendship.send_friend_request(db=db, requester=current_user, addressee_email=request_in.email)
        return {"msg": "Friend request sent successfully."}
    except crud_friendship.CrudError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/requests/pending", response_model=List[user_schema.User])
def get_pending_requests(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get a list of users who have sent a friend request to the current user.
    """
    requests = crud_friendship.get_friendship_requests(db=db, user=current_user)
    return [req.requester for req in requests]

@router.post("/requests/{requester_id}/accept")
def accept_request(
    requester_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Accept a friend request from a user.
    """
    # Fetch the specific friend request where the current user is the recipient
    friendship = db.query(models.Friendship).filter(
        models.Friendship.requester_id == requester_id,
        models.Friendship.addressee_id == current_user.id
    ).first()

    # Now the checks are much simpler and more direct
    if not friendship:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Friend request from this user not found.")
    
    if friendship.status != 'pending':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Friendship status is already '{friendship.status}'.")
    
    crud_friendship.accept_friend_request(db, request=friendship)
    return {"msg": "Friend request accepted."}

@router.get("/", response_model=List[user_schema.User])
def get_my_friends(
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Get the current user's friend list.
    """
    friends = crud_friendship.get_friends(db=db, user=current_user)
    return friends