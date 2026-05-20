"use client";

import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";
import type { ArbitrageOpportunity } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatUSD, formatPct, formatCountdown } from "@/lib/utils";
import { executeTrade } from "@/lib/api";

const typeLabel: Record<ArbitrageOpportunity["type"], string> = {
  "inter-exchange": "Cross-Exchange",
  "inter-grade": "Cross-Grade",
  "time-spread": "Time Spread",
};

const typeVariant: Record<
  ArbitrageOpportunity["type"],
  "blue" | "orange" | "green"
> = {
  "inter-exchange": "blue",
  "inter-grade": "orange",
  "time-spread": "green",
};

export function OpportunitiesTable({
  opportunities,
}: {
  opportunities: ArbitrageOpportunity[];
}) {
  const [executing, setExecuting] = useState<string | null>(null);

  async function handleExecute(opp: ArbitrageOpportunity) {
    setExecuting(opp.id);
    try {
      await executeTrade(opp.id);
      alert(`Trade executed for opportunity ${opp.id}`);
    } finally {
      setExecuting(null);
    }
  }

  if (opportunities.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No arbitrage opportunities detected yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {["Type", "Buy", "Sell", "Spread", "Profit %", "Est. Profit", "Expires In", "Action"].map(
              (h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {opportunities.map((opp) => (
            <tr key={opp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <Badge variant={typeVariant[opp.type]}>
                  {typeLabel[opp.type]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">{opp.buyGrade}</div>
                <div className="text-xs text-gray-500">
                  {opp.buyExchange} · {formatUSD(opp.buyPrice)}/bbl
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{opp.sellGrade}</div>
                    <div className="text-xs text-gray-500">
                      {opp.sellExchange} · {formatUSD(opp.sellPrice)}/bbl
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 font-medium text-gray-800">
                {formatUSD(opp.spread)}/bbl
              </td>
              <td className="px-4 py-3">
                <span
                  className={`font-semibold ${
                    opp.profitPct >= 1 ? "text-green-600" : "text-blue-600"
                  }`}
                >
                  {formatPct(opp.profitPct)}
                </span>
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">
                {formatUSD(opp.estimatedProfit)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-medium ${
                    opp.expiresInSeconds < 30
                      ? "text-red-600"
                      : opp.expiresInSeconds < 60
                      ? "text-yellow-600"
                      : "text-gray-600"
                  }`}
                >
                  {formatCountdown(opp.expiresInSeconds)}
                </span>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleExecute(opp)}
                  disabled={executing === opp.id}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  {executing === opp.id ? "..." : "Execute"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
