"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import { MobileNav } from "@/components/sidebar/mobile-nav";
import { TopBar } from "@/components/navbar/top-bar";
import { PageTransition } from "@/components/animations/page-transition";
import { ToolPanel } from "@/components/tools/tool-panel";
import { useChatStore } from "@/store";

const AUTH_ROUTES = ["/login", "/register", "/oauth-callback"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { sidebarOpen, rightPanelOpen } = useChatStore();

  if (AUTH_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <Sidebar />

      <div
        className="flex flex-1 flex-col transition-all duration-slow"
        style={{ marginLeft: sidebarOpen ? undefined : 0 }}
      >
        <TopBar />
        <main className="relative flex flex-1 overflow-hidden pb-16 md:pb-0">
          <PageTransition className="flex flex-1 flex-col overflow-hidden">
            {children}
          </PageTransition>
          {rightPanelOpen && (
            <aside className="hidden w-80 border-l border-white/10 lg:block">
              <ToolPanel />
            </aside>
          )}
        </main>
      </div>

      <MobileNav />
    </div>
  );
}
