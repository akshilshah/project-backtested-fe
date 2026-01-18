// Coin Types

export interface Coin {
  id: number;
  symbol: string;
  name: string;
  image?: string;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
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
  coins: Coin[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
