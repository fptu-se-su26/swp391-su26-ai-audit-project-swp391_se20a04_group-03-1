/**
 * Axios HTTP Client
 *
 * Pre-configured Axios instance with interceptors for auth tokens
 * and centralized error handling. Import this everywhere instead of
 * raw `axios`.
 */
import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import * as SecureStore from 'expo-secure-store';
import { config } from '@/shared/config';

const AUTH_TOKEN_KEY = 'auth_token';

/** Configured Axios instance */
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request interceptor: attach Bearer token ────────────────────────────────
apiClient.interceptors.request.use(
  async (req: InternalAxiosRequestConfig) => {
    try {
      const token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
      if (token && req.headers) {
        req.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore may be unavailable on web — fail silently
    }
    return req;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response interceptor: normalize errors ──────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (__DEV__) {
      console.warn(
        `[API] ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        error.response?.status,
        error.response?.data,
      );
    }
    return Promise.reject(error);
  },
);

// ─── Token helpers ───────────────────────────────────────────────────────────
export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
}

export async function clearAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync(AUTH_TOKEN_KEY);
}

export async function getAuthToken(): Promise<string | null> {
  return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
}
