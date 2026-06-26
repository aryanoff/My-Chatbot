"use client";

import { motion } from "framer-motion";
import {
  Bot,
  Code,
  FileText,
  Globe,
  Image,
  Presentation,
  Search,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { PROMPT_SUGGESTIONS } from "@/utils/constants";

const ICON_MAP: Record<string, LucideIcon> = {
  Code,
  Image,
  Presentation,
  Search,
  FileText,
  Globe,
};

interface ChatHeroProps {
  className?: string;
  onSuggestionClick?: (prompt: string) => void;
}

const containerVariants: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: any = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export function ChatHero({ className, onSuggestionClick }: ChatHeroProps) {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-4 py-12",
        className,
      )}
    >
      <motion.div variants={itemVariants} className="relative mb-8">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative flex h-24 w-24 items-center justify-center rounded-3xl gradient-bg shadow-float"
        >
          <Bot className="h-12 w-12 text-white" strokeWidth={1.5} />
          <motion.span
            className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-soft dark:bg-slate-800"
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="h-4 w-4 text-primary" />
          </motion.span>
        </motion.div>
        <motion.div
          className="absolute -inset-4 -z-10 rounded-full bg-primary/10 blur-2xl"
          animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      <motion.h1
        variants={itemVariants}
        className="mb-2 text-center font-display text-3xl font-semibold tracking-tight sm:text-4xl"
      >
        How can I help you today?
      </motion.h1>

      <motion.p
        variants={itemVariants}
        className="mb-10 max-w-md text-center text-sm text-slate-500 dark:text-slate-400"
      >
        Ask anything, upload files, or pick a suggestion to get started.
      </motion.p>

      <motion.div
        variants={itemVariants}
        className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {PROMPT_SUGGESTIONS.map((suggestion) => {
          const Icon = ICON_MAP[suggestion.icon] ?? Sparkles;

          return (
            <motion.button
              key={suggestion.label}
              type="button"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSuggestionClick?.(suggestion.prompt)}
              className={cn(
                "glass-card group flex items-start gap-3 p-4 text-left",
                "transition-shadow duration-normal hover:shadow-float",
              )}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-normal group-hover:scale-110"
                style={{ backgroundColor: `${suggestion.color}20`, color: suggestion.color }}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                  {suggestion.label}
                </span>
                <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                  {suggestion.prompt}
                </span>
              </span>
            </motion.button>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
