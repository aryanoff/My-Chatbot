"use client";

import { motion } from "framer-motion";

export function Waveform({ active = false, bars = 12 }: { active?: boolean; bars?: number }) {
  return (
    <div className="flex h-16 items-center justify-center gap-1">
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 rounded-full bg-gradient-to-t from-primary to-secondary"
          animate={
            active
              ? { height: [8, 24 + Math.random() * 20, 8] }
              : { height: 8 }
          }
          transition={
            active
              ? { duration: 0.5 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }
              : { duration: 0.3 }
          }
          style={{ height: 8 }}
        />
      ))}
    </div>
  );
}
