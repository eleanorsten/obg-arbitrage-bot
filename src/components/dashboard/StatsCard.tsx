import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  iconBg?: string;
}

export function StatsCard({ title, value, subValue, icon: Icon, trend, iconBg = "bg-blue-50" }: StatsCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
          <p
            className={cn(
              "mt-1 text-2xl font-bold",
              trend === "up" && "text-green-600",
              trend === "down" && "text-red-600",
              (!trend || trend === "neutral") && "text-gray-900"
            )}
          >
            {value}
          </p>
          {subValue && <p className="mt-0.5 text-xs text-gray-500">{subValue}</p>}
        </div>
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", iconBg)}>
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
}
