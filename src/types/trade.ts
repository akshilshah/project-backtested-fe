// Trade Types

export type TradeStatus = 'OPEN' | 'CLOSED';

export interface Trade {
  id: number;
  coinId: number;
  coin?: {
    id: number;
    symbol: string;
    name: string;
  };
  strategyId: number;
  strategy?: {
    id: number;
    name: string;
  };
  status: TradeStatus;
  tradeDate: string;
  tradeTime: string;
  avgEntry: number;
  stopLoss: number;
  stopLossPercentage: number;
  quantity: number;
  amount: number;
  notes?: string;
  exitDate?: string;
  exitTime?: string;
  avgExit?: number;
  profitLoss?: number;
  profitLossPercentage?: number;
  duration?: number;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
  derived?: {
    direction: 'Long' | 'Short';
    tradeValue: number;
    commission: number;
  };
}

export interface CreateTradeRequest {
  coinId: number;
  strategyId: number;
  tradeDate: string;
  tradeTime: string;
  avgEntry: number;
  stopLoss: number;
  stopLossPercentage: number;
  quantity: number;
  amount: number;
  notes?: string;
}

export interface UpdateTradeRequest {
  coinId?: number;
  strategyId?: number;
  tradeDate?: string;
  tradeTime?: string;
  avgEntry?: number;
  stopLoss?: number;
  stopLossPercentage?: number;
  quantity?: number;
  amount?: number;
  notes?: string;
}

export interface ExitTradeRequest {
  exitDate: string;
  exitTime: string;
  avgExit: number;
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
    strategyId: number;
    strategyName: string;
    trades: number;
    winRate: number;
    profitLoss: number;
  }[];
  byCoin: {
    coinId: number;
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
  coinId?: number;
  strategyId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
