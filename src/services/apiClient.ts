import axios from 'axios';
import { getAccessToken } from 'src/services/session/authSession';

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

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});