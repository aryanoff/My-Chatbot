"use client";

import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { AI_TOOLS } from "@/utils/constants";
import { cn } from "@/utils/cn";
import { FadeIn } from "@/components/animations/fade-in";

export function ToolPanel() {
  return (
    <div className="flex h-full flex-col p-4">
      <h2 className="mb-4 text-lg font-semibold gradient-text">AI Tools</h2>
      <div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto">
        {AI_TOOLS.map((tool, i) => {
          const Icon = (Icons as any)[tool.icon] || Icons.Sparkles;
          return (
            <FadeIn key={tool.id} delay={i * 0.05}>
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="glass-card w-full p-4 text-left transition-shadow duration-normal hover:shadow-float"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${tool.color}20`, color: tool.color }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tool.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{tool.description}</p>
                  </div>
                </div>
              </motion.button>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
}
