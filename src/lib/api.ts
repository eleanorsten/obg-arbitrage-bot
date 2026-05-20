/**
 * API client — swap BASE_URL to point at the real backend.
 * All functions fall back to mock data until the backend is ready.
 */

import type {
  ArbitrageOpportunity,
  BotSettings,
  BotStats,
  PnlDataPoint,
  Trade,
} from "@/types";
import {
  mockOpportunities,
  mockPnlHistory,
  mockSettings,
  mockStats,
  mockTrades,
} from "./mockData";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const USE_MOCK = !BASE_URL;

async function get<T>(path: string, fallback: T): Promise<T> {
  if (USE_MOCK) return fallback;
  const res = await fetch(`${BASE_URL}${path}`, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown, fallback: T): Promise<T> {
  if (USE_MOCK) return fallback;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

// GET /api/stats
export const fetchStats = () => get<BotStats>("/api/stats", mockStats);

// GET /api/opportunities
export const fetchOpportunities = () =>
  get<ArbitrageOpportunity[]>("/api/opportunities", mockOpportunities);

// GET /api/trades?limit=N
export const fetchTrades = (limit = 50) =>
  get<Trade[]>(`/api/trades?limit=${limit}`, mockTrades);

// GET /api/pnl?period=24h
export const fetchPnlHistory = (period = "24h") =>
  get<PnlDataPoint[]>(`/api/pnl?period=${period}`, mockPnlHistory);

// GET /api/settings
export const fetchSettings = () =>
  get<BotSettings>("/api/settings", mockSettings);

// POST /api/settings
export const saveSettings = (settings: BotSettings) =>
  post<BotSettings>("/api/settings", settings, settings);

// POST /api/bot/start
export const startBot = () =>
  post<{ ok: boolean }>("/api/bot/start", {}, { ok: true });

// POST /api/bot/stop
export const stopBot = () =>
  post<{ ok: boolean }>("/api/bot/stop", {}, { ok: true });

// POST /api/trades/:id/execute
export const executeTrade = (opportunityId: string) =>
  post<{ tradeId: string }>(`/api/opportunities/${opportunityId}/execute`, {}, {
    tradeId: `trd-${Date.now()}`,
  });
