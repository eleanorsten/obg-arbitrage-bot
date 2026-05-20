"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchTrades, fetchStats, fetchPnlHistory } from "@/lib/api";
import type { Trade, BotStats, PnlDataPoint } from "@/types";
import { Header } from "@/components/layout/Header";
import { RecentTrades } from "@/components/dashboard/RecentTrades";
import { PnlChart } from "@/components/dashboard/PnlChart";
import { formatUSD } from "@/lib/utils";

export default function HistoryPage() {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [pnl, setPnl] = useState<PnlDataPoint[]>([]);

  const load = useCallback(async () => {
    const [s, t, p] = await Promise.all([
      fetchStats(),
      fetchTrades(50),
      fetchPnlHistory(),
    ]);
    setStats(s);
    setTrades(t);
    setPnl(p);
  }, []);

  useEffect(() => { load(); }, [load]);

  const closedTrades = trades.filter((t) => t.status === "closed");
  const totalNetPnl = closedTrades.reduce((sum, t) => sum + t.netProfit, 0);
  const totalFees = closedTrades.reduce((sum, t) => sum + t.fees, 0);
  const winners = closedTrades.filter((t) => t.netProfit > 0).length;

  return (
    <>
      {stats && <Header stats={stats} onRefresh={load} />}
      <main className="flex-1 p-6 space-y-5">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Trade History</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All executed trades and their outcomes.
          </p>
        </div>

        {/* Summary row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Net P&L", value: formatUSD(totalNetPnl), color: totalNetPnl >= 0 ? "text-green-600" : "text-red-600" },
            { label: "Total Fees Paid", value: formatUSD(totalFees), color: "text-gray-900" },
            { label: "Closed Trades", value: String(closedTrades.length), color: "text-gray-900" },
            { label: "Winners", value: closedTrades.length > 0 ? `${winners} (${((winners / closedTrades.length) * 100).toFixed(0)}%)` : "—", color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
              <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">
            Cumulative P&L — Last 24 hours
          </h2>
          <PnlChart data={pnl} />
        </div>

        {/* Trade table */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">All Trades</h2>
            <span className="text-xs text-gray-400">{trades.length} records</span>
          </div>
          <RecentTrades trades={trades} />
        </div>
      </main>
    </>
  );
}
