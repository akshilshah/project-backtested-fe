// API Endpoints for Trading Management System

export const S3_ASSETS_BASE_URL = 'https://backtested-assets.s3.ap-south-1.amazonaws.com';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    SIGNUP: '/api/auth/signup',
    PROFILE: '/api/auth/profile',
    SETTINGS: '/api/auth/settings',
  },

  // Coins (Master Data)
  COINS: {
    LIST: '/api/masters/coins',
    CREATE: '/api/masters/coins',
    DETAILS: (id: string) => `/api/masters/coins/${id}`,
    UPDATE: (id: string) => `/api/masters/coins/${id}`,
    DELETE: (id: string) => `/api/masters/coins/${id}`,
  },

  // Strategies (Master Data)
  STRATEGIES: {
    LIST: '/api/masters/strategies',
    CREATE: '/api/masters/strategies',
    DETAILS: (id: string) => `/api/masters/strategies/${id}`,
    UPDATE: (id: string) => `/api/masters/strategies/${id}`,
    DELETE: (id: string) => `/api/masters/strategies/${id}`,
  },

  // Trades
  TRADES: {
    LIST: '/api/trades',
    CREATE: '/api/trades',
    DETAILS: (id: string) => `/api/trades/${id}`,
    UPDATE: (id: string) => `/api/trades/${id}`,
    DELETE: (id: string) => `/api/trades/${id}`,
    EXIT: (id: string) => `/api/trades/${id}/exit`,
    ANALYTICS: '/api/trades/analytics',
  },
} as const;
