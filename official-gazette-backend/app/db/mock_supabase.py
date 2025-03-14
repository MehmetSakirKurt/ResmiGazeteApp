import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Any, Optional

class MockSupabaseClient:
    """
    Mock implementation of Supabase client for development without actual Supabase credentials
    """
    _instance = None
    _data = {}
    _data_file = os.path.join(os.path.dirname(__file__), "mock_data.json")
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MockSupabaseClient, cls).__new__(cls)
            cls._load_data()
        return cls._instance
    
    @classmethod
    def _load_data(cls):
        """Load mock data from file if it exists"""
        if os.path.exists(cls._data_file):
            try:
                with open(cls._data_file, 'r', encoding='utf-8') as f:
                    cls._data = json.load(f)
            except Exception as e:
                print(f"Error loading mock data: {str(e)}")
                cls._initialize_data()
        else:
            cls._initialize_data()
    
    @classmethod
    def _save_data(cls):
        """Save mock data to file"""
        try:
            with open(cls._data_file, 'w', encoding='utf-8') as f:
                json.dump(cls._data, f, ensure_ascii=False, indent=2, default=str)
        except Exception as e:
            print(f"Error saving mock data: {str(e)}")
    
    @classmethod
    def _initialize_data(cls):
        """Initialize empty data structure"""
        cls._data = {
            "users": [],
            "publications": [],
            "categories": [
                {
                    "id": str(uuid.uuid4()),
                    "name": "Ekonomi",
                    "description": "Ekonomi ile ilgili resmi gazete yayınları",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Eğitim",
                    "description": "Eğitim ile ilgili resmi gazete yayınları",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Sağlık",
                    "description": "Sağlık ile ilgili resmi gazete yayınları",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "name": "Hukuk",
                    "description": "Hukuk ve adalet ile ilgili resmi gazete yayınları",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
            ],
            "favorites": [],
            "notifications": []
        }
        cls._save_data()
    
    def get_table(self, table_name: str):
        """Get a reference to a table (for compatibility with Supabase API)"""
        return MockTable(self, table_name)
    
    def fetch_data(self, table_name: str, query=None):
        """
        Fetch data from a table with optional query parameters
        """
        if table_name not in self._data:
            self._data[table_name] = []
            self._save_data()
            return []
        
        result = self._data[table_name].copy()
        
        if query:
            # Apply filters
            if 'filters' in query:
                for filter_item in query['filters']:
                    column = filter_item.get('column')
                    operator = filter_item.get('operator', 'eq')
                    value = filter_item.get('value')
                    
                    if column and value is not None:
                        filtered_result = []
                        for item in result:
                            if operator == 'eq' and item.get(column) == value:
                                filtered_result.append(item)
                            elif operator == 'gt' and item.get(column) > value:
                                filtered_result.append(item)
                            elif operator == 'lt' and item.get(column) < value:
                                filtered_result.append(item)
                            elif operator == 'gte' and item.get(column) >= value:
                                filtered_result.append(item)
                            elif operator == 'lte' and item.get(column) <= value:
                                filtered_result.append(item)
                            elif operator == 'like' and isinstance(item.get(column), str) and value.replace('%', '') in item.get(column):
                                filtered_result.append(item)
                        result = filtered_result
            
            # Apply ordering
            if 'order' in query:
                for order_item in query['order']:
                    column = order_item.get('column')
                    ascending = order_item.get('ascending', True)
                    
                    if column:
                        result.sort(key=lambda x: x.get(column, ''), reverse=not ascending)
            
            # Apply limit and offset
            if 'offset' in query:
                offset = query['offset']
                result = result[offset:]
            
            if 'limit' in query:
                limit = query['limit']
                result = result[:limit]
        
        return result
    
    def insert_data(self, table_name: str, data):
        """
        Insert data into a table
        """
        if table_name not in self._data:
            self._data[table_name] = []
        
        # Handle single item or list
        items_to_insert = data if isinstance(data, list) else [data]
        inserted_items = []
        
        for item in items_to_insert:
            # Convert to dict if needed
            if hasattr(item, 'dict'):
                item = item.dict()
            
            # Generate ID if not provided
            if 'id' not in item or not item['id']:
                item['id'] = str(uuid.uuid4())
            
            # Add timestamps if not provided
            if 'created_at' not in item:
                item['created_at'] = datetime.now().isoformat()
            if 'updated_at' not in item:
                item['updated_at'] = datetime.now().isoformat()
            
            self._data[table_name].append(item)
            inserted_items.append(item)
        
        self._save_data()
        return inserted_items
    
    def update_data(self, table_name: str, data, match_column, match_value):
        """
        Update data in a table
        """
        if table_name not in self._data:
            return []
        
        # Convert to dict if needed
        if hasattr(data, 'dict'):
            data = data.dict()
        
        # Remove None values
        data = {k: v for k, v in data.items() if v is not None}
        
        # Add updated_at timestamp
        if 'updated_at' not in data:
            data['updated_at'] = datetime.now().isoformat()
        
        updated_items = []
        for i, item in enumerate(self._data[table_name]):
            if item.get(match_column) == match_value:
                # Update item
                self._data[table_name][i] = {**item, **data}
                updated_items.append(self._data[table_name][i])
        
        self._save_data()
        return updated_items
    
    def delete_data(self, table_name: str, match_column, match_value):
        """
        Delete data from a table
        """
        if table_name not in self._data:
            return []
        
        deleted_items = [item for item in self._data[table_name] if item.get(match_column) == match_value]
        self._data[table_name] = [item for item in self._data[table_name] if item.get(match_column) != match_value]
        self._save_data()
        return deleted_items


class MockTable:
    """Mock table for chaining query methods"""
    
    def __init__(self, client, table_name):
        self.client = client
        self.table_name = table_name
        self._filters = []
        self._order = []
        self._limit = None
        self._offset = None
        self._select = None
    
    def select(self, columns):
        """Select specific columns"""
        self._select = columns
        return self
    
    def eq(self, column, value):
        """Equal filter"""
        self._filters.append({"column": column, "operator": "eq", "value": value})
        return self
    
    def gt(self, column, value):
        """Greater than filter"""
        self._filters.append({"column": column, "operator": "gt", "value": value})
        return self
    
    def lt(self, column, value):
        """Less than filter"""
        self._filters.append({"column": column, "operator": "lt", "value": value})
        return self
    
    def gte(self, column, value):
        """Greater than or equal filter"""
        self._filters.append({"column": column, "operator": "gte", "value": value})
        return self
    
    def lte(self, column, value):
        """Less than or equal filter"""
        self._filters.append({"column": column, "operator": "lte", "value": value})
        return self
    
    def like(self, column, value):
        """Like filter"""
        self._filters.append({"column": column, "operator": "like", "value": value})
        return self
    
    def order(self, column, desc=False):
        """Order results"""
        self._order.append({"column": column, "ascending": not desc})
        return self
    
    def limit(self, limit):
        """Limit results"""
        self._limit = limit
        return self
    
    def offset(self, offset):
        """Offset results"""
        self._offset = offset
        return self
    
    def insert(self, data):
        """Insert data"""
        return MockInsert(self.client, self.table_name, data)
    
    def update(self, data):
        """Update data"""
        return MockUpdate(self.client, self.table_name, data)
    
    def delete(self):
        """Delete data"""
        return MockDelete(self.client, self.table_name)
    
    def execute(self):
        """Execute the query"""
        query = {}
        
        if self._filters:
            query["filters"] = self._filters
        
        if self._order:
            query["order"] = self._order
        
        if self._limit is not None:
            query["limit"] = self._limit
        
        if self._offset is not None:
            query["offset"] = self._offset
        
        if self._select is not None:
            query["select"] = self._select
        
        result = self.client.fetch_data(self.table_name, query)
        return MockResponse(result)


class MockInsert:
    """Mock insert operation"""
    
    def __init__(self, client, table_name, data):
        self.client = client
        self.table_name = table_name
        self.data = data
    
    def execute(self):
        """Execute the insert operation"""
        result = self.client.insert_data(self.table_name, self.data)
        return MockResponse(result)


class MockUpdate:
    """Mock update operation"""
    
    def __init__(self, client, table_name, data):
        self.client = client
        self.table_name = table_name
        self.data = data
        self._match_column = None
        self._match_value = None
    
    def eq(self, column, value):
        """Equal filter for update"""
        self._match_column = column
        self._match_value = value
        return self
    
    def execute(self):
        """Execute the update operation"""
        if not self._match_column or self._match_value is None:
            return MockResponse([])
        
        result = self.client.update_data(self.table_name, self.data, self._match_column, self._match_value)
        return MockResponse(result)


class MockDelete:
    """Mock delete operation"""
    
    def __init__(self, client, table_name):
        self.client = client
        self.table_name = table_name
        self._match_column = None
        self._match_value = None
    
    def eq(self, column, value):
        """Equal filter for delete"""
        self._match_column = column
        self._match_value = value
        return self
    
    def execute(self):
        """Execute the delete operation"""
        if not self._match_column or self._match_value is None:
            return MockResponse([])
        
        result = self.client.delete_data(self.table_name, self._match_column, self._match_value)
        return MockResponse(result)


class MockResponse:
    """Mock response object"""
    
    def __init__(self, data):
        self.data = data
        self.error = None


# Create a global instance for import and use throughout the application
mock_supabase = MockSupabaseClient()
