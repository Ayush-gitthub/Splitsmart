from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func, case
from src.db import models
from src.schemas import group as group_schema

def create_group_with_owner(db: Session, group: group_schema.GroupCreate, owner: models.User) -> models.Group:
    """
    Creates a new group and automatically adds the owner as the first member.
    """
    # Create the Group instance
    db_group = models.Group(
        name=group.name,
        description=group.description,
        creator=owner
    )
    
    # Add the owner to the group's members list
    db_group.members.append(owner)
    
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

def get_group(db: Session, group_id: int) -> models.Group | None:
    """
    Fetches a single group by its ID.
    """
    return db.query(models.Group).filter(models.Group.id == group_id).first()

def get_groups_for_user(db: Session, user_id: int) -> List[models.Group]:
    """
    Fetches all groups that a specific user is a member of.
    """
    return db.query(models.Group).join(models.group_members_table).filter(
        models.group_members_table.c.user_id == user_id
    ).all()

def add_member_to_group(db: Session, group: models.Group, user: models.User) -> models.Group:
    """
    Adds a user to a group's members list if they are not already a member.
    Returns the updated group.
    """
    if user not in group.members:
        group.members.append(user)
        db.commit()
        db.refresh(group)
    return group

def get_group_balances(db: Session, group_id: int) -> List[dict]:
    """
    Calculates the net balance for each member in a group.
    Balance = (Total amount they paid FOR the group) - (Total amount of THEIR share)
    
    Returns a list of dictionaries with user info and their calculated balance.
    """
    # This single, powerful query joins all necessary tables and performs the aggregation
    # directly in the database for maximum efficiency.
    balance_subquery = (
        db.query(
            models.Expense.paid_by_id.label("user_id"),
            func.sum(models.Expense.total_amount).label("total_paid")
        )
        .filter(models.Expense.group_id == group_id)
        .group_by(models.Expense.paid_by_id)
        .subquery()
    )

    owed_subquery = (
        db.query(
            models.ExpenseSplit.user_id.label("user_id"),
            func.sum(models.ExpenseSplit.owed_amount).label("total_owed")
        )
        .join(models.Expense)
        .filter(models.Expense.group_id == group_id)
        .group_by(models.ExpenseSplit.user_id)
        .subquery()
    )

    balance_query = (
        db.query(
            models.User.id,
            models.User.email,
            models.User.full_name,
            func.coalesce(balance_subquery.c.total_paid, 0).label("total_paid"),
            func.coalesce(owed_subquery.c.total_owed, 0).label("total_owed")
        )
        .select_from(models.User)
        .join(models.group_members_table)
        .filter(models.group_members_table.c.group_id == group_id)
        .outerjoin(balance_subquery, models.User.id == balance_subquery.c.user_id)
        .outerjoin(owed_subquery, models.User.id == owed_subquery.c.user_id)
    )

    results = balance_query.all()

    balances = [
        {
            "user_id": r.id,
            "email": r.email,
            "full_name": r.full_name,
            "balance": round(r.total_paid - r.total_owed, 2) # round to 2 decimal places
        }
        for r in results
    ]
    
    return balances