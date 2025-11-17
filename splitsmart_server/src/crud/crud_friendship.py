from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional

from src.db import models
from src.crud import crud_user
from .crud_expense import CrudError

def send_friend_request(db: Session, requester: models.User, addressee_email: str) -> models.Friendship:
    """Sends a friend request from the requester to a user identified by email."""
    addressee = crud_user.get_user_by_email(db, email=addressee_email)
    if not addressee:
        raise CrudError("User to befriend not found.")
    if requester.id == addressee.id:
        raise CrudError("Cannot send a friend request to yourself.")

    # Check if a friendship (in any state) already exists
    existing_friendship = db.query(models.Friendship).filter(
        or_(
            and_(models.Friendship.requester_id == requester.id, models.Friendship.addressee_id == addressee.id),
            and_(models.Friendship.requester_id == addressee.id, models.Friendship.addressee_id == requester.id)
        )
    ).first()

    if existing_friendship:
        raise CrudError(f"A friendship record already exists with status: {existing_friendship.status}")

    db_friendship = models.Friendship(
        requester_id=requester.id,
        addressee_id=addressee.id,
        status='pending'
    )
    db.add(db_friendship)
    db.commit()
    db.refresh(db_friendship)
    return db_friendship

def get_friendship_requests(db: Session, user: models.User) -> List[models.Friendship]:
    """Gets all pending friend requests for a user."""
    return db.query(models.Friendship).filter(
        models.Friendship.addressee_id == user.id,
        models.Friendship.status == 'pending'
    ).all()

def accept_friend_request(db: Session, request: models.Friendship) -> models.Friendship:
    """Accepts a pending friend request."""
    request.status = 'accepted'
    db.commit()
    db.refresh(request)
    return request

def get_friends(db: Session, user: models.User) -> List[models.User]:
    """Gets a list of all accepted friends for a user."""
    # Find all 'accepted' friendships where the user is either the requester or the addressee
    friendships = db.query(models.Friendship).filter(
        or_(models.Friendship.requester_id == user.id, models.Friendship.addressee_id == user.id),
        models.Friendship.status == 'accepted'
    ).all()
    
    friend_ids = set()
    for f in friendships:
        if f.requester_id == user.id:
            friend_ids.add(f.addressee_id)
        else:
            friend_ids.add(f.requester_id)
            
    return db.query(models.User).filter(models.User.id.in_(friend_ids)).all()

def get_friendship(db: Session, user1_id: int, user2_id: int) -> Optional[models.Friendship]:
    """Gets a specific friendship record between two users."""
    # This query explicitly checks both directions.
    return db.query(models.Friendship).filter(
        (models.Friendship.requester_id == user1_id and models.Friendship.addressee_id == user2_id) |
        (models.Friendship.requester_id == user2_id and models.Friendship.addressee_id == user1_id)
    ).first()