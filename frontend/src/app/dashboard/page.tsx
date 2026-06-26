"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Zap, FileText, Image } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { UsageChart } from "@/components/dashboard/usage-chart";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { FadeIn } from "@/components/animations/fade-in";
import { useAuthStore } from "@/store";
import { api } from "@/services/api";
import { formatNumber } from "@/utils/cn";
import type { Analytics } from "@/types";

export default function DashboardPage() {
  const { accessToken } = useAuthStore();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);

  useEffect(() => {
    if (accessToken) {
      api.analytics.dashboard(accessToken).then(setAnalytics).catch(() => {});
    }
  }, [accessToken]);

  return (
    <div className="scrollbar-thin flex-1 overflow-y-auto p-6 md:p-8">
      <FadeIn>
        <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
        <p className="mt-1 text-slate-500">Your Zaara AI analytics overview</p>
      </FadeIn>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Chats" value={analytics?.total_chats ?? 0} icon={MessageSquare} color="#6366F1" trend="+12% this month" />
        <StatsCard title="Tokens Used" value={formatNumber(analytics?.tokens_used ?? 0)} icon={Zap} color="#8B5CF6" />
        <StatsCard title="Files Analyzed" value={analytics?.files_analyzed ?? 0} icon={FileText} color="#06B6D4" />
        <StatsCard title="Images Generated" value={analytics?.images_generated ?? 0} icon={Image} color="#10B981" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UsageChart data={analytics?.monthly_usage ?? []} />
        </div>
        <ActivityFeed items={analytics?.recent_activity ?? []} />
      </div>
    </div>
  );
}
