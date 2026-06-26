"use client";

import { motion } from "framer-motion";
import { MessageSquare, Clock } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";

interface ActivityItem {
  type: string;
  title: string;
  date: string;
}

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="glass-card p-6">
      <h3 className="mb-4 font-semibold">Recent Activity</h3>
      <div className="space-y-3">
        {items.map((item, i) => (
          <FadeIn key={`${item.date}-${i}`} delay={i * 0.05}>
            <motion.div whileHover={{ x: 4 }} className="flex items-center gap-3 rounded-xl p-3 hover:bg-white/40 dark:hover:bg-white/5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="h-3 w-3" />
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          </FadeIn>
        ))}
        {items.length === 0 && (
          <p className="text-center text-sm text-slate-500 py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
}
