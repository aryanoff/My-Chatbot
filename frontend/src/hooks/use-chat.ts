"use client";

import { useCallback, useEffect, useRef } from "react";
import { useAuthStore, useChatStore } from "@/store";
import { api, createChatWebSocket, createGuestWebSocket } from "@/services/api";
import type { Message } from "@/types";

export function useChat() {
  const { accessToken } = useAuthStore();
  const {
    activeChatId,
    messages,
    inputOptions,
    setChats,
    setActiveChat,
    setMessages,
    addMessage,
    updateMessage,
    appendStreamContent,
    setStreaming,
    setLoading,
    clearMessages,
  } = useChatStore();

  const wsRef = useRef<WebSocket | null>(null);

  const loadChats = useCallback(async () => {
    if (!accessToken) return;
    try {
      const chats = await api.chats.list(accessToken);
      setChats(chats);
    } catch {
      /* not logged in or server error — ignore */
    }
  }, [accessToken, setChats]);

  const loadMessages = useCallback(
    async (chatId: string) => {
      if (!accessToken) return;
      setLoading(true);
      try {
        const msgs = await api.chats.messages(accessToken, chatId);
        setMessages(msgs);
      } finally {
        setLoading(false);
      }
    },
    [accessToken, setLoading, setMessages],
  );

  const createChat = useCallback(async () => {
    if (!accessToken) return null;
    const chat = await api.chats.create(accessToken, { model: inputOptions.model });
    setChats([chat, ...useChatStore.getState().chats]);
    setActiveChat(chat.id);
    clearMessages();
    return chat;
  }, [accessToken, inputOptions.model, setChats, setActiveChat, clearMessages]);

  // ── Guest mode (no login required) ──
  const sendGuestMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const tempUserMsg: Message = {
        id: `temp-${Date.now()}`,
        chat_id: "guest",
        role: "user",
        content,
        tokens_used: 0,
        created_at: new Date().toISOString(),
      };
      addMessage(tempUserMsg);

      const tempAiId = `stream-${Date.now()}`;
      addMessage({
        id: tempAiId,
        chat_id: "guest",
        role: "assistant",
        content: "",
        tokens_used: 0,
        created_at: new Date().toISOString(),
        isStreaming: true,
      });

      setStreaming(true);

      try {
        const ws = createGuestWebSocket();
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              content,
              model: inputOptions.model,
            }),
          );
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "chunk") {
              appendStreamContent(tempAiId, data.content);
            } else if (data.type === "done") {
              updateMessage(tempAiId, {
                content: data.message.content,
                isStreaming: false,
              });
              setStreaming(false);
              ws.close();
            } else if (data.type === "error") {
              updateMessage(tempAiId, {
                content: `Error: ${data.error}`,
                isStreaming: false,
              });
              setStreaming(false);
            }
          } catch {
            /* malformed message */
          }
        };

        ws.onerror = async () => {
          // WebSocket failed — fall back to HTTP
          try {
            const response = await api.guest.send(content, inputOptions.model);
            updateMessage(tempAiId, {
              content: response.content,
              isStreaming: false,
            });
          } catch (err: any) {
            updateMessage(tempAiId, {
              content: `Error: ${err?.message || "Could not reach server"}`,
              isStreaming: false,
            });
          }
          setStreaming(false);
        };

        ws.onclose = () => {
          setStreaming(false);
        };
      } catch {
        // Complete fallback to HTTP POST
        try {
          const response = await api.guest.send(content, inputOptions.model);
          updateMessage(tempAiId, {
            content: response.content,
            isStreaming: false,
          });
        } catch (err: any) {
          updateMessage(tempAiId, {
            content: `Error: ${err?.message || "Could not reach server"}`,
            isStreaming: false,
          });
        }
        setStreaming(false);
      }
    },
    [inputOptions.model, addMessage, appendStreamContent, updateMessage, setStreaming],
  );

  // ── Authenticated mode ──
  const sendAuthMessage = useCallback(
    async (content: string) => {
      if (!accessToken || !content.trim()) return;

      let chatId = activeChatId;
      if (!chatId) {
        const chat = await createChat();
        if (!chat) return;
        chatId = chat.id;
      }

      const tempUserMsg: Message = {
        id: `temp-${Date.now()}`,
        chat_id: chatId,
        role: "user",
        content,
        tokens_used: 0,
        created_at: new Date().toISOString(),
      };
      addMessage(tempUserMsg);

      const tempAiId = `stream-${Date.now()}`;
      addMessage({
        id: tempAiId,
        chat_id: chatId,
        role: "assistant",
        content: "",
        tokens_used: 0,
        created_at: new Date().toISOString(),
        isStreaming: true,
      });

      setStreaming(true);

      try {
        const ws = createChatWebSocket(chatId);
        wsRef.current = ws;

        ws.onopen = () => {
          ws.send(
            JSON.stringify({
              token: accessToken,
              content,
              model: inputOptions.model,
              web_search: inputOptions.webSearch,
              reasoning: inputOptions.reasoning,
              deep_research: inputOptions.deepResearch,
            }),
          );
        };

        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.type === "chunk") {
            appendStreamContent(tempAiId, data.content);
          } else if (data.type === "done") {
            updateMessage(tempAiId, {
              id: data.message.id,
              content: data.message.content,
              isStreaming: false,
            });
            setStreaming(false);
            ws.close();
          } else if (data.type === "error") {
            updateMessage(tempAiId, {
              content: `Error: ${data.error}`,
              isStreaming: false,
            });
            setStreaming(false);
          }
        };

        ws.onerror = async () => {
          try {
            const response = await api.chats.send(accessToken, chatId, content, {
              model: inputOptions.model,
              web_search: inputOptions.webSearch,
              reasoning: inputOptions.reasoning,
              deep_research: inputOptions.deepResearch,
            });
            updateMessage(tempAiId, { ...response, isStreaming: false });
          } catch (err: any) {
            updateMessage(tempAiId, {
              content: `Error: ${err?.message || "Request failed"}`,
              isStreaming: false,
            });
          }
          setStreaming(false);
        };
      } catch {
        try {
          const response = await api.chats.send(accessToken, chatId, content, {
            model: inputOptions.model,
          });
          updateMessage(tempAiId, { ...response, isStreaming: false });
        } catch (err: any) {
          updateMessage(tempAiId, {
            content: `Error: ${err?.message || "Request failed"}`,
            isStreaming: false,
          });
        }
        setStreaming(false);
      }
    },
    [
      accessToken,
      activeChatId,
      inputOptions,
      addMessage,
      appendStreamContent,
      updateMessage,
      setStreaming,
      createChat,
    ],
  );

  // Pick the right sender based on auth state
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const onboarded = localStorage.getItem("zaara_onboarded");
      if (!onboarded) {
        localStorage.setItem("zaara_onboarded", "true");
        
        // Add user message
        addMessage({
          id: `temp-${Date.now()}`,
          chat_id: activeChatId || "guest",
          role: "user",
          content,
          tokens_used: 0,
          created_at: new Date().toISOString(),
        });

        // Simulate typing delay for onboarding response
        setTimeout(() => {
          addMessage({
            id: `onboarding-${Date.now()}`,
            chat_id: activeChatId || "guest",
            role: "assistant",
            content: "Welcome! I am Zaara Ai.\n\nI was developed by Aryan Singh Rajpoot—a BSc Computer Science student, Full-Stack Developer, and the creative force behind Mr Rajpoot Studio. Aryan specializes in bridging the gap between cutting-edge AI technology and seamless digital experiences, bringing a unique blend of technical software engineering and creative digital content production to this project.\n\nHow can Zaara Ai help you?",
            tokens_used: 0,
            created_at: new Date().toISOString(),
            isStreaming: false,
          });
        }, 500);
        return;
      }

      if (accessToken) {
        await sendAuthMessage(content);
      } else {
        await sendGuestMessage(content);
      }
    },
    [accessToken, activeChatId, addMessage, sendAuthMessage, sendGuestMessage],
  );

  useEffect(() => {
    if (activeChatId) loadMessages(activeChatId);
  }, [activeChatId, loadMessages]);

  useEffect(() => {
    loadChats();
    return () => wsRef.current?.close();
  }, [loadChats]);

  return { sendMessage, createChat, loadChats, loadMessages };
}
