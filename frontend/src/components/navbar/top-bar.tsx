"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PanelLeft,
  Plus,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useChatStore } from "@/store";
import { AI_MODELS } from "@/utils/constants";
import { cn } from "@/utils/cn";
import type { AIModel } from "@/types";

interface TopBarProps {
  title?: string;
  className?: string;
}

export function TopBar({ title = "Zaara AI", className }: TopBarProps) {
  const router = useRouter();
  const {
    sidebarOpen,
    toggleSidebar,
    inputOptions,
    setInputOptions,
    setActiveChat,
    clearMessages,
  } = useChatStore();

  const currentModel = AI_MODELS.find((m) => m.id === inputOptions.model) ?? AI_MODELS[0];

  const handleNewChat = () => {
    setActiveChat(null);
    clearMessages();
    router.push("/");
  };

  const handleModelChange = (modelId: AIModel) => {
    setInputOptions({ model: modelId });
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b px-4",
        "border-white/20 bg-white/70 shadow-soft backdrop-blur-glass",
        "dark:border-white/10 dark:bg-slate-900/70",
        className,
      )}
    >
      {/* Sidebar toggle */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={toggleSidebar}
        className={cn(
          "hidden h-9 w-9 items-center justify-center rounded-xl md:flex",
          "text-slate-600 transition-colors hover:bg-white/60 hover:text-primary",
          "dark:text-slate-300 dark:hover:bg-white/5",
        )}
        aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
      >
        <PanelLeft size={18} />
      </motion.button>

      {/* Title / branding on mobile */}
      <div className="flex min-w-0 flex-1 items-center gap-2 md:flex-none">
        <Sparkles className="h-4 w-4 shrink-0 text-primary md:hidden" />
        <h2 className="truncate font-display text-sm font-semibold md:text-base">{title}</h2>
      </div>

      {/* Model selector */}
      <div className="relative ml-auto md:ml-0">
        <label htmlFor="model-select" className="sr-only">
          Select AI model
        </label>
        <div className="relative">
          <select
            id="model-select"
            value={inputOptions.model}
            onChange={(e) => handleModelChange(e.target.value as AIModel)}
            className={cn(
              "appearance-none rounded-xl border border-white/30 bg-white/60",
              "py-2 pl-3 pr-8 text-sm font-medium text-slate-700 backdrop-blur-md",
              "transition-colors hover:border-primary/40 focus:border-primary/50",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              "dark:border-white/10 dark:bg-slate-800/60 dark:text-slate-200",
            )}
          >
            {AI_MODELS.map((model) => (
              <option key={model.id} value={model.id}>
                {model.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
        </div>
        <p className="mt-0.5 hidden text-center text-[10px] text-slate-400 md:block">
          {currentModel.description}
        </p>
      </div>

      {/* New chat button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNewChat}
        className="btn-primary hidden gap-2 sm:inline-flex"
      >
        <Plus size={16} />
        <span>New Chat</span>
      </motion.button>

      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={handleNewChat}
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-soft sm:hidden"
        aria-label="New chat"
      >
        <Plus size={18} />
      </motion.button>
    </header>
  );
}
