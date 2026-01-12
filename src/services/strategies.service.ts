import type { QueryParams } from 'src/types/api';
import type {
  Strategy,
  StrategyResponse,
  CreateStrategyRequest,
  UpdateStrategyRequest,
  StrategiesListResponse,
} from 'src/types/strategy';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export class StrategiesService {
  static async getAll(params?: QueryParams): Promise<StrategiesListResponse> {
    const response = await axios.get<{ data: StrategiesListResponse }>(endpoints.strategies.list, { params });
    return response.data.data;
  }

  static async getById(id: string | number): Promise<Strategy> {
    const response = await axios.get<StrategyResponse>(endpoints.strategies.details(String(id)));
    return response.data.data;
  }

  static async create(data: CreateStrategyRequest): Promise<Strategy> {
    const response = await axios.post<StrategyResponse>(endpoints.strategies.create, data);
    return response.data.data;
  }

  static async update(id: string | number, data: UpdateStrategyRequest): Promise<Strategy> {
    const response = await axios.put<StrategyResponse>(endpoints.strategies.update(String(id)), data);
    return response.data.data;
  }

  static async delete(id: string | number): Promise<void> {
    await axios.delete(endpoints.strategies.delete(String(id)));
  }
}
