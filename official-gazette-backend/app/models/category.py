from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class Category(BaseModel):
    """
    Category model representing a classification for official gazette publications
    """
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    parent_id: Optional[str] = None
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    
    class Config:
        orm_mode = True


class CategoryCreate(BaseModel):
    """
    Schema for creating a new category
    """
    name: str
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    parent_id: Optional[str] = None


class CategoryUpdate(BaseModel):
    """
    Schema for updating an existing category
    """
    name: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    parent_id: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class CategoryInDB(Category):
    """
    Category model as stored in the database
    """
    pass


class CategoryWithPublications(Category):
    """
    Category model with associated publications
    """
    publication_count: int = 0
    publications: List = []
