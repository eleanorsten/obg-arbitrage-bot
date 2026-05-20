"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Filter } from "lucide-react";
import { fetchOpportunities, fetchStats } from "@/lib/api";
import type { ArbitrageOpportunity, BotStats } from "@/types";
import { Header } from "@/components/layout/Header";
import { OpportunitiesTable } from "@/components/dashboard/OpportunitiesTable";

type TypeFilter = ArbitrageOpportunity["type"] | "all";

export default function OpportunitiesPage() {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [minProfit, setMinProfit] = useState(0);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    const [s, o] = await Promise.all([fetchStats(), fetchOpportunities()]);
    setStats(s);
    setOpportunities(o);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = opportunities.filter((o) => {
    if (typeFilter !== "all" && o.type !== typeFilter) return false;
    if (o.profitPct < minProfit) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !o.buyGrade.toLowerCase().includes(q) &&
        !o.sellGrade.toLowerCase().includes(q) &&
        !o.buyExchange.toLowerCase().includes(q) &&
        !o.sellExchange.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  return (
    <>
      {stats && <Header stats={stats} onRefresh={load} />}
      <main className="flex-1 p-6 space-y-4">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Live Opportunities</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All detected arbitrage opportunities, refreshing every 8 seconds.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-medium text-gray-600">Filters</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Grade or exchange..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 w-44"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All types</option>
            <option value="inter-grade">Cross-Grade</option>
            <option value="inter-exchange">Cross-Exchange</option>
            <option value="time-spread">Time Spread</option>
          </select>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-600 font-medium">Min profit</label>
            <input
              type="number"
              value={minProfit}
              onChange={(e) => setMinProfit(Number(e.target.value))}
              min={0}
              max={10}
              step={0.1}
              className="w-20 px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-xs text-gray-500">%</span>
          </div>

          <span className="ml-auto text-xs text-gray-500">
            {filtered.length} of {opportunities.length} shown
          </span>
        </div>

        <div className="bg-white rounded-xl border border-gray-200">
          <OpportunitiesTable opportunities={filtered} />
        </div>
      </main>
    </>
  );
}
