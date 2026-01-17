import type { PaginationParams } from 'src/types/api';
import type {
  BacktestTrade,
  BacktestFilters,
  BacktestAnalytics,
  BacktestTradeResponse,
  BacktestAnalyticsResponse,
  CreateBacktestTradeRequest,
  UpdateBacktestTradeRequest,
  BacktestTradesListResponse,
} from 'src/types/backtest';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export type BacktestQueryParams = PaginationParams & BacktestFilters;

export class BacktestService {
  static async getAll(params?: BacktestQueryParams): Promise<BacktestTradesListResponse> {
    const response = await axios.get<{ data: BacktestTradesListResponse }>(
      endpoints.backtest.list,
      { params }
    );
    return response.data.data;
  }

  static async getById(id: string | number): Promise<BacktestTrade> {
    const response = await axios.get<BacktestTradeResponse>(
      endpoints.backtest.details(String(id))
    );
    return response.data.data;
  }

  static async create(data: CreateBacktestTradeRequest): Promise<BacktestTrade> {
    const response = await axios.post<BacktestTradeResponse>(endpoints.backtest.create, data);
    return response.data.data;
  }

  static async update(
    id: string | number,
    data: UpdateBacktestTradeRequest
  ): Promise<BacktestTrade> {
    const response = await axios.put<BacktestTradeResponse>(
      endpoints.backtest.update(String(id)),
      data
    );
    return response.data.data;
  }

  static async delete(id: string | number): Promise<void> {
    await axios.delete(endpoints.backtest.delete(String(id)));
  }

  static async getStrategyAnalytics(strategyId: string | number): Promise<BacktestAnalytics> {
    const response = await axios.get<BacktestAnalyticsResponse>(
      endpoints.backtest.analytics(String(strategyId))
    );
    return response.data.data;
  }
}
