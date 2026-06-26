"use client";

import { useCallback, useMemo, useState, type ComponentProps } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import {
  Copy,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Download,
  Volume2,
  Check,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/utils/cn";
import { StreamingText } from "@/components/chat/streaming-text";
import type { Message } from "@/types";

interface MessageBubbleProps {
  message: Message;
  onRegenerate?: (message: Message) => void;
  onLike?: (message: Message, liked: boolean) => void;
  onDislike?: (message: Message, disliked: boolean) => void;
  onShare?: (message: Message) => void;
  onExport?: (message: Message) => void;
  onTextToSpeech?: (message: Message) => void;
  className?: string;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}

function ActionButton({ icon, label, onClick, active }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "rounded-lg p-1.5 text-slate-500 transition-colors duration-normal",
        "hover:bg-slate-100 hover:text-primary dark:hover:bg-white/10",
        active && "text-primary",
      )}
    >
      {icon}
    </button>
  );
}

export function MessageBubble({
  message,
  onRegenerate,
  onLike,
  onDislike,
  onShare,
  onExport,
  onTextToSpeech,
  className,
}: MessageBubbleProps) {
  const { resolvedTheme } = useTheme();
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(message.is_liked === true);
  const [disliked, setDisliked] = useState(message.is_liked === false);

  const codeTheme = resolvedTheme === "dark" ? oneDark : oneLight;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [message.content]);

  const handleLike = useCallback(() => {
    const next = !liked;
    setLiked(next);
    if (next) setDisliked(false);
    onLike?.(message, next);
  }, [liked, message, onLike]);

  const handleDislike = useCallback(() => {
    const next = !disliked;
    setDisliked(next);
    if (next) setLiked(false);
    onDislike?.(message, next);
  }, [disliked, message, onDislike]);

  const markdownComponents = useMemo<Components>(
    () => ({
      code({ className: codeClassName, children, ...props }) {
        const match = /language-(\w+)/.exec(codeClassName ?? "");
        const codeString = String(children).replace(/\n$/, "");

        if (match) {
          return (
            <SyntaxHighlighter
              style={codeTheme}
              language={match[1]}
              PreTag="div"
              className="!my-3 !rounded-xl !text-sm"
            >
              {codeString}
            </SyntaxHighlighter>
          );
        }

        return (
          <code
            className={cn(
              "rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.875em] dark:bg-slate-800",
              codeClassName,
            )}
            {...(props as ComponentProps<"code">)}
          >
            {children}
          </code>
        );
      },
      pre({ children }) {
        return <>{children}</>;
      },
      a({ href, children, ...props }) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-2 hover:underline"
            {...props}
          >
            {children}
          </a>
        );
      },
    }),
    [codeTheme],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "group flex w-full flex-col gap-1",
        isUser ? "items-end" : "items-start",
        className,
      )}
    >
      <div
        className={cn(
          isUser ? "message-user" : "message-assistant",
          "relative text-sm leading-relaxed",
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        ) : message.isStreaming ? (
          <div className="prose prose-sm prose-slate max-w-none dark:prose-invert">
            <StreamingText content={message.content} isStreaming />
          </div>
        ) : (
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {message.content}
          </ReactMarkdown>
        )}
      </div>

      {isAssistant && !message.isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-0.5 opacity-0 transition-opacity duration-normal group-hover:opacity-100"
        >
          <ActionButton
            icon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            label={copied ? "Copied" : "Copy"}
            onClick={handleCopy}
            active={copied}
          />
          <ActionButton
            icon={<RefreshCw className="h-3.5 w-3.5" />}
            label="Regenerate"
            onClick={() => onRegenerate?.(message)}
          />
          <ActionButton
            icon={<ThumbsUp className="h-3.5 w-3.5" />}
            label="Like"
            onClick={handleLike}
            active={liked}
          />
          <ActionButton
            icon={<ThumbsDown className="h-3.5 w-3.5" />}
            label="Dislike"
            onClick={handleDislike}
            active={disliked}
          />
          <ActionButton
            icon={<Share2 className="h-3.5 w-3.5" />}
            label="Share"
            onClick={() => onShare?.(message)}
          />
          <ActionButton
            icon={<Download className="h-3.5 w-3.5" />}
            label="Export"
            onClick={() => onExport?.(message)}
          />
          <ActionButton
            icon={<Volume2 className="h-3.5 w-3.5" />}
            label="Text to speech"
            onClick={() => onTextToSpeech?.(message)}
          />
        </motion.div>
      )}
    </motion.div>
  );
}
