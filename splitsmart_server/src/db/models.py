# src/db/models.py
import enum
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, ForeignKey, Table, Boolean, JSON, Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .base import Base

# --- Enums with explicit names for PostgreSQL ---
class UserStatus(enum.Enum):
    invited = "invited"
    active = "active"
    deactivated = "deactivated"

class GroupStatus(enum.Enum):
    active = "active"
    archived = "archived"

class ExpenseStatus(enum.Enum):
    active = "active"
    deleted = "deleted"
    disputed = "disputed"

class SplitType(enum.Enum):
    equally = "equally"
    by_item = "by_item"
    by_percentage = "by_percentage"
    by_shares = "by_shares"

class PaymentStatus(enum.Enum):
    pending_confirmation = "pending_confirmation"
    completed = "completed"
    cancelled = "cancelled"

class BillUploadStatus(enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    review_needed = "review_needed"

# --- FriendshipStatus as a native Python Enum for consistency ---
class FriendshipStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    blocked = "blocked"


# --- Association Tables ---
group_members_table = Table(
    'group_members', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('group_id', Integer, ForeignKey('groups.id'), primary_key=True)
)

class Friendship(Base):
    __tablename__ = 'friendships'
    requester_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    addressee_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    
    # --- THIS IS THE FIX ---
    # We provide a `name` for the database ENUM type.
    status = Column(
        Enum(FriendshipStatus, name="friendship_status_enum"), 
        nullable=False, 
        default=FriendshipStatus.pending
    )
    
    requester = relationship("User", foreign_keys=[requester_id])
    addressee = relationship("User", foreign_keys=[addressee_id])


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    profile_picture_url = Column(String, nullable=True)
    
    # --- Added name for consistency ---
    status = Column(Enum(UserStatus, name="user_status_enum"), nullable=False, default=UserStatus.active)
    
    default_currency = Column(String(3), default="USD", nullable=False)
    preferences = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    groups = relationship("Group", secondary=group_members_table, back_populates="members")


class Group(Base):
    __tablename__ = 'groups'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    group_picture_url = Column(String, nullable=True)
    default_currency = Column(String(3), default="USD", nullable=False)
    
    # --- Added name for consistency ---
    status = Column(Enum(GroupStatus, name="group_status_enum"), nullable=False, default=GroupStatus.active)
    
    created_by_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    creator = relationship("User")
    members = relationship("User", secondary=group_members_table, back_populates="groups")
    expenses = relationship("Expense", back_populates="group")
    payments = relationship("Payment", back_populates="group")


class Expense(Base):
    __tablename__ = 'expenses'
    id = Column(Integer, primary_key=True, index=True)
    description = Column(String, index=True)
    total_amount = Column(Float, nullable=False)
    expense_date = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    currency = Column(String(3), nullable=False)
    category = Column(String, nullable=True)
    
    # --- Added names for consistency ---
    status = Column(Enum(ExpenseStatus, name="expense_status_enum"), nullable=False, default=ExpenseStatus.active)
    split_type = Column(Enum(SplitType, name="split_type_enum"), nullable=False, default=SplitType.equally)
    
    notes = Column(String, nullable=True)
    group_id = Column(Integer, ForeignKey('groups.id'), nullable=False)
    paid_by_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    created_by_id = Column(Integer, ForeignKey('users.id'))
    bill_upload_id = Column(Integer, ForeignKey('bill_uploads.id'), unique=True, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    group = relationship("Group", back_populates="expenses")
    paid_by = relationship("User", foreign_keys=[paid_by_id])
    created_by = relationship("User", foreign_keys=[created_by_id])
    bill_upload = relationship("BillUpload", back_populates="expense")
    splits = relationship("ExpenseSplit", back_populates="expense", cascade="all, delete-orphan")


class ExpenseSplit(Base):
    __tablename__ = 'expense_splits'
    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey('expenses.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    owed_amount = Column(Float, nullable=False)
    split_details = Column(JSON, nullable=True)
    expense = relationship("Expense", back_populates="splits")
    user = relationship("User")


class Payment(Base):
    __tablename__ = 'payments'
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False)
    payment_method = Column(String, default="cash")
    
    # --- Added name for consistency ---
    status = Column(Enum(PaymentStatus, name="payment_status_enum"), nullable=False, default=PaymentStatus.completed)
    
    notes = Column(String, nullable=True)
    group_id = Column(Integer, ForeignKey('groups.id'), nullable=False)
    paid_by_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    paid_to_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    group = relationship("Group", back_populates="payments")
    paid_by_user = relationship("User", foreign_keys=[paid_by_id])
    paid_to_user = relationship("User", foreign_keys=[paid_to_id])


class BillUpload(Base):
    __tablename__ = 'bill_uploads'
    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String, nullable=False)
    raw_scan_data = Column(JSON, nullable=False)
    
    # --- Added name for consistency ---
    status = Column(Enum(BillUploadStatus, name="bill_upload_status_enum"), nullable=False, default=BillUploadStatus.pending)
    
    ai_confidence_score = Column(Float, nullable=True)
    human_review_needed = Column(Boolean, default=False)
    error_message = Column(String, nullable=True)
    uploader_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expense = relationship("Expense", back_populates="bill_upload", uselist=False)


class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    message = Column(String, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    type = Column(String)
    related_entity_id = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())