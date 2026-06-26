"use client";

import { useEffect, useState } from "react";
import { Search, Filter } from "lucide-react";
import { FileCard } from "@/components/library/file-card";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/animations/fade-in";
import { useAuthStore } from "@/store";
import { api } from "@/services/api";
import type { FileItem } from "@/types";

export default function LibraryPage() {
  const { accessToken } = useAuthStore();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (accessToken) api.files.list(accessToken).then(setFiles).catch(() => {});
  }, [accessToken]);

  const filtered = files.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || f.file_type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="scrollbar-thin flex-1 overflow-y-auto p-6 md:p-8">
        <FadeIn><h1 className="text-3xl font-bold gradient-text">Library</h1></FadeIn>
        <div className="mt-6 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..." className="pl-10" />
          </div>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-glass rounded-xl px-3 text-sm">
            <option value="all">All Types</option>
            <option value="pdf">PDFs</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="document">Documents</option>
          </select>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((file, i) => (
            <FadeIn key={file.id} delay={i * 0.03}><FileCard file={file} /></FadeIn>
          ))}
        </div>
      </div>
      <aside className="hidden w-80 border-l border-white/10 p-6 lg:block">
        <h3 className="font-semibold">Preview</h3>
        <div className="glass-card mt-4 flex h-64 items-center justify-center text-slate-400">
          <Filter className="mr-2 h-4 w-4" /> Select a file
        </div>
      </aside>
    </div>
  );
}
