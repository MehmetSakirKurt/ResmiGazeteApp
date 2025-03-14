from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class Publication(BaseModel):
    """
    Publication model representing an official gazette publication
    """
    id: Optional[str] = None
    title: str
    publication_date: datetime
    content: str
    url: str
    category_ids: List[str] = []
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    class Config:
        orm_mode = True


class PublicationCreate(BaseModel):
    """
    Schema for creating a new publication
    """
    title: str
    publication_date: datetime
    content: str
    url: str
    category_ids: List[str] = []


class PublicationUpdate(BaseModel):
    """
    Schema for updating an existing publication
    """
    title: Optional[str] = None
    publication_date: Optional[datetime] = None
    content: Optional[str] = None
    url: Optional[str] = None
    category_ids: Optional[List[str]] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class PublicationInDB(Publication):
    """
    Publication model as stored in the database
    """
    pass
