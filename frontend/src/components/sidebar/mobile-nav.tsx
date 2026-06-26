"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  MessageSquare,
  Folder,
  Bot,
  User,
  type LucideIcon,
} from "lucide-react";
import { MOBILE_NAV } from "@/utils/constants";
import { cn } from "@/utils/cn";

const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  MessageSquare,
  Folder,
  Bot,
  User,
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Home;
  return <Icon className={className} size={20} />;
}

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 md:hidden",
        "border-t border-white/20 bg-white/80 shadow-glass backdrop-blur-glass",
        "dark:border-white/10 dark:bg-slate-900/80",
        "pb-[env(safe-area-inset-bottom)]",
      )}
      aria-label="Mobile navigation"
    >
      <ul className="flex items-stretch justify-around px-2 py-1.5">
        {MOBILE_NAV.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href) && item.href !== "/";

          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-xl px-2 py-2",
                  "text-xs font-medium transition-colors duration-normal",
                  isActive
                    ? "text-primary"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-indicator"
                    className="absolute inset-x-2 inset-y-1 rounded-xl bg-primary/10 dark:bg-primary/20"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <NavIcon
                  name={item.icon}
                  className={cn("relative z-10", isActive && "text-primary")}
                />
                <span className="relative z-10">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
