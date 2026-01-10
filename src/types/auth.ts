// Authentication Types

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: number;
  organization?: Organization;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface Organization {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  id: number;
  userId: number;
  currency: string;
  timezone: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  tableDensity: 'comfortable' | 'compact' | 'standard';
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignupResponse {
  success: boolean;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: User;
}

export interface AuthState {
  user: (User & { accessToken: string }) | null;
  loading: boolean;
}
