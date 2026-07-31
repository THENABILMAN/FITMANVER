import axios, { AxiosError } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fitman_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ error?: { code: string; message: string } }>) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('fitman_refresh_token');
      if (refreshToken && !error.config?.url?.includes('/auth/refresh')) {
        try {
          const res = await axios.post(`${API_BASE}/auth/refresh`, { refresh_token: refreshToken });
          const data = res.data.data;
          localStorage.setItem('fitman_access_token', data.access_token);
          localStorage.setItem('fitman_refresh_token', data.refresh_token);
          if (error.config) {
            error.config.headers.Authorization = `Bearer ${data.access_token}`;
            return api.request(error.config);
          }
        } catch {
          localStorage.removeItem('fitman_access_token');
          localStorage.removeItem('fitman_refresh_token');
          localStorage.removeItem('fitman_user');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: { code: string; message: string };
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error?.message || error.message || 'An error occurred';
  }
  return 'An error occurred';
}
