import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

import { CONFIG } from 'src/global-config';

import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem(JWT_STORAGE_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Something went wrong!';
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get<T>(url, config);

    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    login: '/api/auth/login',
    signup: '/api/auth/signup',
    profile: '/api/auth/profile',
    settings: '/api/auth/settings',
  },
  coins: {
    list: '/api/masters/coins',
    create: '/api/masters/coins',
    details: (id: string) => `/api/masters/coins/${id}`,
    update: (id: string) => `/api/masters/coins/${id}`,
    delete: (id: string) => `/api/masters/coins/${id}`,
  },
  strategies: {
    list: '/api/masters/strategies',
    create: '/api/masters/strategies',
    details: (id: string) => `/api/masters/strategies/${id}`,
    update: (id: string) => `/api/masters/strategies/${id}`,
    delete: (id: string) => `/api/masters/strategies/${id}`,
  },
  trades: {
    list: '/api/trades',
    create: '/api/trades',
    details: (id: string) => `/api/trades/${id}`,
    update: (id: string) => `/api/trades/${id}`,
    delete: (id: string) => `/api/trades/${id}`,
    exit: (id: string) => `/api/trades/${id}/exit`,
    analytics: '/api/trades/analytics',
  },
} as const;
