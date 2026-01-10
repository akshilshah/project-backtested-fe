import type {
  Strategy,
  StrategyResponse,
  CreateStrategyRequest,
  UpdateStrategyRequest,
  StrategiesListResponse,
} from 'src/types/strategy';
import type { QueryParams } from 'src/types/api';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export class StrategiesService {
  static async getAll(params?: QueryParams): Promise<StrategiesListResponse> {
    const response = await axios.get<{ data: StrategiesListResponse }>(endpoints.strategies.list, { params });
    return response.data.data;
  }

  static async getById(id: string): Promise<Strategy> {
    const response = await axios.get<StrategyResponse>(endpoints.strategies.details(id));
    return response.data.data;
  }

  static async create(data: CreateStrategyRequest): Promise<Strategy> {
    const response = await axios.post<StrategyResponse>(endpoints.strategies.create, data);
    return response.data.data;
  }

  static async update(id: string, data: UpdateStrategyRequest): Promise<Strategy> {
    const response = await axios.put<StrategyResponse>(endpoints.strategies.update(id), data);
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await axios.delete(endpoints.strategies.delete(id));
  }
}
