from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class User(BaseModel):
    """
    User model representing an application user
    """
    id: Optional[str] = None
    email: EmailStr
    company_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    class Config:
        orm_mode = True


class UserCreate(BaseModel):
    """
    Schema for creating a new user
    """
    email: EmailStr
    password: str
    company_name: Optional[str] = None


class UserUpdate(BaseModel):
    """
    Schema for updating an existing user
    """
    email: Optional[EmailStr] = None
    company_name: Optional[str] = None
    is_active: Optional[bool] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class UserInDB(User):
    """
    User model as stored in the database
    """
    hashed_password: str


class UserWithPreferences(User):
    """
    User model with notification preferences
    """
    notification_preferences: Optional[dict] = None
    favorite_categories: List[str] = []
    font_size_scale: float = 1.0
    dark_mode: bool = False
