"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Activity,
  Target,
  BarChart2,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { OpportunitiesTable } from "@/components/dashboard/OpportunitiesTable";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { PnlChart } from "@/components/dashboard/PnlChart";
import {
  fetchStats,
  fetchOpportunities,
  fetchTrades,
  fetchPnlHistory,
} from "@/lib/api";
import type { BotStats, ArbitrageOpportunity, Trade, PnlDataPoint } from "@/types";
import { formatUSD, formatPct } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pnl, setPnl] = useState<PnlDataPoint[]>([]);

  const load = useCallback(async () => {
    const [s, o, t, p] = await Promise.all([
      fetchStats(),
      fetchOpportunities(),
      fetchTrades(6),
      fetchPnlHistory(),
    ]);
    setStats(s);
    setOpportunities(o);
    setTrades(t);
    setPnl(p);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  if (!stats) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  const winRate =
    stats.tradesTotal > 0
      ? ((stats.tradesWon / stats.tradesTotal) * 100).toFixed(1)
      : "0.0";

  return (
    <>
      <Header stats={stats} onRefresh={load} />

      <main className="flex-1 p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="P&L Today"
            value={formatUSD(stats.totalPnlToday)}
            subValue={`All-time: ${formatUSD(stats.totalPnlAllTime)}`}
            icon={DollarSign}
            trend={stats.totalPnlToday >= 0 ? "up" : "down"}
            iconBg="bg-green-50"
          />
          <StatsCard
            title="Win Rate"
            value={`${winRate}%`}
            subValue={`${stats.tradesWon}W / ${stats.tradesLost}L (${stats.tradesTotal} total)`}
            icon={Target}
            trend="neutral"
            iconBg="bg-blue-50"
          />
          <StatsCard
            title="Open Positions"
            value={String(stats.openPositions)}
            subValue="Max: 5 configured"
            icon={Activity}
            iconBg="bg-purple-50"
          />
          <StatsCard
            title="Opportunities"
            value={String(opportunities.length)}
            subValue={`${stats.opportunitiesScanned.toLocaleString()} scanned today`}
            icon={TrendingUp}
            iconBg="bg-orange-50"
          />
        </div>

        {/* P&L chart + best opportunity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-blue-600" />
                Cumulative P&L — Last 24 hours
              </h2>
            </div>
            <PnlChart data={pnl} />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              Best Opportunity Right Now
            </h2>
            {opportunities.length > 0 ? (
              (() => {
                const best = [...opportunities].sort(
                  (a, b) => b.profitPct - a.profitPct
                )[0];
                return (
                  <div className="space-y-3">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <p className="text-3xl font-bold text-green-600">
                        {formatPct(best.profitPct)}
                      </p>
                      <p className="text-xs text-green-700 mt-0.5">
                        Est. {formatUSD(best.estimatedProfit)}
                      </p>
                    </div>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Buy</span>
                        <span className="font-medium">
                          {best.buyGrade} @ {best.buyExchange}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Sell</span>
                        <span className="font-medium">
                          {best.sellGrade} @ {best.sellExchange}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Spread</span>
                        <span className="font-medium">
                          {formatUSD(best.spread)}/bbl
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Volume</span>
                        <span className="font-medium">
                          {best.volume.toLocaleString()} bbl
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-sm text-gray-400">No opportunities detected.</p>
            )}
          </div>
        </div>

        {/* Live opportunities */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">
              Live Arbitrage Opportunities
            </h2>
            <span className="text-xs text-gray-400">Auto-refreshes every 10s</span>
          </div>
          <OpportunitiesTable opportunities={opportunities} />
        </div>

        {/* Recent trades */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Recent Trades</h2>
            <a href="/history" className="text-xs text-blue-600 hover:underline">
              View all →
            </a>
          </div>
          <RecentTrades trades={trades} />
        </div>
      </main>
    </>
  );
}
