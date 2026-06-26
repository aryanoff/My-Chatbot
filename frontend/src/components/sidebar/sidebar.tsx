"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  MessageSquare,
  Folder,
  Library,
  Bot,
  LayoutGrid,
  Bookmark,
  Settings,
  Home,
  User,
  LogOut,
  Moon,
  Sun,
  ChevronLeft,
  Pin,
  Sparkles,
  BarChart,
  type LucideIcon,
} from "lucide-react";
import { useChatStore, useAuthStore, useUIStore } from "@/store";
import { NAV_ITEMS } from "@/utils/constants";
import { cn, getInitials, truncate } from "@/utils/cn";
import { ZaaraMascot } from "@/components/mascot/zaara-mascot";

const ICON_MAP: Record<string, LucideIcon> = {
  Plus,
  MessageSquare,
  Folder,
  Library,
  Bot,
  LayoutGrid,
  Bookmark,
  Settings,
  Home,
  User,
  BarChart,
};

const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED = 72;

const SUBSCRIPTION_COLORS: Record<string, string> = {
  free: "bg-slate-500/20 text-slate-600 dark:text-slate-300",
  pro: "bg-primary/15 text-primary",
  enterprise: "bg-secondary/15 text-secondary",
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? MessageSquare;
  return <Icon className={className} size={18} />;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { chats, activeChatId, sidebarOpen, setActiveChat, toggleSidebar, clearMessages } =
    useChatStore();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useUIStore();

  const recentChats = chats.slice(0, 8);

  const handleNewChat = () => {
    setActiveChat(null);
    clearMessages();
    router.push("/");
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const toggleThemeMode = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  };

  const subscriptionClass =
    SUBSCRIPTION_COLORS[user?.subscription?.toLowerCase() ?? "free"] ?? SUBSCRIPTION_COLORS.free;

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          "relative z-40 hidden h-full shrink-0 flex-col overflow-hidden",
          "border-r border-white/20 bg-white/70 shadow-glass backdrop-blur-glass",
          "dark:border-white/10 dark:bg-slate-900/70",
          "md:flex",
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-white/15 px-4 py-4 dark:border-white/5">
          <ZaaraMascot size={sidebarOpen ? 40 : 32} state="idle" />
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="min-w-0 flex-1"
              >
                <h1 className="font-display text-lg font-bold gradient-text">Zaara AI</h1>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  Your AI companion
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
              "text-slate-500 transition-colors hover:bg-white/60 hover:text-primary",
              "dark:hover:bg-white/5",
              !sidebarOpen && "mx-auto",
            )}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            <ChevronLeft
              className={cn("transition-transform duration-300", !sidebarOpen && "rotate-180")}
              size={18}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 scrollbar-thin">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href) && item.href !== "/";

              return (
                <li key={item.href}>
                  {item.label === "New Chat" ? (
                    <button
                      type="button"
                      onClick={handleNewChat}
                      className={cn(
                        "nav-item w-full",
                        isActive && "nav-item-active",
                        !sidebarOpen && "justify-center px-2",
                      )}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <NavIcon name={item.icon} className="shrink-0" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "nav-item",
                        isActive && "nav-item-active",
                        !sidebarOpen && "justify-center px-2",
                      )}
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      <NavIcon name={item.icon} className="shrink-0" />
                      <AnimatePresence>
                        {sidebarOpen && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="truncate"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Chat history */}
          <AnimatePresence>
            {sidebarOpen && recentChats.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recent
                </p>
                <ul className="space-y-0.5">
                  {recentChats.map((chat) => (
                    <li key={chat.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveChat(chat.id);
                          router.push(`/chat/${chat.id}`);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm",
                          "text-slate-600 transition-colors hover:bg-white/60 hover:text-primary",
                          "dark:text-slate-300 dark:hover:bg-white/5",
                          activeChatId === chat.id && "bg-primary/10 text-primary dark:bg-primary/20",
                        )}
                      >
                        <MessageSquare size={14} className="shrink-0 opacity-60" />
                        <span className="truncate">{truncate(chat.title, 28)}</span>
                        {chat.is_pinned && (
                          <Pin size={12} className="ml-auto shrink-0 text-primary/60" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/15 p-3 dark:border-white/5">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="expanded-bottom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3"
              >
                {/* User profile */}
                <div className="flex items-center gap-3 rounded-xl bg-white/40 px-3 py-2.5 dark:bg-white/5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-semibold text-white">
                    {user?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      getInitials(user?.name ?? "Guest")
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{user?.name ?? "Guest"}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.email ?? "Sign in to sync"}
                    </p>
                  </div>
                </div>

                {/* Subscription badge */}
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium capitalize",
                    subscriptionClass,
                  )}
                >
                  <Sparkles size={14} />
                  {user?.subscription ?? "Free"} Plan
                </div>

                {/* Actions row */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={toggleThemeMode}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm text-slate-600 transition-colors hover:bg-white/60 hover:text-primary dark:text-slate-300 dark:hover:bg-white/5"
                    aria-label="Toggle theme"
                  >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    <span>{theme === "dark" ? "Light" : "Dark"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center justify-center rounded-xl p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-500"
                    aria-label="Log out"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-bottom"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-semibold text-white">
                  {getInitials(user?.name ?? "G")}
                </div>
                <button
                  type="button"
                  onClick={toggleThemeMode}
                  className="rounded-lg p-2 text-slate-500 hover:bg-white/60 hover:text-primary dark:hover:bg-white/5"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-500"
                  aria-label="Log out"
                >
                  <LogOut size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>
    </>
  );
}
