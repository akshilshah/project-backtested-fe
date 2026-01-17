import type { PaginationParams } from 'src/types/api';
import type {
  Trade,
  TradeFilters,
  TradeResponse,
  TradeAnalytics,
  ExitTradeRequest,
  PreviewExitRequest,
  PreviewExitResponse,
  CreateTradeRequest,
  UpdateTradeRequest,
  TradesListResponse,
  TradeAnalyticsResponse,
} from 'src/types/trade';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export type TradeQueryParams = PaginationParams & TradeFilters;

export class TradesService {
  static async getAll(params?: TradeQueryParams): Promise<TradesListResponse> {
    const response = await axios.get<{ data: TradesListResponse }>(endpoints.trades.list, { params });
    return response.data.data;
  }

  static async getById(id: string | number): Promise<Trade> {
    const response = await axios.get<TradeResponse>(endpoints.trades.details(String(id)));
    return response.data.data;
  }

  static async create(data: CreateTradeRequest): Promise<Trade> {
    const response = await axios.post<TradeResponse>(endpoints.trades.create, data);
    return response.data.data;
  }

  static async update(id: string | number, data: UpdateTradeRequest): Promise<Trade> {
    const response = await axios.put<TradeResponse>(endpoints.trades.update(String(id)), data);
    return response.data.data;
  }

  static async delete(id: string | number): Promise<void> {
    await axios.delete(endpoints.trades.delete(String(id)));
  }

  static async exit(id: string | number, data: ExitTradeRequest): Promise<Trade> {
    const response = await axios.post<TradeResponse>(endpoints.trades.exit(String(id)), data);
    return response.data.data;
  }

  static async updateExit(id: string | number, data: ExitTradeRequest): Promise<Trade> {
    const response = await axios.put<TradeResponse>(endpoints.trades.updateExit(String(id)), data);
    return response.data.data;
  }

  static async previewExit(
    id: string | number,
    data: PreviewExitRequest
  ): Promise<PreviewExitResponse> {
    const response = await axios.post<{ data: PreviewExitResponse }>(
      endpoints.trades.previewExit(String(id)),
      data
    );
    return response.data.data;
  }

  static async getAnalytics(params?: TradeFilters): Promise<TradeAnalytics> {
    const response = await axios.get<TradeAnalyticsResponse>(endpoints.trades.analytics, {
      params,
    });
    return response.data.data;
  }
}
