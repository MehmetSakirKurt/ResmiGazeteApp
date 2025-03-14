from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class Notification(BaseModel):
    """
    Notification model representing a push notification for users
    """
    id: Optional[str] = None
    title: str
    body: str
    user_id: str
    publication_id: Optional[str] = None
    category_id: Optional[str] = None
    is_read: bool = False
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    scheduled_for: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    
    class Config:
        orm_mode = True


class NotificationCreate(BaseModel):
    """
    Schema for creating a new notification
    """
    title: str
    body: str
    user_id: str
    publication_id: Optional[str] = None
    category_id: Optional[str] = None
    scheduled_for: Optional[datetime] = None


class NotificationUpdate(BaseModel):
    """
    Schema for updating an existing notification
    """
    is_read: Optional[bool] = None
    sent_at: Optional[datetime] = None


class NotificationInDB(Notification):
    """
    Notification model as stored in the database
    """
    pass


class NotificationBatch(BaseModel):
    """
    Schema for creating multiple notifications at once
    """
    notifications: List[NotificationCreate]
    send_immediately: bool = False
