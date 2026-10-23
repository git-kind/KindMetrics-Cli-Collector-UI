import axios from 'axios';
import { getAccessToken } from 'src/services/session/authSession';

const apiBaseUrl = process.env.VITE_API_BASE_URL?.replace(/\/+$/, '');

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