export interface User {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: string;
  lastLoginAt: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  subscribedCategories: string[]; // Array of category IDs
  notificationsEnabled: boolean;
  notificationTime: string; // Time of day for notifications (e.g., "09:00")
}

export interface GazettePublication {
  id: string;
  title: string;
  content: string;
  summary: string;
  publishDate: string;
  categories: string[]; // Array of category IDs
  url: string; // Original source URL
  isFavorite?: boolean; // Used on client-side
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  data: {
    type: 'publication' | 'system';
    publicationId?: string;
  };
  read: boolean;
  createdAt: string;
}
