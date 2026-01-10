// Trade Types

export type TradeStatus = 'OPEN' | 'CLOSED';

export interface Trade {
  id: string;
  coinId: string;
  coin?: {
    id: string;
    symbol: string;
    name: string;
  };
  strategyId: string;
  strategy?: {
    id: string;
    name: string;
  };
  status: TradeStatus;
  tradeDate: string;
  tradeTime: string;
  entryPrice: number;
  stopLoss: number;
  quantity: number;
  notes?: string;
  exitDate?: string;
  exitTime?: string;
  exitPrice?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateTradeRequest {
  coinId: string;
  strategyId: string;
  tradeDate: string;
  tradeTime: string;
  entryPrice: number;
  stopLoss: number;
  quantity: number;
  notes?: string;
}

export interface UpdateTradeRequest {
  coinId?: string;
  strategyId?: string;
  tradeDate?: string;
  tradeTime?: string;
  entryPrice?: number;
  stopLoss?: number;
  quantity?: number;
  notes?: string;
}

export interface ExitTradeRequest {
  exitDate: string;
  exitTime: string;
  exitPrice: number;
  notes?: string;
}

export interface TradeResponse {
  success: boolean;
  data: Trade;
}

export interface TradesListResponse {
  success: boolean;
  trades: Trade[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TradeAnalytics {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winRate: number;
  totalProfitLoss: number;
  averageProfitLoss: number;
  bestTrade: number;
  worstTrade: number;
  byStrategy: {
    strategyId: string;
    strategyName: string;
    trades: number;
    winRate: number;
    profitLoss: number;
  }[];
  byCoin: {
    coinId: string;
    coinSymbol: string;
    coinName: string;
    trades: number;
    winRate: number;
    profitLoss: number;
  }[];
}

export interface TradeAnalyticsResponse {
  success: boolean;
  data: TradeAnalytics;
}

export interface TradeFilters {
  status?: TradeStatus;
  coinId?: string;
  strategyId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
