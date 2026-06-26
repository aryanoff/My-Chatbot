"use client";

import Link from "next/link";
import { MessageSquare, Pin } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { useChatStore } from "@/store";
import { truncate } from "@/utils/cn";

export default function ChatsPage() {
  const { chats, setActiveChat, clearMessages } = useChatStore();

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-6 md:p-8">
      <FadeIn><h1 className="text-3xl font-bold gradient-text">Chat History</h1></FadeIn>
      <div className="mt-6 space-y-2">
        {chats.map((chat, i) => (
          <FadeIn key={chat.id} delay={i * 0.03}>
            <Link
              href="/"
              onClick={() => { setActiveChat(chat.id); }}
              className="glass-card flex items-center gap-4 p-4 transition-all duration-normal hover:shadow-float"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{truncate(chat.title, 60)}</p>
                <p className="text-xs text-slate-500">{new Date(chat.updated_at).toLocaleString()}</p>
              </div>
              {chat.is_pinned && <Pin className="h-4 w-4 text-primary" />}
            </Link>
          </FadeIn>
        ))}
        {chats.length === 0 && (
          <p className="py-12 text-center text-slate-500">No chats yet. Start a new conversation!</p>
        )}
      </div>
    </div>
  );
}
