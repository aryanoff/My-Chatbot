"use client";

import { useState } from "react";
import { User, Shield, Link2, Key, CreditCard, Bell, Globe, Palette, Database, Lock } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUIStore, useAuthStore } from "@/store";
import { cn } from "@/utils/cn";
import type { ThemeMode } from "@/types";

const TABS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: Shield },
  { id: "accounts", label: "Connected Accounts", icon: Link2 },
  { id: "api", label: "API Keys", icon: Key },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "language", label: "Language", icon: Globe },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "data", label: "Data Controls", icon: Database },
  { id: "privacy", label: "Privacy", icon: Lock },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { theme, setTheme, highContrast, setHighContrast } = useUIStore();
  const { user } = useAuthStore();

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="hidden w-64 border-r border-white/10 p-4 md:block">
        <h2 className="mb-4 px-3 text-lg font-semibold">Settings</h2>
        <nav className="space-y-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn("nav-item w-full", activeTab === tab.id && "nav-item-active")}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="scrollbar-thin flex-1 overflow-y-auto p-6 md:p-8">
        <FadeIn key={activeTab}>
          {activeTab === "profile" && (
            <div className="max-w-xl space-y-6">
              <h1 className="text-2xl font-bold">Profile</h1>
              <div className="glass-card space-y-4 p-6">
                <div><label className="text-sm text-slate-500">Name</label><Input defaultValue={user?.name || ""} className="mt-1" /></div>
                <div><label className="text-sm text-slate-500">Email</label><Input defaultValue={user?.email || ""} className="mt-1" /></div>
                <Button>Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === "theme" && (
            <div className="max-w-xl space-y-6">
              <h1 className="text-2xl font-bold">Theme</h1>
              <div className="glass-card space-y-4 p-6">
                {(["light", "dark", "system"] as ThemeMode[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={cn(
                      "w-full rounded-xl border p-4 text-left capitalize transition-all duration-normal",
                      theme === t ? "border-primary bg-primary/5" : "border-white/10 hover:border-primary/30",
                    )}
                  >
                    {t} Theme
                  </button>
                ))}
                <div className="flex items-center justify-between pt-2">
                  <span>High Contrast Mode</span>
                  <Switch checked={highContrast} onCheckedChange={setHighContrast} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="max-w-xl space-y-6">
              <h1 className="text-2xl font-bold">Security</h1>
              <div className="glass-card space-y-4 p-6">
                <Input type="password" placeholder="Current password" />
                <Input type="password" placeholder="New password" />
                <Button>Update Password</Button>
              </div>
            </div>
          )}

          {!["profile", "theme", "security"].includes(activeTab) && (
            <div className="max-w-xl">
              <h1 className="text-2xl font-bold capitalize">{activeTab.replace("-", " ")}</h1>
              <div className="glass-card mt-6 p-6">
                <p className="text-slate-500">Configure your {activeTab} settings here.</p>
              </div>
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
