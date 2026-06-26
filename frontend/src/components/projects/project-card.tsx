"use client";

import { motion } from "framer-motion";
import { Folder, Star, Tag } from "lucide-react";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div whileHover={{ y: -6, scale: 1.01 }} className="glass-card cursor-pointer p-6">
      <div className="flex items-start justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${project.color}20`, color: project.color }}
        >
          <Folder className="h-6 w-6" />
        </div>
        {project.is_favorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
      </div>
      <h3 className="mt-4 font-semibold">{project.name}</h3>
      {project.description && (
        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{project.description}</p>
      )}
      {project.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <span key={tag} className="flex items-center gap-1 rounded-full bg-white/50 px-2 py-0.5 text-xs dark:bg-white/5">
              <Tag className="h-3 w-3" /> {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
