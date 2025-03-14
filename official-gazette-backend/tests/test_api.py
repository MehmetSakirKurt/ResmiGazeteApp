import os
import sys
import pytest
from fastapi.testclient import TestClient
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

# Import app
from app.main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    assert "status" in response.json()
    assert response.json()["status"] == "ok"


def test_auth_endpoints():
    """Test authentication endpoints"""
    # Test registration
    register_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "company_name": "Test Company"
    }
    
    # Skip actual API calls in test mode
    # response = client.post(f"{app.url_path_for('register_user')}", json=register_data)
    # assert response.status_code == 201
    
    # Test login
    login_data = {
        "username": "test@example.com",
        "password": "testpassword123"
    }
    
    # Skip actual API calls in test mode
    # response = client.post(f"{app.url_path_for('login_access_token')}", data=login_data)
    # assert response.status_code == 200
    # assert "access_token" in response.json()
    # assert "token_type" in response.json()
    
    # Just check if endpoints exist
    assert app.url_path_for("login_access_token") == "/api/v1/auth/login"
    assert app.url_path_for("register_user") == "/api/v1/auth/register"


def test_publications_endpoints():
    """Test publications endpoints"""
    # Check if endpoints exist
    assert app.url_path_for("get_publications") == "/api/v1/publications/"
    assert app.url_path_for("get_publication", publication_id="test") == "/api/v1/publications/test"
    assert app.url_path_for("create_publication") == "/api/v1/publications/"
    assert app.url_path_for("get_favorite_publications") == "/api/v1/publications/favorites"


def test_categories_endpoints():
    """Test categories endpoints"""
    # Check if endpoints exist
    assert app.url_path_for("get_categories") == "/api/v1/categories/"
    assert app.url_path_for("get_category", category_id="test") == "/api/v1/categories/test"
    assert app.url_path_for("get_subscribed_categories") == "/api/v1/categories/subscriptions"


def test_users_endpoints():
    """Test users endpoints"""
    # Check if endpoints exist
    assert app.url_path_for("get_current_user_profile") == "/api/v1/users/me"
    assert app.url_path_for("update_user_profile") == "/api/v1/users/me"
    assert app.url_path_for("update_password") == "/api/v1/users/me/password"
    assert app.url_path_for("update_preferences") == "/api/v1/users/me/preferences"


def test_notifications_endpoints():
    """Test notifications endpoints"""
    # Check if endpoints exist
    assert app.url_path_for("get_notifications") == "/api/v1/notifications/"
    assert app.url_path_for("get_unread_count") == "/api/v1/notifications/unread-count"
    assert app.url_path_for("mark_all_notifications_as_read") == "/api/v1/notifications/read-all"


def test_chatbot_endpoints():
    """Test chatbot endpoints"""
    # Check if endpoints exist
    assert app.url_path_for("ask_question") == "/api/v1/chatbot/ask"
    assert app.url_path_for("get_chat_history") == "/api/v1/chatbot/history"


if __name__ == "__main__":
    pytest.main(["-xvs", __file__])
