import type {
  Coin,
  CoinResponse,
  CreateCoinRequest,
  UpdateCoinRequest,
  CoinsListResponse,
} from 'src/types/coin';
import type { QueryParams } from 'src/types/api';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export class CoinsService {
  static async getAll(params?: QueryParams): Promise<CoinsListResponse> {
    const response = await axios.get<{ data: CoinsListResponse }>(endpoints.coins.list, { params });
    return response.data.data;
  }

  static async getById(id: string | number): Promise<Coin> {
    const response = await axios.get<CoinResponse>(endpoints.coins.details(String(id)));
    return response.data.data;
  }

  static async create(data: CreateCoinRequest): Promise<Coin> {
    const response = await axios.post<CoinResponse>(endpoints.coins.create, data);
    return response.data.data;
  }

  static async update(id: string | number, data: UpdateCoinRequest): Promise<Coin> {
    const response = await axios.put<CoinResponse>(endpoints.coins.update(String(id)), data);
    return response.data.data;
  }

  static async delete(id: string | number): Promise<void> {
    await axios.delete(endpoints.coins.delete(String(id)));
  }
}
