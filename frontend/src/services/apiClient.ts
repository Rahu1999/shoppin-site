import axios, { AxiosInstance, AxiosError } from 'axios';
import { useAuthStore } from '@/store/authStore';

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach Token
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Always send x-session-id so cart merge works after login
  const sessionId = typeof window !== 'undefined' ? localStorage.getItem('sessionId') : null;
  if (sessionId && config.headers) {
    config.headers['x-session-id'] = sessionId;
  } else if (!sessionId && typeof window !== 'undefined') {
    // Initialize guest session
    const newSessionId = crypto.randomUUID();
    localStorage.setItem('sessionId', newSessionId);
    if (config.headers) config.headers['x-session-id'] = newSessionId;
  }

  return config;
});

// Handle Token Refresh — single-flight: concurrent 401s share one refresh call.
// Without this, refresh-token rotation rejects the second parallel refresh and
// the user gets randomly logged out.
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const { data } = await axios.post(`${apiClient.defaults.baseURL}/auth/refresh`, {
    refreshToken,
  });

  localStorage.setItem('accessToken', data.data.accessToken);
  localStorage.setItem('refreshToken', data.data.refreshToken);
  useAuthStore.getState().setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data.accessToken;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const apiGet = async <T>(url: string, params?: any): Promise<T> => {
  const { data } = await apiClient.get(url, { params });
  return data.data || data; // Handle standard API response form {success, data}
};

export const apiPost = async <T>(url: string, payload?: any): Promise<T> => {
  const config = payload instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const { data } = await apiClient.post(url, payload, config);
  return data.data || data;
};

export const apiPut = async <T>(url: string, payload?: any): Promise<T> => {
  const { data } = await apiClient.put(url, payload);
  return data.data || data;
};

export const apiPatch = async <T>(url: string, payload?: any): Promise<T> => {
  const { data } = await apiClient.patch(url, payload);
  return data.data || data;
};

export const apiDelete = async <T>(url: string): Promise<T> => {
  const { data } = await apiClient.delete(url);
  return data.data || data;
};
