"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { cn } from "@/utils/cn";
import { MessageBubble } from "@/components/chat/message-bubble";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { useChatStore } from "@/store";
import type { Message } from "@/types";

interface MessageListProps {
  className?: string;
  onRegenerate?: (message: Message) => void;
  onLike?: (message: Message, liked: boolean) => void;
  onDislike?: (message: Message, disliked: boolean) => void;
  onShare?: (message: Message) => void;
  onExport?: (message: Message) => void;
  onTextToSpeech?: (message: Message) => void;
  /** Distance from bottom (px) before auto-scroll pauses */
  scrollThreshold?: number;
}

export function MessageList({
  className,
  onRegenerate,
  onLike,
  onDislike,
  onShare,
  onExport,
  onTextToSpeech,
  scrollThreshold = 120,
}: MessageListProps) {
  const messages = useChatStore((s) => s.messages);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const isLoading = useChatStore((s) => s.isLoading);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const shouldAutoScrollRef = useRef(true);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const nearBottom = distanceFromBottom <= scrollThreshold;

    shouldAutoScrollRef.current = nearBottom;
    setShowScrollButton(!nearBottom && messages.length > 0);
  }, [messages.length, scrollThreshold]);

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom(isStreaming ? "auto" : "smooth");
    }
  }, [messages, isStreaming, isLoading, scrollToBottom]);

  return (
    <div className={cn("relative flex min-h-0 flex-1 flex-col", className)}>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className={cn(
          "flex-1 overflow-y-auto overscroll-contain scroll-smooth px-4 py-6",
          "scrollbar-thin",
        )}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onRegenerate={onRegenerate}
              onLike={onLike}
              onDislike={onDislike}
              onShare={onShare}
              onExport={onExport}
              onTextToSpeech={onTextToSpeech}
            />
          ))}

          <AnimatePresence>
            {(isLoading || isStreaming) &&
              messages.length > 0 &&
              messages[messages.length - 1]?.role === "user" && (
                <TypingIndicator key="typing" />
              )}
          </AnimatePresence>

          <div ref={bottomRef} className="h-px shrink-0" aria-hidden />
        </div>
      </div>

      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.9, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={() => {
              shouldAutoScrollRef.current = true;
              scrollToBottom();
              setShowScrollButton(false);
            }}
            className={cn(
              "absolute bottom-4 left-1/2 z-10 -translate-x-1/2",
              "flex items-center gap-2 rounded-full border border-white/20",
              "bg-white/80 px-4 py-2 text-xs font-medium text-slate-700 shadow-float",
              "backdrop-blur-glass transition-colors hover:bg-white",
              "dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:bg-slate-900",
            )}
            aria-label="Scroll to latest message"
          >
            <ArrowDown className="h-3.5 w-3.5" />
            New messages
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
