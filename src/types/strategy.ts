// Strategy Types

export interface Strategy {
  id: number;
  name: string;
  description?: string;
  rules?: Record<string, unknown>;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  updatedBy?: number;
}

export interface CreateStrategyRequest {
  name: string;
  description?: string;
  rules?: Record<string, unknown>;
}

export interface UpdateStrategyRequest {
  name?: string;
  description?: string;
  rules?: Record<string, unknown>;
}

export interface StrategyResponse {
  success: boolean;
  data: Strategy;
}

export interface StrategiesListResponse {
  success: boolean;
  strategies: Strategy[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
