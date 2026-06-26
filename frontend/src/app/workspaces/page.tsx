"use client";

import { LayoutGrid, Users, Building2 } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";

const WORKSPACES = [
  { name: "Personal", members: 1, icon: LayoutGrid, color: "#6366F1" },
  { name: "Team Alpha", members: 8, icon: Users, color: "#8B5CF6" },
  { name: "Enterprise", members: 42, icon: Building2, color: "#06B6D4" },
];

export default function WorkspacesPage() {
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-6 md:p-8">
      <FadeIn><h1 className="text-3xl font-bold gradient-text">Workspaces</h1></FadeIn>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {WORKSPACES.map((ws, i) => (
          <FadeIn key={ws.name} delay={i * 0.05}>
            <div className="glass-card cursor-pointer p-6 transition-all duration-normal hover:shadow-float">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor: `${ws.color}20`, color: ws.color }}>
                <ws.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{ws.name}</h3>
              <p className="text-sm text-slate-500">{ws.members} member{ws.members > 1 ? "s" : ""}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
