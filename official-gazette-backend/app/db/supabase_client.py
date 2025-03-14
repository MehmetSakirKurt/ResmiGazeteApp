from supabase import create_client, Client
from app.core.config import settings
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Check if we should use mock implementation
USE_MOCK = not settings.SUPABASE_URL.startswith("https://") or not settings.SUPABASE_KEY

# Import mock implementation if needed
if USE_MOCK:
    from app.db.mock_supabase import mock_supabase
    logger.warning("Using mock Supabase implementation. Data will be stored locally.")

class SupabaseClient:
    """
    Singleton class for managing Supabase connection
    """
    _instance = None
    _client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SupabaseClient, cls).__new__(cls)
            
            if USE_MOCK:
                # Use mock implementation
                cls._client = None
                logger.info("Using mock Supabase implementation")
            else:
                # Use real Supabase client
                try:
                    cls._client = create_client(
                        settings.SUPABASE_URL, 
                        settings.SUPABASE_KEY
                    )
                    logger.info("Connected to Supabase")
                except Exception as e:
                    logger.error(f"Failed to connect to Supabase: {str(e)}")
                    logger.warning("Falling back to mock implementation")
                    # Import mock implementation if not already imported
                    if 'mock_supabase' not in globals():
                        from app.db.mock_supabase import mock_supabase
        
        return cls._instance
    
    @property
    def client(self) -> Client:
        """
        Get Supabase client instance
        """
        return self._client
    
    def get_table(self, table_name: str):
        """
        Get a reference to a table
        """
        if USE_MOCK:
            return mock_supabase.get_table(table_name)
        return self._client.table(table_name)
    
    def fetch_data(self, table_name: str, query=None):
        """
        Fetch data from a table with optional query parameters
        """
        if USE_MOCK:
            return mock_supabase.fetch_data(table_name, query)
            
        table = self.get_table(table_name)
        
        if query:
            # Apply query parameters (filters, sorting, etc.)
            if 'select' in query:
                table = table.select(query['select'])
            
            if 'filters' in query:
                for filter_item in query['filters']:
                    column = filter_item.get('column')
                    operator = filter_item.get('operator', 'eq')
                    value = filter_item.get('value')
                    
                    if column and value is not None:
                        if operator == 'eq':
                            table = table.eq(column, value)
                        elif operator == 'gt':
                            table = table.gt(column, value)
                        elif operator == 'lt':
                            table = table.lt(column, value)
                        elif operator == 'gte':
                            table = table.gte(column, value)
                        elif operator == 'lte':
                            table = table.lte(column, value)
                        elif operator == 'like':
                            table = table.like(column, value)
            
            if 'order' in query:
                for order_item in query['order']:
                    column = order_item.get('column')
                    ascending = order_item.get('ascending', True)
                    
                    if column:
                        if ascending:
                            table = table.order(column)
                        else:
                            table = table.order(column, desc=True)
            
            if 'limit' in query:
                table = table.limit(query['limit'])
                
            if 'offset' in query:
                table = table.offset(query['offset'])
        
        response = table.execute()
        
        # Check for and handle errors
        if hasattr(response, 'error') and response.error:
            raise Exception(f"Supabase query error: {response.error.message}")
            
        return response.data
    
    def insert_data(self, table_name: str, data):
        """
        Insert data into a table
        """
        if USE_MOCK:
            return mock_supabase.insert_data(table_name, data)
            
        table = self.get_table(table_name)
        response = table.insert(data).execute()
        
        # Check for and handle errors
        if hasattr(response, 'error') and response.error:
            raise Exception(f"Supabase insert error: {response.error.message}")
            
        return response.data
    
    def update_data(self, table_name: str, data, match_column, match_value):
        """
        Update data in a table
        """
        if USE_MOCK:
            return mock_supabase.update_data(table_name, data, match_column, match_value)
            
        table = self.get_table(table_name)
        response = table.update(data).eq(match_column, match_value).execute()
        
        # Check for and handle errors
        if hasattr(response, 'error') and response.error:
            raise Exception(f"Supabase update error: {response.error.message}")
            
        return response.data
    
    def delete_data(self, table_name: str, match_column, match_value):
        """
        Delete data from a table
        """
        if USE_MOCK:
            return mock_supabase.delete_data(table_name, match_column, match_value)
            
        table = self.get_table(table_name)
        response = table.delete().eq(match_column, match_value).execute()
        
        # Check for and handle errors
        if hasattr(response, 'error') and response.error:
            raise Exception(f"Supabase delete error: {response.error.message}")
            
        return response.data


# Create a global instance for import and use throughout the application
supabase = SupabaseClient()
