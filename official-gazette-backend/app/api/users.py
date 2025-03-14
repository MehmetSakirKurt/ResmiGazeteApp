from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status

from app.api.auth import get_current_user
from app.core.security import get_password_hash
from app.db.supabase_client import supabase
from app.models.user import User, UserUpdate, UserWithPreferences

router = APIRouter()


@router.get("/me", response_model=UserWithPreferences)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Get current user profile with preferences
    """
    # Get user preferences
    preferences = supabase.fetch_data(
        "user_preferences", 
        {"filters": [{"column": "user_id", "value": current_user["id"]}]}
    )
    
    # Get user's favorite categories
    favorite_categories = supabase.fetch_data(
        "user_category_subscriptions", 
        {"filters": [{"column": "user_id", "value": current_user["id"]}]}
    )
    
    favorite_category_ids = [fc["category_id"] for fc in favorite_categories] if favorite_categories else []
    
    # Prepare user with preferences
    user_with_preferences = {
        **current_user,
        "notification_preferences": preferences[0] if preferences else {},
        "favorite_categories": favorite_category_ids,
        "font_size_scale": preferences[0].get("font_size_scale", 1.0) if preferences else 1.0,
        "dark_mode": preferences[0].get("dark_mode", False) if preferences else False,
    }
    
    # Remove sensitive information
    if "hashed_password" in user_with_preferences:
        del user_with_preferences["hashed_password"]
    
    return user_with_preferences


@router.put("/me", response_model=User)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Update current user profile
    """
    # Convert model to dict, removing None values
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    # Update user in database
    updated_user = supabase.update_data(
        "users", 
        update_data, 
        "id", 
        current_user["id"]
    )
    
    if not updated_user or len(updated_user) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user profile",
        )
    
    # Remove sensitive information
    if "hashed_password" in updated_user[0]:
        del updated_user[0]["hashed_password"]
    
    return updated_user[0]


@router.put("/me/password", status_code=status.HTTP_200_OK)
async def update_password(
    passwords: dict,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Update current user password
    """
    # Verify current password
    from app.core.security import verify_password
    
    if not verify_password(passwords["current_password"], current_user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password",
        )
    
    # Hash new password
    hashed_password = get_password_hash(passwords["new_password"])
    
    # Update password in database
    updated_user = supabase.update_data(
        "users", 
        {"hashed_password": hashed_password}, 
        "id", 
        current_user["id"]
    )
    
    if not updated_user or len(updated_user) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update password",
        )
    
    return {"message": "Password updated successfully"}


@router.put("/me/preferences", status_code=status.HTTP_200_OK)
async def update_preferences(
    preferences: dict,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Update user preferences
    """
    # Get existing preferences
    existing_preferences = supabase.fetch_data(
        "user_preferences", 
        {"filters": [{"column": "user_id", "value": current_user["id"]}]}
    )
    
    if existing_preferences and len(existing_preferences) > 0:
        # Update existing preferences
        updated_preferences = supabase.update_data(
            "user_preferences", 
            preferences, 
            "id", 
            existing_preferences[0]["id"]
        )
    else:
        # Create new preferences
        preferences_data = {
            "user_id": current_user["id"],
            **preferences
        }
        
        updated_preferences = supabase.insert_data("user_preferences", preferences_data)
    
    if not updated_preferences or len(updated_preferences) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update preferences",
        )
    
    return {"message": "Preferences updated successfully"}


@router.get("/me/devices", response_model=List[dict])
async def get_user_devices(
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Get user's registered devices for notifications
    """
    devices = supabase.fetch_data(
        "user_devices", 
        {"filters": [{"column": "user_id", "value": current_user["id"]}]}
    )
    
    return devices or []


@router.post("/me/devices", status_code=status.HTTP_201_CREATED)
async def register_device(
    device_data: dict,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Register a device for push notifications
    """
    # Check if device token already exists
    existing_device = supabase.fetch_data(
        "user_devices", 
        {"filters": [
            {"column": "user_id", "value": current_user["id"]},
            {"column": "device_token", "value": device_data["device_token"]}
        ]}
    )
    
    if existing_device and len(existing_device) > 0:
        # Update existing device
        updated_device = supabase.update_data(
            "user_devices", 
            {
                "device_name": device_data.get("device_name", "Unknown Device"),
                "device_type": device_data.get("device_type", "android"),
                "is_active": True
            }, 
            "id", 
            existing_device[0]["id"]
        )
        
        return {"message": "Device updated successfully", "device": updated_device[0]}
    
    # Create new device
    new_device_data = {
        "user_id": current_user["id"],
        "device_token": device_data["device_token"],
        "device_name": device_data.get("device_name", "Unknown Device"),
        "device_type": device_data.get("device_type", "android"),
        "is_active": True
    }
    
    new_device = supabase.insert_data("user_devices", new_device_data)
    
    if not new_device or len(new_device) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to register device",
        )
    
    return {"message": "Device registered successfully", "device": new_device[0]}


@router.delete("/me/devices/{device_id}", status_code=status.HTTP_200_OK)
async def unregister_device(
    device_id: str,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Unregister a device for push notifications
    """
    # Check if device exists and belongs to user
    existing_device = supabase.fetch_data(
        "user_devices", 
        {"filters": [
            {"column": "id", "value": device_id},
            {"column": "user_id", "value": current_user["id"]}
        ]}
    )
    
    if not existing_device or len(existing_device) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device not found",
        )
    
    # Delete device
    supabase.delete_data("user_devices", "id", device_id)
    
    return {"message": "Device unregistered successfully"}
