from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
import google.generativeai as genai

from app.api.auth import get_current_user
from app.core.config import settings
from app.db.supabase_client import supabase

router = APIRouter()

# Configure the Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

# Define the model
model = genai.GenerativeModel('gemini-pro')

# Initialize chat history storage
chat_histories = {}


@router.post("/ask", status_code=status.HTTP_200_OK)
async def ask_question(
    query: Dict[str, Any],
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Ask a question to the chatbot
    """
    if "question" not in query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question is required",
        )
    
    question = query["question"]
    chat_id = query.get("chat_id", "default")
    
    # Create a unique chat ID for this user
    user_chat_id = f"{current_user['id']}_{chat_id}"
    
    # Initialize chat history if it doesn't exist
    if user_chat_id not in chat_histories:
        chat_histories[user_chat_id] = model.start_chat(
            history=[
                {
                    "role": "system",
                    "parts": [
                        "Sen Resmi Gazete uygulaması için bir yardım asistanısın. "
                        "Adın 'Resmi Gazete Asistanı'. "
                        "Görevin kullanıcılara Resmi Gazete, içeriği, yasal düzenlemeler ve "
                        "uygulamanın kullanımı hakkında bilgi vermek. "
                        "Yanıtların kısa, net ve bilgilendirici olmalı. "
                        "Eğer bir soruya cevap veremiyorsan, kullanıcıya nazikçe bilmediğini söyle "
                        "ve yardımcı olabileceğin başka bir konu olup olmadığını sor. "
                        "Siyasi görüş belirtmekten kaçın ve tarafsız kal. "
                        "Resmi Gazete'nin Türkiye Cumhuriyeti'nin resmi yayın organı olduğunu "
                        "ve kanunlar, kararnameler, yönetmelikler, tebliğler gibi resmi belgelerin "
                        "yayınlandığı yer olduğunu hatırla."
                    ]
                }
            ]
        )
    
    chat = chat_histories[user_chat_id]
    
    try:
        # Get relevant publications if available
        relevant_publications = []
        if "search_context" in query and query["search_context"]:
            search_query = query["search_context"]
            
            # Search for relevant publications
            publications = supabase.fetch_data(
                "publications", 
                {
                    "filters": [{"column": "title", "operator": "like", "value": f"%{search_query}%"}],
                    "limit": 5
                }
            )
            
            if publications:
                relevant_publications = [
                    {
                        "title": pub["title"],
                        "date": pub["publication_date"],
                        "snippet": pub["content"][:200] + "..." if len(pub["content"]) > 200 else pub["content"]
                    }
                    for pub in publications
                ]
        
        # Add context to the question if we have relevant publications
        if relevant_publications:
            context = "İlgili Resmi Gazete yayınları:\n"
            for i, pub in enumerate(relevant_publications, 1):
                context += f"{i}. {pub['title']} ({pub['date']}): {pub['snippet']}\n\n"
            
            enhanced_question = f"{context}\n\nKullanıcı sorusu: {question}\n\nYukarıdaki bilgileri kullanarak yanıt ver:"
        else:
            enhanced_question = question
        
        # Generate response
        response = chat.send_message(enhanced_question)
        
        # Store chat history (limit to last 10 messages to save memory)
        if len(chat.history) > 20:
            # Keep the system message and the last 9 exchanges
            system_message = chat.history[0]
            recent_messages = chat.history[-18:]
            chat.history = [system_message] + recent_messages
        
        # Save the chat history to the database
        chat_data = {
            "user_id": current_user["id"],
            "chat_id": chat_id,
            "last_question": question,
            "last_response": response.text,
            "last_interaction": "now()"
        }
        
        # Check if chat history exists in the database
        existing_chat = supabase.fetch_data(
            "chat_histories", 
            {"filters": [
                {"column": "user_id", "value": current_user["id"]},
                {"column": "chat_id", "value": chat_id}
            ]}
        )
        
        if existing_chat and len(existing_chat) > 0:
            supabase.update_data(
                "chat_histories", 
                chat_data, 
                "id", 
                existing_chat[0]["id"]
            )
        else:
            supabase.insert_data("chat_histories", chat_data)
        
        return {
            "response": response.text,
            "chat_id": chat_id,
            "relevant_publications": relevant_publications
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating response: {str(e)}",
        )


@router.get("/history", response_model=List[Dict[str, Any]])
async def get_chat_history(
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Get user's chat history
    """
    chat_history = supabase.fetch_data(
        "chat_histories", 
        {
            "filters": [{"column": "user_id", "value": current_user["id"]}],
            "order": [{"column": "last_interaction", "ascending": False}]
        }
    )
    
    return chat_history or []


@router.delete("/history/{chat_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_chat_history(
    chat_id: str,
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Delete a specific chat history
    """
    # Check if chat history exists and belongs to user
    existing_chat = supabase.fetch_data(
        "chat_histories", 
        {"filters": [
            {"column": "user_id", "value": current_user["id"]},
            {"column": "chat_id", "value": chat_id}
        ]}
    )
    
    if not existing_chat or len(existing_chat) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat history not found",
        )
    
    # Delete from database
    supabase.delete_data("chat_histories", "id", existing_chat[0]["id"])
    
    # Clear from memory
    user_chat_id = f"{current_user['id']}_{chat_id}"
    if user_chat_id in chat_histories:
        del chat_histories[user_chat_id]
    
    return None


@router.delete("/history", status_code=status.HTTP_204_NO_CONTENT)
async def delete_all_chat_history(
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Delete all chat history for the current user
    """
    # Get user's chat histories
    user_chats = supabase.fetch_data(
        "chat_histories", 
        {"filters": [{"column": "user_id", "value": current_user["id"]}]}
    )
    
    if not user_chats:
        return None
    
    # Delete each chat history
    for chat in user_chats:
        supabase.delete_data("chat_histories", "id", chat["id"])
        
        # Clear from memory
        user_chat_id = f"{current_user['id']}_{chat['chat_id']}"
        if user_chat_id in chat_histories:
            del chat_histories[user_chat_id]
    
    return None
