"use client";

import { useEffect, useState } from "react";
import { AgentCard } from "@/components/agents/agent-card";
import { FadeIn } from "@/components/animations/fade-in";
import { api } from "@/services/api";
import type { Agent } from "@/types";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    api.agents.list().then(setAgents).catch(() => {});
  }, []);

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-6 md:p-8">
      <FadeIn>
        <h1 className="text-3xl font-bold gradient-text">AI Agents</h1>
        <p className="mt-1 text-slate-500">Specialized AI assistants for every task</p>
      </FadeIn>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agents.map((agent, i) => (
          <FadeIn key={agent.slug} delay={i * 0.05}><AgentCard agent={agent} /></FadeIn>
        ))}
      </div>
    </div>
  );
}
