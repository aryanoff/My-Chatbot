"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

interface StreamingTextProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
  /** Characters revealed per animation frame when streaming */
  speed?: number;
}

export function StreamingText({
  content,
  isStreaming = false,
  className,
  speed = 2,
}: StreamingTextProps) {
  const [displayed, setDisplayed] = useState(isStreaming ? "" : content);
  const rafRef = useRef<number | null>(null);
  const indexRef = useRef(isStreaming ? 0 : content.length);

  useEffect(() => {
    if (!isStreaming) {
      setDisplayed(content);
      indexRef.current = content.length;
      return;
    }

    const tick = () => {
      if (indexRef.current < content.length) {
        indexRef.current = Math.min(indexRef.current + speed, content.length);
        setDisplayed(content.slice(0, indexRef.current));
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    if (indexRef.current < content.length) {
      rafRef.current = requestAnimationFrame(tick);
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [content, isStreaming, speed]);

  useEffect(() => {
    if (isStreaming && content.length < indexRef.current) {
      indexRef.current = 0;
      setDisplayed("");
    }
  }, [content, isStreaming]);

  return (
    <span className={cn("inline", className)}>
      {displayed}
      {isStreaming && indexRef.current < content.length && (
        <motion.span
          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-primary"
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden
        />
      )}
    </span>
  );
}
