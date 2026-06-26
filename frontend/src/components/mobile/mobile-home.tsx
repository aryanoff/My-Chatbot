"use client";

import { ZaaraMascot } from "@/components/mascot/zaara-mascot";
import { ChatInput } from "@/components/chat/chat-input";
import { TRENDING_PROMPTS, PROMPT_SUGGESTIONS } from "@/utils/constants";
import { useChatStore, useAuthStore } from "@/store";
import { useChat } from "@/hooks/use-chat";
import { FadeIn } from "@/components/animations/fade-in";
import * as Icons from "lucide-react";

export function MobileHome() {
  const { chats } = useChatStore();
  const { user } = useAuthStore();
  const { sendMessage } = useChat();
  const greeting = user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Hi there";

  return (
    <div className="flex flex-1 flex-col overflow-hidden md:hidden">
      <div className="scrollbar-thin flex-1 overflow-y-auto px-4 pt-6">
        <FadeIn className="flex flex-col items-center">
          <ZaaraMascot size={96} />
          <h1 className="mt-4 text-2xl font-bold">{greeting}</h1>
          <p className="text-slate-500">How can I help you today?</p>
        </FadeIn>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {PROMPT_SUGGESTIONS.slice(0, 4).map((s, i) => {
            const Icon = (Icons as any)[s.icon] || Icons.Sparkles;
            return (
              <FadeIn key={s.label} delay={i * 0.05}>
                <button
                  onClick={() => sendMessage(s.prompt)}
                  className="glass-card p-4 text-left"
                >
                  <Icon className="h-5 w-5" style={{ color: s.color }} />
                  <p className="mt-2 text-sm font-medium">{s.label}</p>
                </button>
              </FadeIn>
            );
          })}
        </div>

        {chats.length > 0 && (
          <div className="mt-8">
            <h3 className="font-semibold">Recent Chats</h3>
            <div className="mt-3 space-y-2">
              {chats.slice(0, 3).map((c) => (
                <div key={c.id} className="glass-panel rounded-xl p-3 text-sm">{c.title}</div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 mb-4">
          <h3 className="font-semibold">Trending</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {TRENDING_PROMPTS.map((p) => (
              <button key={p} onClick={() => sendMessage(p)} className="rounded-full bg-primary/10 px-3 py-1.5 text-xs text-primary">
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      <ChatInput onSend={(content) => sendMessage(content)} />
    </div>
  );
}
