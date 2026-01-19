// Backtest Trade Types

export interface BacktestTrade {
  id: number;
  coinId: number;
  coin?: {
    id: number;
    symbol: string;
    name: string;
    image?: string;
  };
  strategyId: number;
  strategy?: {
    id: number;
    name: string;
  };
  tradeDate: string;
  tradeTime: string;
  entry: number;
  stopLoss: number;
  exit: number;
  direction: 'Long' | 'Short';
  rValue: number;
  notes?: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateBacktestTradeRequest {
  coinId: number;
  strategyId: number;
  tradeDate: string;
  tradeTime: string;
  entry: number;
  stopLoss: number;
  exit: number;
  notes?: string;
}

export interface UpdateBacktestTradeRequest {
  coinId?: number;
  strategyId?: number;
  tradeDate?: string;
  tradeTime?: string;
  entry?: number;
  stopLoss?: number;
  exit?: number;
  notes?: string;
}

export interface BacktestTradeResponse {
  success: boolean;
  data: BacktestTrade;
}

export interface BacktestTradesListResponse {
  success: boolean;
  backtestTrades: BacktestTrade[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface BacktestAnalytics {
  strategyId: number;
  totalTrades: number;
  avgWinningR: number;
  avgLossR: number;
  winPercentage: number;
  lossPercentage: number;
  ev: number;
  wins: number;
  losses: number;
  daysTo100Trades: number | null;
}

export interface BacktestAnalyticsResponse {
  success: boolean;
  data: BacktestAnalytics;
}

export interface BacktestFilters {
  strategyId?: number;
  coinId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  direction?: 'Long' | 'Short';
  sortBy?: 'tradeDate' | 'rValue' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
