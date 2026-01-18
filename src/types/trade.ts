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
    description?: string;
    notes?: string;
  };
  status: TradeStatus;
  tradeDate: string;
  tradeTime: string;
  avgEntry: number;
  stopLoss: number;
  stopLossPercentage: number;
  quantity: number;
  amount: number;
  entryOrderType: 'MARKET' | 'LIMIT';
  entryFeePercentage: number;
  exitFeePercentage?: number;
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
  entryOrderType: 'MARKET' | 'LIMIT';
  entryFeePercentage: number;
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
  entryOrderType?: 'MARKET' | 'LIMIT';
  entryFeePercentage?: number;
  exitFeePercentage?: number;
  notes?: string;
}

export interface ExitTradeRequest {
  exitDate: string;
  exitTime: string;
  avgExit: number;
  exitFeePercentage: number;
  notes?: string;
}

export interface PreviewExitRequest {
  avgExit: number;
  exitFeePercentage?: number;
}

export interface PreviewExitResponse {
  profitLoss: number;
  profitLossPercentage: number;
  direction: 'Long' | 'Short';
  commission: number;
  grossProfitLoss: number;
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
  byDuration: {
    '0-30mins': number;
    '30mins-24hours': number;
    '1-7days': number;
    '1-4weeks': number;
    '4weeks+': number;
  };
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
