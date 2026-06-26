export type ThemeMode = "light" | "dark" | "system";

export type AIModel = "gpt" | "claude" | "gemini" | "grok" | "meta-ai";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: string;
  subscription: string;
  created_at: string;
}

export interface Chat {
  id: string;
  title: string;
  model: AIModel;
  is_pinned: boolean;
  token_count: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  tokens_used: number;
  metadata?: Record<string, unknown>;
  is_liked?: boolean | null;
  created_at: string;
  isStreaming?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_favorite: boolean;
  tags: string[];
  created_at: string;
}

export interface Agent {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color: string;
  is_builtin?: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  file_type: string;
  mime_type?: string;
  size_bytes: number;
  thumbnail_url?: string;
  created_at?: string;
}

export interface Analytics {
  total_chats: number;
  tokens_used: number;
  files_analyzed: number;
  images_generated: number;
  monthly_usage: Array<{ date: string; tokens: number; messages: number }>;
  recent_activity: Array<{ type: string; title: string; date: string }>;
}

export interface UserSettings {
  theme: ThemeMode;
  language: string;
  notifications_enabled: boolean;
  web_search_enabled: boolean;
  reasoning_enabled: boolean;
  deep_research_enabled: boolean;
  default_model: AIModel;
}

export interface ChatInputOptions {
  webSearch: boolean;
  reasoning: boolean;
  deepResearch: boolean;
  model: AIModel;
  agentId?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface PromptSuggestion {
  label: string;
  prompt: string;
  icon: string;
  color: string;
}

export interface ToolItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}
