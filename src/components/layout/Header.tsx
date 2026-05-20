"use client";

import { useState } from "react";
import { Play, Pause, RefreshCw } from "lucide-react";
import type { BotStats } from "@/types";
import { formatUptime, timeAgo } from "@/lib/utils";
import { startBot, stopBot } from "@/lib/api";

const statusConfig = {
  running: { dot: "bg-green-500", label: "Running", labelClass: "text-green-700" },
  paused: { dot: "bg-yellow-400", label: "Paused", labelClass: "text-yellow-700" },
  stopped: { dot: "bg-gray-400", label: "Stopped", labelClass: "text-gray-600" },
  error: { dot: "bg-red-500", label: "Error", labelClass: "text-red-700" },
};

export function Header({ stats, onRefresh }: { stats: BotStats; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const cfg = statusConfig[stats.status];

  async function toggleBot() {
    setLoading(true);
    try {
      if (stats.status === "running") await stopBot();
      else await startBot();
      onRefresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
          <span className={`text-sm font-medium ${cfg.labelClass}`}>{cfg.label}</span>
        </div>
        <span className="text-gray-300">|</span>
        <span className="text-xs text-gray-500">
          Uptime: <span className="font-medium text-gray-700">{formatUptime(stats.uptimeSeconds)}</span>
        </span>
        <span className="text-xs text-gray-500">
          Last scan: <span className="font-medium text-gray-700">{timeAgo(stats.lastScanAt)}</span>
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onRefresh}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={toggleBot}
          disabled={loading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            stats.status === "running"
              ? "bg-red-50 text-red-700 hover:bg-red-100"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          {stats.status === "running" ? (
            <><Pause className="w-3.5 h-3.5" /> Stop Bot</>
          ) : (
            <><Play className="w-3.5 h-3.5" /> Start Bot</>
          )}
        </button>
      </div>
    </header>
  );
}
