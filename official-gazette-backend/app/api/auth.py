from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel

from app.core.config import settings
from app.core.security import create_access_token, verify_password
from app.db.supabase_client import supabase

router = APIRouter()

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: str = None


async def get_current_user(token: str = Depends(oauth2_scheme)):
    """
    Validate token and return current user
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        # Get user from database
        user_data = supabase.fetch_data(
            "users", 
            {"filters": [{"column": "id", "value": user_id}]}
        )
        
        if not user_data or len(user_data) == 0:
            raise credentials_exception
            
        return user_data[0]
        
    except JWTError:
        raise credentials_exception


@router.post("/login", response_model=Token)
async def login_access_token(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # Get user by email
    user_data = supabase.fetch_data(
        "users", 
        {"filters": [{"column": "email", "value": form_data.username}]}
    )
    
    if not user_data or len(user_data) == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = user_data[0]
    
    # Verify password
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        user["id"], expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/register", response_model=Token)
async def register_user(user_create: dict) -> Any:
    """
    Register a new user and return access token
    """
    # Check if email already exists
    existing_user = supabase.fetch_data(
        "users", 
        {"filters": [{"column": "email", "value": user_create["email"]}]}
    )
    
    if existing_user and len(existing_user) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    # Create user in database
    from app.core.security import get_password_hash
    
    # Hash the password
    hashed_password = get_password_hash(user_create["password"])
    
    # Prepare user data for insertion
    user_data = {
        "email": user_create["email"],
        "hashed_password": hashed_password,
        "company_name": user_create.get("company_name", ""),
        "is_active": True,
        "is_superuser": False,
    }
    
    # Insert user into database
    new_user = supabase.insert_data("users", user_data)
    
    if not new_user or len(new_user) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        new_user[0]["id"], expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/password-reset", status_code=status.HTTP_200_OK)
async def reset_password(email: str) -> Any:
    """
    Send password reset email to user
    """
    # Check if user exists
    user_data = supabase.fetch_data(
        "users", 
        {"filters": [{"column": "email", "value": email}]}
    )
    
    if not user_data or len(user_data) == 0:
        # Don't reveal that the user doesn't exist
        return {"message": "If the email exists, a password reset link has been sent"}
    
    # TODO: Implement actual password reset email sending
    # For now, just return success message
    
    return {"message": "If the email exists, a password reset link has been sent"}


@router.get("/me", status_code=status.HTTP_200_OK)
async def get_me(current_user = Depends(get_current_user)) -> Any:
    """
    Get current user information
    """
    # Remove sensitive information
    if "hashed_password" in current_user:
        del current_user["hashed_password"]
    
    return current_user
