import json
from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import settings
from app.db.supabase_client import supabase

# Configure the Gemini API
genai.configure(api_key=settings.GEMINI_API_KEY)

# Define the model
model = genai.GenerativeModel('gemini-pro')


async def categorize_publication(title: str, content: str) -> List[str]:
    """
    Categorize a publication using Gemini API
    
    Args:
        title: Publication title
        content: Publication content
        
    Returns:
        List of category IDs
    """
    # Get all available categories
    categories = supabase.fetch_data("categories", {})
    
    if not categories:
        return []
    
    # Create a list of category names and IDs
    category_map = {category["name"]: category["id"] for category in categories}
    
    # Create prompt for Gemini
    prompt = f"""
    Resmi Gazete yayını kategorilendirme:
    
    Başlık: {title}
    
    İçerik: {content[:2000]}...  # Limit content length to avoid token limits
    
    Mevcut kategoriler:
    {', '.join(category_map.keys())}
    
    Lütfen bu yayını yukarıdaki kategorilerden en uygun olanlara atayın. 
    Yayın içeriğine göre 1-3 kategori seçin.
    Yanıtınızı sadece kategori isimleri listesi olarak verin, başka açıklama eklemeyin.
    Örnek: ["Ekonomi", "Vergi"]
    """
    
    try:
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Parse response to extract categories
        response_text = response.text.strip()
        
        # Handle different response formats
        if response_text.startswith('[') and response_text.endswith(']'):
            # Try to parse as JSON
            try:
                categories_list = json.loads(response_text)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract manually
                categories_list = [
                    cat.strip(' "\'') 
                    for cat in response_text.strip('[]').split(',')
                ]
        else:
            # Split by commas or newlines
            categories_list = [
                cat.strip(' "\'') 
                for cat in response_text.replace('\n', ',').split(',')
            ]
        
        # Map category names to IDs
        category_ids = []
        for cat_name in categories_list:
            if cat_name in category_map:
                category_ids.append(category_map[cat_name])
        
        return category_ids
    except Exception as e:
        print(f"Categorization error: {str(e)}")
        # Return empty list on error
        return []


async def recategorize_publications(limit: int = 100) -> Dict[str, Any]:
    """
    Recategorize publications that have no categories
    
    Args:
        limit: Maximum number of publications to process
        
    Returns:
        Dict with results information
    """
    # Get publications with no categories
    uncategorized_publications = supabase.fetch_data(
        "publications", 
        {
            "filters": [{"column": "category_ids", "value": []}],
            "limit": limit
        }
    )
    
    if not uncategorized_publications:
        return {"processed": 0, "categorized": 0}
    
    categorized_count = 0
    
    for publication in uncategorized_publications:
        try:
            # Categorize publication
            category_ids = await categorize_publication(
                publication["title"], 
                publication["content"]
            )
            
            if category_ids:
                # Update publication with new categories
                supabase.update_data(
                    "publications", 
                    {"category_ids": category_ids}, 
                    "id", 
                    publication["id"]
                )
                categorized_count += 1
        except Exception as e:
            print(f"Error recategorizing publication {publication['id']}: {str(e)}")
    
    return {
        "processed": len(uncategorized_publications),
        "categorized": categorized_count
    }


async def suggest_new_categories(min_publications: int = 10) -> List[str]:
    """
    Analyze uncategorized publications and suggest new categories
    
    Args:
        min_publications: Minimum number of publications to analyze
        
    Returns:
        List of suggested category names
    """
    # Get uncategorized publications
    uncategorized_publications = supabase.fetch_data(
        "publications", 
        {
            "filters": [{"column": "category_ids", "value": []}],
            "limit": min_publications
        }
    )
    
    if not uncategorized_publications or len(uncategorized_publications) < min_publications:
        return []
    
    # Extract titles and snippets of content
    publication_data = []
    for pub in uncategorized_publications:
        publication_data.append({
            "title": pub["title"],
            "content_snippet": pub["content"][:500] if pub["content"] else ""
        })
    
    # Get existing categories
    existing_categories = supabase.fetch_data("categories", {})
    existing_category_names = [cat["name"] for cat in existing_categories] if existing_categories else []
    
    # Create prompt for Gemini
    prompt = f"""
    Resmi Gazete için yeni kategori önerileri:
    
    Aşağıdaki kategorilendirilememiş yayınları inceleyin:
    {json.dumps(publication_data, indent=2, ensure_ascii=False)}
    
    Mevcut kategoriler:
    {', '.join(existing_category_names)}
    
    Lütfen bu yayınları kategorilendirmek için 3-5 yeni kategori önerisi yapın.
    Önerdiğiniz kategoriler mevcut kategorilerle çakışmamalı ve Resmi Gazete yayınları için anlamlı olmalıdır.
    Yanıtınızı sadece kategori isimleri listesi olarak verin, başka açıklama eklemeyin.
    Örnek: ["Kategori1", "Kategori2", "Kategori3"]
    """
    
    try:
        # Generate response from Gemini
        response = model.generate_content(prompt)
        
        # Parse response to extract categories
        response_text = response.text.strip()
        
        # Handle different response formats
        if response_text.startswith('[') and response_text.endswith(']'):
            # Try to parse as JSON
            try:
                suggested_categories = json.loads(response_text)
            except json.JSONDecodeError:
                # If JSON parsing fails, try to extract manually
                suggested_categories = [
                    cat.strip(' "\'') 
                    for cat in response_text.strip('[]').split(',')
                ]
        else:
            # Split by commas or newlines
            suggested_categories = [
                cat.strip(' "\'') 
                for cat in response_text.replace('\n', ',').split(',')
            ]
        
        return suggested_categories
    except Exception as e:
        print(f"Category suggestion error: {str(e)}")
        return []
