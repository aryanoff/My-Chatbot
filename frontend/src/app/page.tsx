"use client";

import { ChatHero } from "@/components/chat/chat-hero";
import { ChatInput } from "@/components/chat/chat-input";
import { MessageList } from "@/components/chat/message-list";
import { useChat } from "@/hooks/use-chat";
import { useChatStore } from "@/store";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const { messages } = useChatStore();
  const { sendMessage } = useChat();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        {messages.length === 0 ? (
          <ChatHero onSuggestionClick={(prompt) => sendMessage(prompt)} />
        ) : (
          <MessageList />
        )}
      </div>
      <ChatInput onSend={(content) => sendMessage(content)} />
    </div>
  );
}
