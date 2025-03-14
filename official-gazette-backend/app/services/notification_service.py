import json
from typing import Dict, Any, List, Optional
import firebase_admin
from firebase_admin import credentials, messaging
from app.core.config import settings

# Initialize Firebase Admin SDK
try:
    cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
    firebase_admin.initialize_app(cred)
    firebase_initialized = True
except Exception as e:
    print(f"Firebase initialization error: {str(e)}")
    firebase_initialized = False


async def send_notification(
    token: str, 
    title: str, 
    body: str, 
    data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Send a push notification to a device using Firebase Cloud Messaging
    
    Args:
        token: The FCM token of the device
        title: Notification title
        body: Notification body
        data: Additional data to send with the notification
        
    Returns:
        Dict with response information
    """
    if not firebase_initialized:
        raise Exception("Firebase not initialized")
    
    # Create message
    message = messaging.Message(
        notification=messaging.Notification(
            title=title,
            body=body,
        ),
        data={str(k): str(v) for k, v in (data or {}).items()},
        token=token,
        android=messaging.AndroidConfig(
            priority="high",
            notification=messaging.AndroidNotification(
                icon="notification_icon",
                color="#4285F4",
                channel_id="official_gazette_channel"
            ),
        ),
    )
    
    try:
        # Send message
        response = messaging.send(message)
        return {"success": True, "message_id": response}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def send_batch_notifications(
    tokens: List[str], 
    title: str, 
    body: str, 
    data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Send batch notifications to multiple devices
    
    Args:
        tokens: List of FCM tokens
        title: Notification title
        body: Notification body
        data: Additional data to send with the notification
        
    Returns:
        Dict with response information
    """
    if not firebase_initialized:
        raise Exception("Firebase not initialized")
    
    if not tokens:
        return {"success": False, "error": "No tokens provided"}
    
    # Create a batch of messages
    messages = []
    for token in tokens:
        messages.append(messaging.Message(
            notification=messaging.Notification(
                title=title,
                body=body,
            ),
            data={str(k): str(v) for k, v in (data or {}).items()},
            token=token,
            android=messaging.AndroidConfig(
                priority="high",
                notification=messaging.AndroidNotification(
                    icon="notification_icon",
                    color="#4285F4",
                    channel_id="official_gazette_channel"
                ),
            ),
        ))
    
    try:
        # Send batch
        batch_response = messaging.send_all(messages)
        return {
            "success": True,
            "success_count": batch_response.success_count,
            "failure_count": batch_response.failure_count,
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


async def schedule_daily_notifications():
    """
    Schedule daily notifications for new publications
    This would be called by a scheduled task at 02:00
    """
    from app.db.supabase_client import supabase
    
    # Get new publications from the last 24 hours
    from datetime import datetime, timedelta
    yesterday = datetime.utcnow() - timedelta(days=1)
    
    new_publications = supabase.fetch_data(
        "publications", 
        {
            "filters": [{"column": "created_at", "operator": "gte", "value": yesterday.isoformat()}],
            "order": [{"column": "publication_date", "ascending": False}]
        }
    )
    
    if not new_publications:
        print("No new publications to notify about")
        return
    
    # Group publications by category
    publications_by_category = {}
    for pub in new_publications:
        for category_id in pub.get("category_ids", []):
            if category_id not in publications_by_category:
                publications_by_category[category_id] = []
            publications_by_category[category_id].append(pub)
    
    # For each category, get subscribers
    for category_id, publications in publications_by_category.items():
        # Get category details
        category = supabase.fetch_data(
            "categories", 
            {"filters": [{"column": "id", "value": category_id}]}
        )
        
        if not category or len(category) == 0:
            continue
            
        category_name = category[0]["name"]
        
        # Get subscribers
        subscribers = supabase.fetch_data(
            "user_category_subscriptions", 
            {"filters": [{"column": "category_id", "value": category_id}]}
        )
        
        if not subscribers:
            continue
            
        # For each subscriber, create a notification
        for subscriber in subscribers:
            user_id = subscriber["user_id"]
            
            # Get user's notification preferences
            preferences = supabase.fetch_data(
                "user_preferences", 
                {"filters": [{"column": "user_id", "value": user_id}]}
            )
            
            # Skip if user has disabled notifications for this category
            if preferences and len(preferences) > 0:
                notification_prefs = preferences[0].get("notification_preferences", {})
                if notification_prefs.get("disabled_categories", []) and category_id in notification_prefs.get("disabled_categories", []):
                    continue
            
            # Create notification in database
            notification_data = {
                "title": f"New in {category_name}",
                "body": f"{len(publications)} new publications in {category_name}",
                "user_id": user_id,
                "category_id": category_id,
                # Schedule for 9:00 AM
                "scheduled_for": (datetime.utcnow().replace(hour=9, minute=0, second=0, microsecond=0) + timedelta(days=1)).isoformat()
            }
            
            supabase.insert_data("notifications", notification_data)
    
    print(f"Scheduled notifications for {len(new_publications)} new publications")


async def send_scheduled_notifications():
    """
    Send scheduled notifications
    This would be called by a scheduled task every few minutes
    """
    from app.db.supabase_client import supabase
    from datetime import datetime
    
    # Get notifications scheduled for now or earlier that haven't been sent
    now = datetime.utcnow()
    
    scheduled_notifications = supabase.fetch_data(
        "notifications", 
        {
            "filters": [
                {"column": "scheduled_for", "operator": "lte", "value": now.isoformat()},
                {"column": "sent_at", "value": None}
            ]
        }
    )
    
    if not scheduled_notifications:
        return
    
    # Group notifications by user
    notifications_by_user = {}
    for notification in scheduled_notifications:
        user_id = notification["user_id"]
        if user_id not in notifications_by_user:
            notifications_by_user[user_id] = []
        notifications_by_user[user_id].append(notification)
    
    # For each user, get devices and send notifications
    for user_id, notifications in notifications_by_user.items():
        # Get user's devices
        devices = supabase.fetch_data(
            "user_devices", 
            {"filters": [
                {"column": "user_id", "value": user_id},
                {"column": "is_active", "value": True}
            ]}
        )
        
        if not devices:
            # Mark notifications as sent even if no devices
            for notification in notifications:
                supabase.update_data(
                    "notifications", 
                    {"sent_at": now.isoformat()}, 
                    "id", 
                    notification["id"]
                )
            continue
        
        # Send notifications to each device
        for device in devices:
            for notification in notifications:
                try:
                    await send_notification(
                        device["device_token"],
                        notification["title"],
                        notification["body"],
                        {
                            "notification_id": notification["id"],
                            "publication_id": notification.get("publication_id"),
                            "category_id": notification.get("category_id")
                        }
                    )
                    
                    # Mark as sent
                    supabase.update_data(
                        "notifications", 
                        {"sent_at": now.isoformat()}, 
                        "id", 
                        notification["id"]
                    )
                except Exception as e:
                    print(f"Failed to send notification {notification['id']} to device {device['id']}: {str(e)}")
    
    print(f"Sent {len(scheduled_notifications)} scheduled notifications")
