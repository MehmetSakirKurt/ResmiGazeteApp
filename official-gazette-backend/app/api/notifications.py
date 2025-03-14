from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.auth import get_current_user
from app.db.supabase_client import supabase
from app.models.notification import Notification, NotificationUpdate, NotificationBatch
from app.services.notification_service import send_notification

router = APIRouter()


@router.get("/", response_model=List[Notification])
async def get_notifications(
    current_user: dict = Depends(get_current_user),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    unread_only: bool = False,
) -> Any:
    """
    Get user's notifications
    """
    # Build query parameters
    query = {
        "limit": limit,
        "offset": skip,
        "order": [{"column": "created_at", "ascending": False}],
        "filters": [{"column": "user_id", "value": current_user["id"]}]
    }
    
    # Add unread filter if requested
    if unread_only:
        query["filters"].append({"column": "is_read", "value": False})
    
    # Fetch notifications from database
    notifications = supabase.fetch_data("notifications", query)
    
    return notifications or []


@router.get("/unread-count", status_code=status.HTTP_200_OK)
async def get_unread_count(
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Get count of unread notifications
    """
    # Fetch unread notifications count
    unread_notifications = supabase.fetch_data(
        "notifications", 
        {
            "filters": [
                {"column": "user_id", "value": current_user["id"]},
                {"column": "is_read", "value": False}
            ]
        }
    )
    
    return {"unread_count": len(unread_notifications) if unread_notifications else 0}


@router.get("/{notification_id}", response_model=Notification)
async def get_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Get a specific notification
    """
    notification = supabase.fetch_data(
        "notifications", 
        {"filters": [
            {"column": "id", "value": notification_id},
            {"column": "user_id", "value": current_user["id"]}
        ]}
    )
    
    if not notification or len(notification) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    return notification[0]


@router.put("/{notification_id}/read", response_model=Notification)
async def mark_notification_as_read(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Mark a notification as read
    """
    # Check if notification exists and belongs to user
    notification = supabase.fetch_data(
        "notifications", 
        {"filters": [
            {"column": "id", "value": notification_id},
            {"column": "user_id", "value": current_user["id"]}
        ]}
    )
    
    if not notification or len(notification) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    # Update notification
    updated_notification = supabase.update_data(
        "notifications", 
        {"is_read": True}, 
        "id", 
        notification_id
    )
    
    if not updated_notification or len(updated_notification) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification",
        )
    
    return updated_notification[0]


@router.put("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_as_read(
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Mark all notifications as read
    """
    # Get unread notifications
    unread_notifications = supabase.fetch_data(
        "notifications", 
        {
            "filters": [
                {"column": "user_id", "value": current_user["id"]},
                {"column": "is_read", "value": False}
            ]
        }
    )
    
    if not unread_notifications:
        return {"message": "No unread notifications"}
    
    # Update each notification
    # Note: In a real app, you'd use a batch update operation
    for notification in unread_notifications:
        supabase.update_data(
            "notifications", 
            {"is_read": True}, 
            "id", 
            notification["id"]
        )
    
    return {"message": f"Marked {len(unread_notifications)} notifications as read"}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Delete a notification
    """
    # Check if notification exists and belongs to user
    notification = supabase.fetch_data(
        "notifications", 
        {"filters": [
            {"column": "id", "value": notification_id},
            {"column": "user_id", "value": current_user["id"]}
        ]}
    )
    
    if not notification or len(notification) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    # Delete notification
    supabase.delete_data("notifications", "id", notification_id)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_notifications(
    current_user: dict = Depends(get_current_user),
):
    """
    Delete all notifications for the current user
    """
    # Get user's notifications
    notifications = supabase.fetch_data(
        "notifications", 
        {"filters": [{"column": "user_id", "value": current_user["id"]}]}
    )
    
    if not notifications:
        return
    
    # Delete each notification
    # Note: In a real app, you'd use a batch delete operation
    for notification in notifications:
        supabase.delete_data("notifications", "id", notification["id"])


@router.post("/send", status_code=status.HTTP_201_CREATED)
async def send_notifications(
    notification_batch: NotificationBatch,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Send notifications to users (admin only)
    """
    # Check if user is superuser (admin)
    if not current_user.get("is_superuser", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    
    created_notifications = []
    
    # Create notifications in database
    for notification in notification_batch.notifications:
        notification_data = notification.dict()
        
        new_notification = supabase.insert_data("notifications", notification_data)
        
        if new_notification and len(new_notification) > 0:
            created_notifications.append(new_notification[0])
            
            # Send push notification if requested
            if notification_batch.send_immediately:
                try:
                    # Get user's devices
                    user_devices = supabase.fetch_data(
                        "user_devices", 
                        {"filters": [
                            {"column": "user_id", "value": notification_data["user_id"]},
                            {"column": "is_active", "value": True}
                        ]}
                    )
                    
                    if user_devices and len(user_devices) > 0:
                        for device in user_devices:
                            await send_notification(
                                device["device_token"],
                                notification_data["title"],
                                notification_data["body"],
                                {
                                    "notification_id": new_notification[0]["id"],
                                    "publication_id": notification_data.get("publication_id"),
                                    "category_id": notification_data.get("category_id")
                                }
                            )
                except Exception as e:
                    # Log error but continue with other notifications
                    print(f"Failed to send push notification: {str(e)}")
    
    return {
        "message": f"Created {len(created_notifications)} notifications",
        "notifications": created_notifications
    }


@router.post("/test", status_code=status.HTTP_200_OK)
async def send_test_notification(
    device_token: str,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Send a test notification to a device
    """
    try:
        await send_notification(
            device_token,
            "Test Notification",
            "This is a test notification from the Official Gazette app.",
            {"test": True}
        )
        return {"message": "Test notification sent successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send test notification: {str(e)}",
        )
