import { apiClient } from '../client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  restaurantName: string;
  phone: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tenant?: {
    id: string;
    email: string;
    role: string;
  };
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export const authService = {
  // Tenant authentication
  tenantLogin: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/tenant/login', data),

  tenantSignup: (data: SignupRequest) =>
    apiClient.post<AuthResponse>('/auth/tenant/signup', data),

  // Staff authentication
  staffLogin: (data: LoginRequest) =>
    apiClient.post<AuthResponse>('/auth/staff/login', data),

  // Token refresh
  refreshToken: (refreshToken: string) =>
    apiClient.post<AuthResponse>('/auth/refresh', { refreshToken }),

  // Logout
  logout: () => apiClient.post('/auth/logout', {}),
};
