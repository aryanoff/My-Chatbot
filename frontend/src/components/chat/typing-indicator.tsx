"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface TypingIndicatorProps {
  className?: string;
  label?: string;
}

const dotVariants = {
  initial: { y: 0, opacity: 0.4 },
  animate: { y: -6, opacity: 1 },
};

export function TypingIndicator({ className, label = "Thinking" }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className={cn("flex items-center gap-3", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="glass-card flex items-center gap-1.5 px-4 py-3">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-primary/70"
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </motion.div>
  );
}
