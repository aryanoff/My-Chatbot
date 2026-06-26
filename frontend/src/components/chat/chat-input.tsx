"use client";

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Paperclip,
  ImagePlus,
  Mic,
  MicOff,
  Globe,
  Brain,
  Telescope,
  Bot,
  ChevronDown,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { useChatStore, useUIStore } from "@/store";
import { AI_MODELS, AI_TOOLS } from "@/utils/constants";
import type { AIModel } from "@/types";

interface ChatInputProps {
  className?: string;
  onSend?: (content: string, files: File[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

interface ToggleChipProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function ToggleChip({ active, onClick, icon, label }: ToggleChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all duration-normal",
        active
          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200",
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

interface DropdownProps {
  label: string;
  value: string;
  options: Array<{ id: string; label: string; description?: string }>;
  onChange: (id: string) => void;
  icon: React.ReactNode;
}

function SelectorDropdown({ label, value, options, onChange, icon }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
          "text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
        )}
      >
        {icon}
        <span className="max-w-[6rem] truncate">{selected?.label ?? label}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 z-40 cursor-default"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            />
            <motion.ul
              role="listbox"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "absolute bottom-full left-0 z-50 mb-2 min-w-[12rem] overflow-hidden rounded-xl",
                "border border-white/20 bg-white/90 shadow-float backdrop-blur-glass",
                "dark:border-white/10 dark:bg-slate-900/95",
              )}
            >
              {options.map((option) => (
                <li key={option.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={option.id === value}
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full flex-col px-3 py-2 text-left text-xs transition-colors",
                      option.id === value
                        ? "bg-primary/10 text-primary"
                        : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5",
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {option.description}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ChatInput({
  className,
  onSend,
  placeholder = "Message Zaara AI…",
  disabled = false,
}: ChatInputProps) {
  const inputOptions = useChatStore((s) => s.inputOptions);
  const setInputOptions = useChatStore((s) => s.setInputOptions);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const voiceActive = useUIStore((s) => s.voiceActive);
  const setVoiceActive = useUIStore((s) => s.setVoiceActive);

  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isDisabled = disabled || isStreaming;

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed && attachments.length === 0) return;
    if (isDisabled) return;

    onSend?.(trimmed, attachments);
    setValue("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [attachments, isDisabled, onSend, value]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) {
      setAttachments((prev) => [...prev, ...files]);
    }
    e.target.value = "";
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const agentOptions = AI_TOOLS.map((tool) => ({
    id: tool.id,
    label: tool.name,
    description: tool.description,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "sticky bottom-0 z-30 px-4 pb-4 pt-2",
        className,
      )}
    >
      <div
        className={cn(
          "mx-auto max-w-3xl rounded-2xl border border-white/25 p-3 shadow-glass",
          "bg-[var(--glass-bg)] backdrop-blur-glass",
          "dark:border-white/10",
        )}
      >
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex flex-wrap gap-2"
            >
              {attachments.map((file, index) => (
                <span
                  key={`${file.name}-${index}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 px-2 py-1 text-xs dark:bg-slate-800/80"
                >
                  <Paperclip className="h-3 w-3 text-slate-500" />
                  <span className="max-w-[8rem] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="rounded p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            adjustHeight();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={1}
          className={cn(
            "input-glass mb-3 min-h-[44px] resize-none border-0 bg-transparent px-1 py-2",
            "focus:ring-0",
          )}
          aria-label="Chat message"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              aria-hidden
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
              aria-hidden
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isDisabled}
              title="Upload file"
              aria-label="Upload file"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary disabled:opacity-50 dark:hover:bg-white/10"
            >
              <Paperclip className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              disabled={isDisabled}
              title="Upload image"
              aria-label="Upload image"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-primary disabled:opacity-50 dark:hover:bg-white/10"
            >
              <ImagePlus className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setVoiceActive(!voiceActive)}
              disabled={isDisabled}
              title={voiceActive ? "Stop voice input" : "Voice input"}
              aria-label={voiceActive ? "Stop voice input" : "Voice input"}
              aria-pressed={voiceActive}
              className={cn(
                "rounded-lg p-2 transition-colors disabled:opacity-50",
                voiceActive
                  ? "bg-primary/15 text-primary"
                  : "text-slate-500 hover:bg-slate-100 hover:text-primary dark:hover:bg-white/10",
              )}
            >
              {voiceActive ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            <div className="mx-1 hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-700" />

            <ToggleChip
              active={inputOptions.webSearch}
              onClick={() => setInputOptions({ webSearch: !inputOptions.webSearch })}
              icon={<Globe className="h-3.5 w-3.5" />}
              label="Web"
            />
            <ToggleChip
              active={inputOptions.reasoning}
              onClick={() => setInputOptions({ reasoning: !inputOptions.reasoning })}
              icon={<Brain className="h-3.5 w-3.5" />}
              label="Reasoning"
            />
            <ToggleChip
              active={inputOptions.deepResearch}
              onClick={() => setInputOptions({ deepResearch: !inputOptions.deepResearch })}
              icon={<Telescope className="h-3.5 w-3.5" />}
              label="Research"
            />
          </div>

          <div className="flex items-center gap-1">
            <SelectorDropdown
              label="Agent"
              value={inputOptions.agentId ?? agentOptions[0]?.id ?? ""}
              options={agentOptions}
              onChange={(id) => setInputOptions({ agentId: id })}
              icon={<Bot className="h-3.5 w-3.5" />}
            />

            <SelectorDropdown
              label="Model"
              value={inputOptions.model}
              options={AI_MODELS.map((m) => ({
                id: m.id,
                label: m.label,
                description: m.description,
              }))}
              onChange={(id) => setInputOptions({ model: id as AIModel })}
              icon={<Sparkles className="h-3.5 w-3.5" />}
            />

            <motion.button
              type="button"
              onClick={handleSend}
              disabled={isDisabled || (!value.trim() && attachments.length === 0)}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              aria-label="Send message"
              className={cn(
                "ml-1 flex h-9 w-9 items-center justify-center rounded-xl",
                "bg-primary text-white shadow-soft transition-opacity",
                "disabled:cursor-not-allowed disabled:opacity-40",
              )}
            >
              <Send className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
