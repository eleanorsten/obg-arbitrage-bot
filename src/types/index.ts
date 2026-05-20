export type OilGrade = "WTI" | "Brent" | "Dubai" | "Mars" | "LLS";
export type Exchange = "NYMEX" | "ICE" | "CME" | "DME" | "SGX";
export type BotStatus = "running" | "paused" | "stopped" | "error";
export type TradeStatus = "open" | "closed" | "cancelled" | "pending";
export type ArbitrageType = "inter-exchange" | "inter-grade" | "time-spread";

export interface ArbitrageOpportunity {
  id: string;
  type: ArbitrageType;
  buyGrade: OilGrade;
  buyExchange: Exchange;
  buyPrice: number;
  sellGrade: OilGrade;
  sellExchange: Exchange;
  sellPrice: number;
  spread: number;
  profitPct: number;
  estimatedProfit: number;
  volume: number;
  expiresInSeconds: number;
  detectedAt: string;
}

export interface Trade {
  id: string;
  opportunityId: string;
  type: ArbitrageType;
  buyGrade: OilGrade;
  buyExchange: Exchange;
  buyPrice: number;
  sellGrade: OilGrade;
  sellExchange: Exchange;
  sellPrice: number;
  volume: number;
  grossProfit: number;
  fees: number;
  netProfit: number;
  status: TradeStatus;
  openedAt: string;
  closedAt?: string;
}

export interface BotStats {
  status: BotStatus;
  uptimeSeconds: number;
  totalPnlToday: number;
  totalPnlAllTime: number;
  tradesTotal: number;
  tradesWon: number;
  tradesLost: number;
  openPositions: number;
  opportunitiesScanned: number;
  lastScanAt: string;
}

export interface PnlDataPoint {
  timestamp: string;
  cumPnl: number;
  pnl: number;
}

export interface BotSettings {
  minProfitPct: number;
  maxPositionSizeBarrels: number;
  maxOpenPositions: number;
  scanIntervalSeconds: number;
  enabledExchanges: Exchange[];
  enabledGrades: OilGrade[];
  autoTrade: boolean;
}
