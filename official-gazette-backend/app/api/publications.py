from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.auth import get_current_user
from app.db.supabase_client import supabase
from app.models.publication import Publication, PublicationCreate, PublicationUpdate
from app.services.categorization import categorize_publication

router = APIRouter()


@router.get("/", response_model=List[Publication])
async def get_publications(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    category_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search_query: Optional[str] = None,
) -> Any:
    """
    Retrieve publications with optional filtering
    """
    # Build query parameters
    query = {
        "limit": limit,
        "offset": skip,
        "order": [{"column": "publication_date", "ascending": False}]
    }
    
    filters = []
    
    # Add category filter if provided
    if category_id:
        # This is a simplification - in a real app, you'd need a more complex query
        # to handle the many-to-many relationship between publications and categories
        filters.append({"column": "category_ids", "operator": "like", "value": f"%{category_id}%"})
    
    # Add date filters if provided
    if start_date:
        filters.append({"column": "publication_date", "operator": "gte", "value": start_date})
    
    if end_date:
        filters.append({"column": "publication_date", "operator": "lte", "value": end_date})
    
    # Add search filter if provided
    if search_query:
        # This is a simplification - in a real app, you'd use full-text search capabilities
        filters.append({"column": "title", "operator": "like", "value": f"%{search_query}%"})
    
    if filters:
        query["filters"] = filters
    
    # Fetch publications from database
    publications = supabase.fetch_data("publications", query)
    
    return publications


@router.get("/{publication_id}", response_model=Publication)
async def get_publication(
    publication_id: str,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Get a specific publication by ID
    """
    publication = supabase.fetch_data(
        "publications", 
        {"filters": [{"column": "id", "value": publication_id}]}
    )
    
    if not publication or len(publication) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    
    return publication[0]


@router.post("/", response_model=Publication, status_code=status.HTTP_201_CREATED)
async def create_publication(
    publication_in: PublicationCreate,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Create a new publication
    """
    # Check if user is superuser (admin)
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Convert model to dict
    publication_data = publication_in.dict()
    
    # If no categories provided, attempt to categorize the content
    if not publication_data.get("category_ids"):
        try:
            categories = await categorize_publication(
                publication_data["title"], 
                publication_data["content"]
            )
            publication_data["category_ids"] = categories
        except Exception as e:
            # Log the error but continue without categories
            print(f"Categorization error: {str(e)}")
            publication_data["category_ids"] = []
    
    # Insert publication into database
    new_publication = supabase.insert_data("publications", publication_data)
    
    if not new_publication or len(new_publication) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create publication",
        )
    
    return new_publication[0]


@router.put("/{publication_id}", response_model=Publication)
async def update_publication(
    publication_id: str,
    publication_in: PublicationUpdate,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Update a publication
    """
    # Check if user is superuser (admin)
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Check if publication exists
    existing_publication = supabase.fetch_data(
        "publications", 
        {"filters": [{"column": "id", "value": publication_id}]}
    )
    
    if not existing_publication or len(existing_publication) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    
    # Convert model to dict, removing None values
    update_data = {k: v for k, v in publication_in.dict().items() if v is not None}
    
    # Update publication in database
    updated_publication = supabase.update_data(
        "publications", 
        update_data, 
        "id", 
        publication_id
    )
    
    if not updated_publication or len(updated_publication) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update publication",
        )
    
    return updated_publication[0]


@router.delete("/{publication_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_publication(
    publication_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a publication
    """
    # Check if user is superuser (admin)
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Check if publication exists
    existing_publication = supabase.fetch_data(
        "publications", 
        {"filters": [{"column": "id", "value": publication_id}]}
    )
    
    if not existing_publication or len(existing_publication) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    
    # Delete publication from database
    supabase.delete_data("publications", "id", publication_id)


@router.get("/{publication_id}/favorite", status_code=status.HTTP_200_OK)
async def favorite_publication(
    publication_id: str,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Add a publication to user's favorites
    """
    # Check if publication exists
    existing_publication = supabase.fetch_data(
        "publications", 
        {"filters": [{"column": "id", "value": publication_id}]}
    )
    
    if not existing_publication or len(existing_publication) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Publication not found",
        )
    
    # Get user's favorites
    favorites = supabase.fetch_data(
        "user_favorites", 
        {"filters": [{"column": "user_id", "value": current_user["id"]}]}
    )
    
    # Check if already favorited
    for favorite in favorites:
        if favorite["publication_id"] == publication_id:
            return {"message": "Publication already in favorites"}
    
    # Add to favorites
    favorite_data = {
        "user_id": current_user["id"],
        "publication_id": publication_id,
    }
    
    supabase.insert_data("user_favorites", favorite_data)
    
    return {"message": "Publication added to favorites"}


@router.delete("/{publication_id}/favorite", status_code=status.HTTP_200_OK)
async def unfavorite_publication(
    publication_id: str,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Remove a publication from user's favorites
    """
    # Get user's favorites
    favorites = supabase.fetch_data(
        "user_favorites", 
        {
            "filters": [
                {"column": "user_id", "value": current_user["id"]},
                {"column": "publication_id", "value": publication_id}
            ]
        }
    )
    
    if not favorites or len(favorites) == 0:
        return {"message": "Publication not in favorites"}
    
    # Delete from favorites
    for favorite in favorites:
        supabase.delete_data("user_favorites", "id", favorite["id"])
    
    return {"message": "Publication removed from favorites"}


@router.get("/favorites", response_model=List[Publication])
async def get_favorite_publications(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> Any:
    """
    Get user's favorite publications
    """
    # Get user's favorites
    favorites = supabase.fetch_data(
        "user_favorites", 
        {
            "filters": [{"column": "user_id", "value": current_user["id"]}],
            "limit": limit,
            "offset": skip
        }
    )
    
    if not favorites:
        return []
    
    # Get publication IDs
    publication_ids = [favorite["publication_id"] for favorite in favorites]
    
    # This is a simplification - in a real app, you'd use a more efficient query
    # to fetch all publications at once
    publications = []
    for publication_id in publication_ids:
        publication_data = supabase.fetch_data(
            "publications", 
            {"filters": [{"column": "id", "value": publication_id}]}
        )
        if publication_data and len(publication_data) > 0:
            publications.append(publication_data[0])
    
    return publications
