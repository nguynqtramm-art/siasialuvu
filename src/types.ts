export interface Character {
  id: string;
  name: string;
  tags: string[];
  description: string;
  link: string;
  plot?: string;
  avatarUrl?: string;
  greeting?: string;
  systemPrompt?: string;
  createdAt?: string;
}

export interface PageContent {
  profile: string;
  rules: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface GroundingSource {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  webSearchQueries?: string[];
  searchChunks?: Array<{
    web?: {
      uri?: string;
      title?: string;
    };
  }>;
  groundingSupports?: any[];
}

export interface PlaylistItem {
  id: string;
  title: string;
  url: string;
  addedBy?: 'default' | 'admin';
}

