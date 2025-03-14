import asyncio
import logging
import re
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

import aiohttp
from bs4 import BeautifulSoup
from fastapi import HTTPException, status

from app.db.supabase_client import supabase
from app.models.publication import PublicationCreate
from app.services.categorization import categorize_publication

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
GAZETTE_BASE_URL = "https://www.resmigazete.gov.tr"
GAZETTE_ARCHIVE_URL = f"{GAZETTE_BASE_URL}/arsiv"


class GazetteScraper:
    """
    Service for scraping Official Gazette publications
    """
    
    @staticmethod
    async def fetch_page(url: str) -> str:
        """
        Fetch HTML content from a URL
        """
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status != 200:
                        logger.error(f"Failed to fetch {url}: HTTP {response.status}")
                        return ""
                    return await response.text()
        except Exception as e:
            logger.error(f"Error fetching {url}: {str(e)}")
            return ""
    
    @staticmethod
    async def parse_gazette_list(html_content: str) -> List[Dict[str, Any]]:
        """
        Parse the gazette list page to extract publication links and dates
        """
        if not html_content:
            return []
        
        soup = BeautifulSoup(html_content, 'html.parser')
        publications = []
        
        # Find all gazette links on the page
        # This selector might need adjustment based on the actual website structure
        gazette_items = soup.select('.gazette-item') or soup.select('.archive-item') or soup.select('a[href*="mukerrer"]')
        
        if not gazette_items:
            # Fallback to a more generic approach if specific selectors don't work
            gazette_items = [a for a in soup.find_all('a') if '/mukerrer/' in a.get('href', '') or '/eskiler/' in a.get('href', '')]
        
        for item in gazette_items:
            try:
                link = item.get('href', '')
                if not link.startswith('http'):
                    link = f"{GAZETTE_BASE_URL}{link}"
                
                # Extract date from link or text
                date_text = item.get_text().strip()
                date_match = re.search(r'(\d{1,2})\.(\d{1,2})\.(\d{4})', date_text)
                
                if date_match:
                    day, month, year = date_match.groups()
                    publication_date = datetime(int(year), int(month), int(day))
                else:
                    # Try to extract date from URL
                    date_match = re.search(r'(\d{4})(\d{2})(\d{2})', link)
                    if date_match:
                        year, month, day = date_match.groups()
                        publication_date = datetime(int(year), int(month), int(day))
                    else:
                        # Use current date as fallback
                        publication_date = datetime.now()
                
                publications.append({
                    "url": link,
                    "publication_date": publication_date,
                    "title": f"Resmi Gazete - {publication_date.strftime('%d.%m.%Y')}"
                })
            except Exception as e:
                logger.error(f"Error parsing gazette item: {str(e)}")
        
        return publications
    
    @staticmethod
    async def parse_gazette_content(html_content: str, url: str) -> str:
        """
        Parse the gazette detail page to extract content
        """
        if not html_content:
            return ""
        
        soup = BeautifulSoup(html_content, 'html.parser')
        
        # Try to find the main content area
        # This selector might need adjustment based on the actual website structure
        content_area = soup.select_one('.gazette-content') or soup.select_one('#content') or soup.select_one('main')
        
        if content_area:
            return content_area.get_text(separator='\n', strip=True)
        else:
            # Fallback to extracting all paragraph text
            paragraphs = soup.find_all('p')
            return '\n\n'.join([p.get_text(strip=True) for p in paragraphs if p.get_text(strip=True)])
    
    @classmethod
    async def fetch_recent_gazettes(cls, days: int = 7) -> List[Dict[str, Any]]:
        """
        Fetch recent gazettes from the archive
        """
        html_content = await cls.fetch_page(GAZETTE_ARCHIVE_URL)
        if not html_content:
            logger.error("Failed to fetch gazette archive page")
            return []
        
        publications = await cls.parse_gazette_list(html_content)
        
        # Filter by date if needed
        if days > 0:
            cutoff_date = datetime.now() - timedelta(days=days)
            publications = [p for p in publications if p["publication_date"] >= cutoff_date]
        
        return publications
    
    @classmethod
    async def fetch_gazette_details(cls, publications: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Fetch details for each gazette publication
        """
        detailed_publications = []
        
        for publication in publications:
            html_content = await cls.fetch_page(publication["url"])
            if html_content:
                content = await cls.parse_gazette_content(html_content, publication["url"])
                publication["content"] = content
                detailed_publications.append(publication)
            else:
                logger.error(f"Failed to fetch content for {publication['url']}")
        
        return detailed_publications
    
    @classmethod
    async def save_publications_to_db(cls, publications: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Save publications to the database
        """
        saved_publications = []
        
        for pub in publications:
            try:
                # Check if publication already exists
                existing = supabase.fetch_data(
                    "publications",
                    {"filters": [{"column": "url", "value": pub["url"]}]}
                )
                
                if existing and len(existing) > 0:
                    logger.info(f"Publication already exists: {pub['url']}")
                    saved_publications.append(existing[0])
                    continue
                
                # Categorize the publication
                try:
                    category_ids = await categorize_publication(pub["title"], pub["content"])
                except Exception as e:
                    logger.error(f"Categorization error: {str(e)}")
                    category_ids = []
                
                # Create publication object
                publication_data = PublicationCreate(
                    title=pub["title"],
                    publication_date=pub["publication_date"],
                    content=pub["content"],
                    url=pub["url"],
                    category_ids=category_ids
                )
                
                # Save to database
                new_publication = supabase.insert_data("publications", publication_data.dict())
                
                if new_publication and len(new_publication) > 0:
                    saved_publications.append(new_publication[0])
                    logger.info(f"Saved publication: {pub['title']}")
                else:
                    logger.error(f"Failed to save publication: {pub['title']}")
            
            except Exception as e:
                logger.error(f"Error saving publication: {str(e)}")
        
        return saved_publications
    
    @classmethod
    async def fetch_and_save_recent_gazettes(cls, days: int = 7) -> List[Dict[str, Any]]:
        """
        Fetch recent gazettes and save them to the database
        """
        try:
            # Fetch recent publications
            publications = await cls.fetch_recent_gazettes(days)
            
            if not publications:
                logger.warning("No recent publications found")
                return []
            
            # Fetch details for each publication
            detailed_publications = await cls.fetch_gazette_details(publications)
            
            if not detailed_publications:
                logger.warning("Failed to fetch details for any publications")
                return []
            
            # Save publications to database
            saved_publications = await cls.save_publications_to_db(detailed_publications)
            
            return saved_publications
        
        except Exception as e:
            logger.error(f"Error in fetch_and_save_recent_gazettes: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to fetch and save recent gazettes: {str(e)}"
            )


# Create a function to run the scraper
async def run_gazette_scraper(days: int = 7) -> List[Dict[str, Any]]:
    """
    Run the gazette scraper to fetch and save recent publications
    """
    return await GazetteScraper.fetch_and_save_recent_gazettes(days)
