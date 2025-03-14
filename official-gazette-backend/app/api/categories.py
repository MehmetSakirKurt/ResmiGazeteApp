from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.auth import get_current_user
from app.db.supabase_client import supabase
from app.models.category import Category, CategoryCreate, CategoryUpdate, CategoryWithPublications

router = APIRouter()


@router.get("/", response_model=List[Category])
async def get_categories(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> Any:
    """
    Retrieve all categories
    """
    categories = supabase.fetch_data(
        "categories", 
        {
            "limit": limit,
            "offset": skip,
            "order": [{"column": "name", "ascending": True}]
        }
    )
    
    return categories


@router.get("/{category_id}", response_model=CategoryWithPublications)
async def get_category(
    category_id: str,
    current_user: dict = Depends(get_current_user),
    publication_limit: int = Query(10, ge=1, le=50),
) -> Any:
    """
    Get a specific category by ID with its publications
    """
    # Get category
    category_data = supabase.fetch_data(
        "categories", 
        {"filters": [{"column": "id", "value": category_id}]}
    )
    
    if not category_data or len(category_data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    category = category_data[0]
    
    # Get recent publications for this category
    # This is a simplification - in a real app, you'd use a more complex query
    # to handle the many-to-many relationship between publications and categories
    publications = supabase.fetch_data(
        "publications", 
        {
            "filters": [{"column": "category_ids", "operator": "like", "value": f"%{category_id}%"}],
            "limit": publication_limit,
            "order": [{"column": "publication_date", "ascending": False}]
        }
    )
    
    # Get total count
    # This is a simplification - in a real app, you'd use a count query
    publication_count = len(publications)
    
    # Create response
    category_with_publications = {
        **category,
        "publication_count": publication_count,
        "publications": publications
    }
    
    return category_with_publications


@router.post("/", response_model=Category, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_in: CategoryCreate,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Create a new category
    """
    # Check if user is superuser (admin)
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Convert model to dict
    category_data = category_in.dict()
    
    # Insert category into database
    new_category = supabase.insert_data("categories", category_data)
    
    if not new_category or len(new_category) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create category",
        )
    
    return new_category[0]


@router.put("/{category_id}", response_model=Category)
async def update_category(
    category_id: str,
    category_in: CategoryUpdate,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Update a category
    """
    # Check if user is superuser (admin)
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Check if category exists
    existing_category = supabase.fetch_data(
        "categories", 
        {"filters": [{"column": "id", "value": category_id}]}
    )
    
    if not existing_category or len(existing_category) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    # Convert model to dict, removing None values
    update_data = {k: v for k, v in category_in.dict().items() if v is not None}
    
    # Update category in database
    updated_category = supabase.update_data(
        "categories", 
        update_data, 
        "id", 
        category_id
    )
    
    if not updated_category or len(updated_category) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update category",
        )
    
    return updated_category[0]


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a category
    """
    # Check if user is superuser (admin)
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Check if category exists
    existing_category = supabase.fetch_data(
        "categories", 
        {"filters": [{"column": "id", "value": category_id}]}
    )
    
    if not existing_category or len(existing_category) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    # Delete category from database
    supabase.delete_data("categories", "id", category_id)


@router.get("/subscribe/{category_id}", status_code=status.HTTP_200_OK)
async def subscribe_to_category(
    category_id: str,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Subscribe to notifications for a category
    """
    # Check if category exists
    existing_category = supabase.fetch_data(
        "categories", 
        {"filters": [{"column": "id", "value": category_id}]}
    )
    
    if not existing_category or len(existing_category) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found",
        )
    
    # Get user's subscriptions
    subscriptions = supabase.fetch_data(
        "user_category_subscriptions", 
        {"filters": [{"column": "user_id", "value": current_user["id"]}]}
    )
    
    # Check if already subscribed
    for subscription in subscriptions:
        if subscription["category_id"] == category_id:
            return {"message": "Already subscribed to this category"}
    
    # Add subscription
    subscription_data = {
        "user_id": current_user["id"],
        "category_id": category_id,
    }
    
    supabase.insert_data("user_category_subscriptions", subscription_data)
    
    return {"message": "Successfully subscribed to category"}


@router.delete("/unsubscribe/{category_id}", status_code=status.HTTP_200_OK)
async def unsubscribe_from_category(
    category_id: str,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Unsubscribe from notifications for a category
    """
    # Get user's subscriptions
    subscriptions = supabase.fetch_data(
        "user_category_subscriptions", 
        {
            "filters": [
                {"column": "user_id", "value": current_user["id"]},
                {"column": "category_id", "value": category_id}
            ]
        }
    )
    
    if not subscriptions or len(subscriptions) == 0:
        return {"message": "Not subscribed to this category"}
    
    # Delete subscription
    for subscription in subscriptions:
        supabase.delete_data("user_category_subscriptions", "id", subscription["id"])
    
    return {"message": "Successfully unsubscribed from category"}


@router.get("/subscriptions", response_model=List[Category])
async def get_subscribed_categories(
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Get user's subscribed categories
    """
    # Get user's subscriptions
    subscriptions = supabase.fetch_data(
        "user_category_subscriptions", 
        {"filters": [{"column": "user_id", "value": current_user["id"]}]}
    )
    
    if not subscriptions:
        return []
    
    # Get category IDs
    category_ids = [subscription["category_id"] for subscription in subscriptions]
    
    # This is a simplification - in a real app, you'd use a more efficient query
    # to fetch all categories at once
    categories = []
    for category_id in category_ids:
        category_data = supabase.fetch_data(
            "categories", 
            {"filters": [{"column": "id", "value": category_id}]}
        )
        if category_data and len(category_data) > 0:
            categories.append(category_data[0])
    
    return categories
