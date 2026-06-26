import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AIModel, Chat, ChatInputOptions, Message, ThemeMode, User } from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setAuth: (user, accessToken, refreshToken) => set({ user, accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: "zaara-auth" },
  ),
);

interface ChatState {
  chats: Chat[];
  activeChatId: string | null;
  messages: Message[];
  isStreaming: boolean;
  isLoading: boolean;
  inputOptions: ChatInputOptions;
  sidebarOpen: boolean;
  rightPanelOpen: boolean;
  setChats: (chats: Chat[]) => void;
  setActiveChat: (id: string | null) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  appendStreamContent: (id: string, content: string) => void;
  setStreaming: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setInputOptions: (opts: Partial<ChatInputOptions>) => void;
  toggleSidebar: () => void;
  toggleRightPanel: () => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  activeChatId: null,
  messages: [],
  isStreaming: false,
  isLoading: false,
  inputOptions: {
    webSearch: false,
    reasoning: false,
    deepResearch: false,
    model: "meta-ai",
  },
  sidebarOpen: true,
  rightPanelOpen: false,
  setChats: (chats) => set({ chats }),
  setActiveChat: (id) => set({ activeChatId: id }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  updateMessage: (id, updates) =>
    set((s) => ({ messages: s.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)) })),
  appendStreamContent: (id, content) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + content } : m,
      ),
    })),
  setStreaming: (v) => set({ isStreaming: v }),
  setLoading: (v) => set({ isLoading: v }),
  setInputOptions: (opts) => set((s) => ({ inputOptions: { ...s.inputOptions, ...opts } })),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  clearMessages: () => set({ messages: [] }),
}));

interface UIState {
  theme: ThemeMode;
  highContrast: boolean;
  voiceActive: boolean;
  setTheme: (theme: ThemeMode) => void;
  setHighContrast: (v: boolean) => void;
  setVoiceActive: (v: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      theme: "system",
      highContrast: false,
      voiceActive: false,
      setTheme: (theme) => set({ theme }),
      setHighContrast: (v) => set({ highContrast: v }),
      setVoiceActive: (v) => set({ voiceActive: v }),
    }),
    { name: "zaara-ui" },
  ),
);
