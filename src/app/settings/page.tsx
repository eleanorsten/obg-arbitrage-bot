"use client";

import { useEffect, useState, useCallback } from "react";
import { Save, AlertTriangle } from "lucide-react";
import { fetchSettings, saveSettings, fetchStats } from "@/lib/api";
import type { BotSettings, BotStats, Exchange, OilGrade } from "@/types";
import { Header } from "@/components/layout/Header";

const ALL_EXCHANGES: Exchange[] = ["NYMEX", "ICE", "CME", "DME", "SGX"];
const ALL_GRADES: OilGrade[] = ["WTI", "Brent", "Dubai", "Mars", "LLS"];

export default function SettingsPage() {
  const [stats, setStats] = useState<BotStats | null>(null);
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const load = useCallback(async () => {
    const [s, cfg] = await Promise.all([fetchStats(), fetchSettings()]);
    setStats(s);
    setSettings(cfg);
  }, []);

  useEffect(() => { load(); }, [load]);

  function update<K extends keyof BotSettings>(key: K, value: BotSettings[K]) {
    setSettings((prev) => prev ? { ...prev, [key]: value } : prev);
    setDirty(true);
    setSaved(false);
  }

  function toggleArrayItem<T>(arr: T[], item: T): T[] {
    return arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item];
  }

  async function handleSave() {
    if (!settings) return;
    await saveSettings(settings);
    setSaved(true);
    setDirty(false);
  }

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  return (
    <>
      {stats && <Header stats={stats} onRefresh={load} />}
      <main className="flex-1 p-6 max-w-2xl space-y-6">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure bot behavior and trading thresholds.
          </p>
        </div>

        {/* Risk & thresholds */}
        <section className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3">
            Risk & Thresholds
          </h2>

          <div className="grid grid-cols-2 gap-5">
            <Field label="Min Profit %" hint="Ignore opportunities below this threshold">
              <input
                type="number"
                value={settings.minProfitPct}
                onChange={(e) => update("minProfitPct", Number(e.target.value))}
                min={0.1}
                max={10}
                step={0.1}
                className="input"
              />
            </Field>

            <Field label="Max Position Size (bbl)" hint="Maximum barrels per single trade">
              <input
                type="number"
                value={settings.maxPositionSizeBarrels}
                onChange={(e) => update("maxPositionSizeBarrels", Number(e.target.value))}
                min={100}
                max={100000}
                step={100}
                className="input"
              />
            </Field>

            <Field label="Max Open Positions" hint="Concurrent open trades allowed">
              <input
                type="number"
                value={settings.maxOpenPositions}
                onChange={(e) => update("maxOpenPositions", Number(e.target.value))}
                min={1}
                max={20}
                className="input"
              />
            </Field>

            <Field label="Scan Interval (s)" hint="How often the bot scans for new opportunities">
              <input
                type="number"
                value={settings.scanIntervalSeconds}
                onChange={(e) => update("scanIntervalSeconds", Number(e.target.value))}
                min={1}
                max={60}
                className="input"
              />
            </Field>
          </div>
        </section>

        {/* Auto-trade */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
            Execution Mode
          </h2>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoTrade}
              onChange={(e) => update("autoTrade", e.target.checked)}
              className="mt-0.5 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-execute trades</p>
              <p className="text-xs text-gray-500 mt-0.5">
                When enabled, the bot executes qualifying opportunities automatically without manual confirmation.
              </p>
            </div>
          </label>
          {settings.autoTrade && (
            <div className="mt-3 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Auto-trade is enabled. The bot will place real orders automatically.
            </div>
          )}
        </section>

        {/* Exchanges */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
            Enabled Exchanges
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_EXCHANGES.map((ex) => {
              const active = settings.enabledExchanges.includes(ex);
              return (
                <button
                  key={ex}
                  onClick={() =>
                    update("enabledExchanges", toggleArrayItem(settings.enabledExchanges, ex))
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    active
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                  }`}
                >
                  {ex}
                </button>
              );
            })}
          </div>
        </section>

        {/* Oil grades */}
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-3 mb-4">
            Monitored Oil Grades
          </h2>
          <div className="flex flex-wrap gap-2">
            {ALL_GRADES.map((grade) => {
              const active = settings.enabledGrades.includes(grade);
              return (
                <button
                  key={grade}
                  onClick={() =>
                    update("enabledGrades", toggleArrayItem(settings.enabledGrades, grade))
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    active
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                  }`}
                >
                  {grade}
                </button>
              );
            })}
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">Settings saved.</span>
          )}
        </div>
      </main>
    </>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-gray-900">{label}</label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <div className="[&_.input]:w-full [&_.input]:px-3 [&_.input]:py-1.5 [&_.input]:text-sm [&_.input]:border [&_.input]:border-gray-200 [&_.input]:rounded-lg [&_.input]:focus:outline-none [&_.input]:focus:ring-1 [&_.input]:focus:ring-blue-500">
        {children}
      </div>
    </div>
  );
}
