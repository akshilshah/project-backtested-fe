import type {
  User,
  UserSettings,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  ProfileResponse,
} from 'src/types/auth';

import axios, { endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

export class AuthService {
  static async login(data: LoginRequest): Promise<LoginResponse['data']> {
    const response = await axios.post<LoginResponse>(endpoints.auth.login, data);
    return response.data.data;
  }

  static async signup(data: SignupRequest): Promise<SignupResponse['data']> {
    const response = await axios.post<SignupResponse>(endpoints.auth.signup, data);
    return response.data.data;
  }

  static async getProfile(): Promise<User> {
    const response = await axios.get<ProfileResponse>(endpoints.auth.profile);
    return response.data.data;
  }

  static async updateProfile(
    data: Partial<Pick<User, 'firstName' | 'lastName'>>
  ): Promise<User> {
    const response = await axios.put<ProfileResponse>(endpoints.auth.profile, data);
    return response.data.data;
  }

  static async getSettings(): Promise<UserSettings> {
    const response = await axios.get<{ success: boolean; data: UserSettings }>(
      endpoints.auth.settings
    );
    return response.data.data;
  }

  static async updateSettings(data: Partial<UserSettings>): Promise<UserSettings> {
    const response = await axios.put<{ success: boolean; data: UserSettings }>(
      endpoints.auth.settings,
      data
    );
    return response.data.data;
  }
}
