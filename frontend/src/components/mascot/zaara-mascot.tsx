"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

export type MascotState = "idle" | "thinking" | "speaking" | "loading";

interface ZaaraMascotProps {
  state?: MascotState;
  size?: number;
  className?: string;
}

export function ZaaraMascot({ state = "idle", size = 48, className }: ZaaraMascotProps) {
  const isThinking = state === "thinking";
  const isSpeaking = state === "speaking";
  const isLoading = state === "loading";

  return (
    <motion.div
      className={cn("relative inline-flex shrink-0", className)}
      style={{ width: size, height: size }}
      animate={
        isLoading
          ? { y: [0, -4, 0], rotate: [0, 2, -2, 0] }
          : { y: [0, -6, 0] }
      }
      transition={
        isLoading
          ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 4, repeat: Infinity, ease: "easeInOut" }
      }
    >
      {/* Glow */}
      <div
        className="absolute inset-0 rounded-full blur-md"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.45) 0%, rgba(139,92,246,0.2) 50%, transparent 70%)",
        }}
      />

      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-[0_8px_16px_rgba(99,102,241,0.35)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="zaara-body" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="zaara-highlight" x1="30" y1="20" x2="70" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
          <filter id="zaara-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#6366F1" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Body — 3D orb */}
        <ellipse cx="50" cy="58" rx="32" ry="34" fill="url(#zaara-body)" filter="url(#zaara-shadow)" />
        <ellipse cx="42" cy="42" rx="18" ry="14" fill="url(#zaara-highlight)" />

        {/* Ears / spirit wisps */}
        <motion.path
          d="M28 38 Q18 22 24 14 Q32 20 28 38"
          fill="#8B5CF6"
          opacity={0.85}
          animate={{ rotate: isThinking ? [0, -8, 8, 0] : 0 }}
          style={{ transformOrigin: "28px 38px" }}
          transition={{ duration: 1.5, repeat: isThinking ? Infinity : 0 }}
        />
        <motion.path
          d="M72 38 Q82 22 76 14 Q68 20 72 38"
          fill="#6366F1"
          opacity={0.85}
          animate={{ rotate: isThinking ? [0, 8, -8, 0] : 0 }}
          style={{ transformOrigin: "72px 38px" }}
          transition={{ duration: 1.5, repeat: isThinking ? Infinity : 0, delay: 0.2 }}
        />

        {/* Eyes */}
        <motion.g
          animate={
            isSpeaking
              ? { scaleY: [1, 0.15, 1, 0.15, 1] }
              : isLoading
                ? { opacity: [1, 0.4, 1] }
                : { scaleY: 1 }
          }
          transition={
            isSpeaking
              ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" }
              : isLoading
                ? { duration: 1, repeat: Infinity }
                : {}
          }
          style={{ transformOrigin: "50px 52px" }}
        >
          <ellipse cx="38" cy="52" rx="7" ry={isThinking ? 9 : 8} fill="#1E1B4B" />
          <ellipse cx="62" cy="52" rx="7" ry={isThinking ? 9 : 8} fill="#1E1B4B" />
          <circle cx="40" cy="50" r="2.5" fill="#FFFFFF" />
          <circle cx="64" cy="50" r="2.5" fill="#FFFFFF" />
        </motion.g>

        {/* Thinking dots */}
        {isThinking && (
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.circle
                key={i}
                cx={78 + i * 7}
                cy={28 - i * 4}
                r="2.5"
                fill="#8B5CF6"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.g>
        )}

        {/* Speaking mouth */}
        <motion.ellipse
          cx="50"
          cy="68"
          rx={isSpeaking ? 8 : 6}
          ry={isSpeaking ? 5 : 3}
          fill="#4C1D95"
          animate={
            isSpeaking
              ? { rx: [6, 9, 6], ry: [3, 6, 3] }
              : isLoading
                ? { opacity: [0.6, 1, 0.6] }
                : {}
          }
          transition={
            isSpeaking
              ? { duration: 0.5, repeat: Infinity }
              : isLoading
                ? { duration: 1.5, repeat: Infinity }
                : {}
          }
        />

        {/* Loading ring */}
        {isLoading && (
          <motion.circle
            cx="50"
            cy="50"
            r="44"
            stroke="#6366F1"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            strokeDasharray="40 240"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "50px 50px" }}
          />
        )}
      </svg>
    </motion.div>
  );
}
