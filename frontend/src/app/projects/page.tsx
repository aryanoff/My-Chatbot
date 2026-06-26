"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/animations/fade-in";
import { useAuthStore } from "@/store";
import { api } from "@/services/api";
import type { Project } from "@/types";

export default function ProjectsPage() {
  const { accessToken } = useAuthStore();
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (accessToken) api.projects.list(accessToken).then(setProjects).catch(() => {});
  }, [accessToken]);

  const filtered = projects.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-6 md:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <FadeIn><h1 className="text-3xl font-bold gradient-text">Projects</h1></FadeIn>
        <Button><Plus className="mr-2 h-4 w-4" /> New Project</Button>
      </div>

      <div className="relative mt-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects..." className="pl-10" />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project, i) => (
          <FadeIn key={project.id} delay={i * 0.05}><ProjectCard project={project} /></FadeIn>
        ))}
      </div>
    </div>
  );
}
