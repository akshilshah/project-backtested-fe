import type {
  Trade,
  TradeResponse,
  TradeFilters,
  TradeAnalytics,
  CreateTradeRequest,
  UpdateTradeRequest,
  ExitTradeRequest,
  TradesListResponse,
  TradeAnalyticsResponse,
} from 'src/types/trade';
import type { PaginationParams } from 'src/types/api';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export type TradeQueryParams = PaginationParams & TradeFilters;

export class TradesService {
  static async getAll(params?: TradeQueryParams): Promise<TradesListResponse> {
    const response = await axios.get<TradesListResponse>(endpoints.trades.list, { params });
    return response.data;
  }

  static async getById(id: string): Promise<Trade> {
    const response = await axios.get<TradeResponse>(endpoints.trades.details(id));
    return response.data.data;
  }

  static async create(data: CreateTradeRequest): Promise<Trade> {
    const response = await axios.post<TradeResponse>(endpoints.trades.create, data);
    return response.data.data;
  }

  static async update(id: string, data: UpdateTradeRequest): Promise<Trade> {
    const response = await axios.put<TradeResponse>(endpoints.trades.update(id), data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await axios.delete(endpoints.trades.delete(id));
  }

  static async exit(id: string, data: ExitTradeRequest): Promise<Trade> {
    const response = await axios.post<TradeResponse>(endpoints.trades.exit(id), data);
    return response.data.data;
  }

  static async getAnalytics(params?: TradeFilters): Promise<TradeAnalytics> {
    const response = await axios.get<TradeAnalyticsResponse>(endpoints.trades.analytics, {
      params,
    });
    return response.data.data;
  }
}
