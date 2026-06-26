const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ access_token: string; refresh_token: string }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    register: (email: string, password: string, name: string) =>
      request<{ access_token: string; refresh_token: string }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      }),
    me: (token: string) => request<import("@/types").User>("/auth/me", {}, token),
  },
  chats: {
    list: (token: string) => request<import("@/types").Chat[]>("/chats", {}, token),
    create: (token: string, data: { title?: string; model?: string }) =>
      request<import("@/types").Chat>("/chats", { method: "POST", body: JSON.stringify(data) }, token),
    messages: (token: string, chatId: string) =>
      request<import("@/types").Message[]>(`/chats/${chatId}/messages`, {}, token),
    send: (token: string, chatId: string, content: string, options?: Record<string, unknown>) =>
      request<import("@/types").Message>(
        `/chats/${chatId}/messages`,
        { method: "POST", body: JSON.stringify({ content, ...options }) },
        token,
      ),
    feedback: (token: string, chatId: string, messageId: string, is_liked: boolean | null) =>
      request(`/chats/${chatId}/messages/${messageId}/feedback`, {
        method: "POST",
        body: JSON.stringify({ is_liked }),
      }, token),
    regenerate: (token: string, chatId: string, messageId: string) =>
      request<import("@/types").Message>(
        `/chats/${chatId}/messages/${messageId}/regenerate`,
        { method: "POST" },
        token,
      ),
  },
  projects: {
    list: (token: string) => request<import("@/types").Project[]>("/projects", {}, token),
    create: (token: string, data: { name: string; description?: string }) =>
      request<import("@/types").Project>("/projects", { method: "POST", body: JSON.stringify(data) }, token),
  },
  files: {
    list: (token: string) => request<import("@/types").FileItem[]>("/files", {}, token),
    upload: async (token: string, file: File) => {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_BASE}/files/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) throw new ApiError(res.status, "Upload failed");
      return res.json() as Promise<import("@/types").FileItem>;
    },
  },
  agents: {
    list: () => request<import("@/types").Agent[]>("/agents"),
  },
  analytics: {
    dashboard: (token: string) => request<import("@/types").Analytics>("/analytics/dashboard", {}, token),
  },
  settings: {
    get: (token: string) => request<import("@/types").UserSettings>("/settings", {}, token),
    update: (token: string, data: Partial<import("@/types").UserSettings>) =>
      request("/settings", { method: "PATCH", body: JSON.stringify(data) }, token),
  },
  guest: {
    send: (content: string, model: string = "meta-ai") =>
      request<{ role: string; content: string; tokens_used: number }>("/chats/guest", {
        method: "POST",
        body: JSON.stringify({ content, model }),
      }),
  },
};

export function createChatWebSocket(chatId: string, token?: string | null): WebSocket {
  const wsBase = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1").replace(/\/$/, "");
  return new WebSocket(`${wsBase}/chats/${chatId}/stream`);
}

export function createGuestWebSocket(): WebSocket {
  const wsBase = (process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/api/v1").replace(/\/$/, "");
  return new WebSocket(`${wsBase}/chats/guest/stream`);
}

export { ApiError };
