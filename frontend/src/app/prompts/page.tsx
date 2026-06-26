"use client";

import { Bookmark } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";

const SAVED_PROMPTS = [
  { title: "Code Review", content: "Review this code for bugs and improvements:", category: "Development" },
  { title: "Email Draft", content: "Write a professional email about:", category: "Writing" },
  { title: "Research Summary", content: "Summarize the key findings about:", category: "Research" },
  { title: "Marketing Copy", content: "Create compelling marketing copy for:", category: "Marketing" },
];

export default function PromptsPage() {
  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-6 md:p-8">
      <FadeIn><h1 className="text-3xl font-bold gradient-text">Saved Prompts</h1></FadeIn>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SAVED_PROMPTS.map((prompt, i) => (
          <FadeIn key={prompt.title} delay={i * 0.05}>
            <div className="glass-card cursor-pointer p-5 transition-all duration-normal hover:shadow-float">
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 text-primary" />
                <h3 className="font-semibold">{prompt.title}</h3>
              </div>
              <p className="mt-2 text-sm text-slate-500">{prompt.content}</p>
              <span className="mt-3 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{prompt.category}</span>
            </div>
          </FadeIn>
        ))}
      </div>
    </div>
  );
}
