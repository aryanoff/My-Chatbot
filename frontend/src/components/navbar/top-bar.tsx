"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  PanelLeft,
  Plus,
  Sparkles,
  LogOut,
  User,
} from "lucide-react";
import { useChatStore } from "@/store";
import { cn } from "@/utils/cn";
import { useState, useEffect } from "react";

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

  const [user, setUser] = useState<{name: string, phone?: string, avatar_url?: string} | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).then(res => res.json()).then(data => {
        if (!data.detail) setUser(data);
      }).catch(console.error);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  const handleNewChat = () => {
    setActiveChat(null);
    clearMessages();
    router.push("/");
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

      <div className="flex-1" />

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

      {/* User Profile */}
      {user && (
        <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-3 dark:border-slate-700">
          <div className="flex items-center gap-2">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User size={16} />
              </div>
            )}
            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block max-w-[100px] truncate">
              {user.name || user.phone}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-500 dark:text-slate-400 dark:hover:bg-red-500/10 transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </header>
  );
}
