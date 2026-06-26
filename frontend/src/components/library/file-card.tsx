"use client";

import { motion } from "framer-motion";
import { FileText, Image, Video, Music, File } from "lucide-react";
import { formatBytes } from "@/utils/cn";
import type { FileItem } from "@/types";

const TYPE_ICONS: Record<string, typeof File> = {
  pdf: FileText,
  image: Image,
  video: Video,
  audio: Music,
  document: FileText,
};

export function FileCard({ file }: { file: FileItem }) {
  const Icon = TYPE_ICONS[file.file_type] || File;

  return (
    <motion.div whileHover={{ y: -4 }} className="glass-card cursor-pointer p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-sm">{file.name}</p>
          <p className="text-xs text-slate-500">{formatBytes(file.size_bytes)}</p>
        </div>
      </div>
    </motion.div>
  );
}
