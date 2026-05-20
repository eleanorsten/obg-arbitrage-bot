import type { Trade } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatUSD, timeAgo } from "@/lib/utils";

const statusVariant: Record<
  Trade["status"],
  "green" | "blue" | "gray" | "red"
> = {
  closed: "gray",
  open: "blue",
  pending: "yellow" as never,
  cancelled: "red",
};

export function RecentTrades({ trades }: { trades: Trade[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            {["Time", "Trade", "Buy Price", "Sell Price", "Volume", "Net P&L", "Status"].map(
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
          {trades.map((trade) => (
            <tr key={trade.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-xs text-gray-500">
                {timeAgo(trade.openedAt)}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">
                  {trade.buyGrade} → {trade.sellGrade}
                </div>
                <div className="text-xs text-gray-500">
                  {trade.buyExchange} → {trade.sellExchange}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-700">
                {formatUSD(trade.buyPrice)}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {formatUSD(trade.sellPrice)}
              </td>
              <td className="px-4 py-3 text-gray-700">
                {trade.volume.toLocaleString()} bbl
              </td>
              <td className="px-4 py-3">
                <span
                  className={`font-semibold ${
                    trade.netProfit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trade.netProfit >= 0 ? "+" : ""}
                  {formatUSD(trade.netProfit)}
                </span>
              </td>
              <td className="px-4 py-3">
                <Badge variant={statusVariant[trade.status]}>
                  {trade.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
