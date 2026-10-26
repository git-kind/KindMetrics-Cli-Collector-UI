import axios from 'axios';
import { getAccessToken } from 'src/services/session/sessionService';

const configuredApiBaseUrl = process.env.VITE_API_BASE_URL;
const apiBaseUrl = (configuredApiBaseUrl || (process.env.NODE_ENV === 'development'
  ? 'http://127.0.0.1:3010/api/v1'
  : undefined))?.replace(/\/+$/, '');

export const apiClient = axios.create({
  ...(apiBaseUrl ? { baseURL: apiBaseUrl } : {}),
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

export function withCompanyCode(headers: Record<string, string> = {}, companyCode?: string | null): Record<string, string> {
  const nextHeaders = { ...headers };

  if (companyCode) {
    nextHeaders['X-Company-Code'] = companyCode;
  } else {
    delete nextHeaders['X-Company-Code'];
  }

  delete nextHeaders['X-Company-Id'];
  delete nextHeaders['X-Company-ID'];
  delete nextHeaders['x-company-id'];

  return nextHeaders;
}

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});