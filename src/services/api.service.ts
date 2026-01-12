import type { AxiosError, AxiosRequestConfig } from 'axios';
import type { ApiError, ApiResponse } from 'src/types/api';

import axios from 'src/lib/axios';

// ----------------------------------------------------------------------

export class ApiService {
  static async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.get<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiError>);
    }
  }

  static async post<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axios.post<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiError>);
    }
  }

  static async put<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.put<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiError>);
    }
  }

  static async patch<T, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig
  ): Promise<T> {
    try {
      const response = await axios.patch<ApiResponse<T>>(url, data, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiError>);
    }
  }

  static async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await axios.delete<ApiResponse<T>>(url, config);
      return response.data.data;
    } catch (error) {
      throw this.handleError(error as AxiosError<ApiError>);
    }
  }

  private static handleError(error: AxiosError<ApiError>): Error {
    if (error.response) {
      const message = error.response.data?.message || 'An error occurred';
      const apiError = new Error(message) as Error & { status?: number; errors?: unknown };
      apiError.status = error.response.status;
      apiError.errors = error.response.data?.errors;
      return apiError;
    }

    if (error.request) {
      return new Error('No response received from server');
    }

    return new Error(error.message || 'An error occurred');
  }
}
