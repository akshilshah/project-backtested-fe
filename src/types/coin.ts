// Coin Types

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  organizationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateCoinRequest {
  symbol: string;
  name: string;
}

export interface UpdateCoinRequest {
  symbol?: string;
  name?: string;
}

export interface CoinResponse {
  success: boolean;
  data: Coin;
}

export interface CoinsListResponse {
  success: boolean;
  data: Coin[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
