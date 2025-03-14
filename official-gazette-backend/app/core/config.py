import os
from typing import Any, Dict, List, Optional
from pydantic import BaseSettings, validator
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API settings
    API_V1_STR: str = "/api"
    PROJECT_NAME: str = "Official Gazette API"
    SECRET_KEY: str = os.getenv("API_SECRET_KEY", "your_default_secret_key_change_in_production")
    ALGORITHM: str = os.getenv("API_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = ["*"]
    
    # Supabase settings
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    
    # Gemini API settings
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Firebase settings
    FIREBASE_CREDENTIALS_PATH: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    
    # Notification settings
    NOTIFICATION_PROCESSING_TIME: str = "02:00"  # 2 AM for data processing
    NOTIFICATION_SENDING_TIME: str = "09:00"     # 9 AM for notification delivery
    
    # API rate limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # Performance targets
    TARGET_RESPONSE_TIME_MS: int = 200
    
    # Validation and data processing
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Any) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        if isinstance(v, (list, str)):
            return v
        raise ValueError(v)
    
    # Database configuration helpers
    def get_supabase_config(self) -> Dict[str, str]:
        return {
            "url": self.SUPABASE_URL,
            "key": self.SUPABASE_KEY,
        }
        
    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
