import { apiClient } from 'src/services/apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginApiResponse {
  accessToken?: string;
  access_token?: string;
  token?: string;
  data?: {
    accessToken?: string;
    access_token?: string;
    token?: string;
  };
}

export async function login(credentials: LoginCredentials): Promise<LoginApiResponse> {
  if (!apiClient.defaults.baseURL) {
    throw new Error('VITE_API_BASE_URL no está configurada.');
  }

  const response = await apiClient.post<LoginApiResponse>('/api/v1/auth/login', credentials);

  return response.data;
}