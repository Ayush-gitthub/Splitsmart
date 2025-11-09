import math
from sqlalchemy.orm import Session
from typing import List

from src.db import models
from src.schemas import expense as expense_schema
from src.crud import crud_group

class CrudError(Exception):
    """Custom exception class for CRUD operations."""
    def __init__(self, detail: str):
        self.detail = detail


def create_expense(db: Session, expense_in: expense_schema.ExpenseCreate, group: models.Group, creator: models.User) -> models.Expense:
    """
    Creates a new expense and its corresponding splits within a single database transaction.

    Raises:
        CrudError: If validation fails (e.g., split amounts don't match total, user not in group).
    """
    # --- Pre-computation and Validation ---
    
    # 1. Validate that the sum of splits equals the total amount.
    # We use math.isclose() to handle potential floating-point inaccuracies.
    total_split_amount = sum(split.owed_amount for split in expense_in.splits)
    if not math.isclose(expense_in.total_amount, total_split_amount):
        raise CrudError(
            f"Sum of splits ({total_split_amount}) does not match total amount ({expense_in.total_amount})."
        )

    # 2. Validate that the person who paid is a member of the group.
    payer_ids = {member.id for member in group.members}
    if expense_in.paid_by_id not in payer_ids:
        raise CrudError("The user who paid for the expense is not a member of this group.")

    # 3. Validate that all users in the split are members of the group.
    for split in expense_in.splits:
        if split.user_id not in payer_ids:
            raise CrudError(f"User with ID {split.user_id} in the split is not a member of this group.")

    # --- Database Transaction ---
    # The `with db.begin()` block ensures that all the operations within it are
    # treated as a single atomic transaction. If any error occurs inside this block,
    # all changes are automatically rolled back.
    try:
        # Create the main Expense object
        db_expense = models.Expense(
            description=expense_in.description,
            total_amount=expense_in.total_amount,
            currency=expense_in.currency,
            split_type=expense_in.split_type,
            group_id=group.id,
            paid_by_id=expense_in.paid_by_id,
            created_by_id=creator.id
        )
        db.add(db_expense)
        
        # Flush the session to get an ID for the new expense before creating splits
        db.flush()

        # Create the ExpenseSplit objects
        splits_to_add = []
        for split_data in expense_in.splits:
            db_split = models.ExpenseSplit(
                expense_id=db_expense.id,
                user_id=split_data.user_id,
                owed_amount=split_data.owed_amount
            )
            splits_to_add.append(db_split)
        
        db.add_all(splits_to_add)

        # Everything is staged. Now, commit the transaction to the database.
        db.commit()

    except Exception as e:
        # If any database error occurs, rollback all changes.
        db.rollback()
        # Re-raise the exception to be handled by the API layer
        raise e
    # After the 'with' block successfully completes, the transaction is committed.
    # We need to refresh the expense to load the newly created splits relationship.
    db.refresh(db_expense)
    return db_expense

def get_expenses_for_group(db: Session, group_id: int) -> List[models.Expense]:
    """
    Retrieves all expenses associated with a specific group.
    """
    return db.query(models.Expense).filter(models.Expense.group_id == group_id).all()