"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Agent } from "@/types";

export function AgentCard({ agent }: { agent: Agent }) {
  const Icon = (Icons as any)[agent.icon || "Bot"] || Icons.Bot;

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      className="glass-card group relative overflow-hidden p-6"
    >
      <div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
        style={{ backgroundColor: agent.color }}
      />
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${agent.color}20`, color: agent.color }}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold">{agent.name}</h3>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{agent.description}</p>
      <Button className="mt-4 w-full" variant="glass" size="sm">
        Launch Agent
      </Button>
    </motion.div>
  );
}
