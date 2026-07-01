"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Github, Linkedin, Globe, Youtube, Code, Palette, Rocket } from "lucide-react";
import { useUIStore } from "@/store";
import { cn } from "@/utils/cn";

export function AboutDeveloperModal() {
  const { aboutModalOpen, setAboutModalOpen } = useUIStore();

  if (!aboutModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAboutModalOpen(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", bounce: 0, duration: 0.4 }}
          className={cn(
            "relative w-full max-w-lg overflow-hidden rounded-3xl",
            "border border-white/20 bg-slate-900/80 shadow-glass-large",
            "backdrop-blur-xl"
          )}
        >
          {/* Header Graphic */}
          <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-primary/80 to-secondary/80">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
            <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-white/20 blur-2xl" />
            
            <button
              onClick={() => setAboutModalOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-colors hover:bg-black/40"
            >
              <X size={18} />
            </button>
          </div>

          {/* Avatar */}
          <div className="relative px-6">
            <div className="absolute -top-12 h-24 w-24 overflow-hidden rounded-2xl border-4 border-slate-900 bg-gradient-to-br from-primary to-secondary shadow-xl">
              <div className="flex h-full w-full items-center justify-center text-4xl font-bold text-white">
                AR
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-14 px-6 pb-8">
            <h2 className="text-2xl font-bold tracking-tight text-white">Aryan Singh Rajpoot</h2>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary-300">
                <Code size={12} /> Full-Stack Developer
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-secondary/20 px-2.5 py-0.5 text-xs font-medium text-secondary-300">
                <Rocket size={12} /> AI Integrator
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-xs font-medium text-purple-300">
                <Palette size={12} /> Digital Creator
              </span>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-300">
              Pursuing a BSc in Computer Science, Aryan combines modern web development frameworks with a passion for creative arts. As the founder of an Official Artist Channel and Mr Rajpoot Studio, he leverages both logic and aesthetics to build high-performance, visually striking digital products.
            </p>

            <div className="mt-8 flex items-center justify-center gap-4 border-t border-white/10 pt-6">
              <SocialLink href="https://github.com/aryanoff" icon={Github} label="GitHub" />
              <SocialLink href="#" icon={Linkedin} label="LinkedIn" />
              <SocialLink href="#" icon={Globe} label="Website" />
              <SocialLink href="#" icon={Youtube} label="YouTube" />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function SocialLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-all hover:bg-primary/20 hover:text-primary-300"
      aria-label={label}
    >
      <Icon size={18} className="transition-transform group-hover:scale-110" />
      <span className="absolute -bottom-8 scale-0 rounded bg-slate-800 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-xl transition-all group-hover:scale-100 group-hover:opacity-100">
        {label}
      </span>
    </a>
  );
}
