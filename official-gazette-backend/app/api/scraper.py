from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from app.api.auth import get_current_user
from app.services.gazette_scraper import run_gazette_scraper

router = APIRouter()


@router.post("/run", status_code=status.HTTP_202_ACCEPTED)
async def trigger_scraper(
    background_tasks: BackgroundTasks,
    days: int = 7,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Trigger the Official Gazette scraper to fetch and save recent publications
    """
    # Check if user is superuser (admin)
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Run the scraper in the background
    background_tasks.add_task(run_gazette_scraper, days)
    
    return {
        "status": "accepted",
        "message": f"Scraper started in the background. Fetching publications from the last {days} days.",
    }


@router.post("/run-sync", status_code=status.HTTP_200_OK)
async def run_scraper_sync(
    days: int = 7,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Run the Official Gazette scraper synchronously and return the results
    """
    # Check if user is superuser (admin)
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    # Run the scraper synchronously
    publications = await run_gazette_scraper(days)
    
    return {
        "status": "success",
        "message": f"Successfully fetched {len(publications)} publications",
        "publications": publications,
    }
