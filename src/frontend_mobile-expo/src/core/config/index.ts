/**
 * Environment & API Configuration
 *
 * Centralizes all runtime configuration. In production, these values
 * would come from expo-constants or a .env strategy.
 */
import Constants from 'expo-constants';

/** App environment */
export type AppEnv = 'development' | 'staging' | 'production';

const extra = Constants.expoConfig?.extra ?? {};

export const config = {
  /** Current environment */
  env: (extra.APP_ENV ?? 'development') as AppEnv,

  /** Backend API base URL (no trailing slash) */
  apiBaseUrl: (extra.API_BASE_URL as string) ?? 'http://localhost:8080/api',

  /** MJPEG video stream base URL */
  streamBaseUrl: (extra.STREAM_BASE_URL as string) ?? 'http://localhost:5001',

  /** SSE real-time endpoint */
  sseBaseUrl: (extra.SSE_BASE_URL as string) ?? 'http://localhost:8080/sse',

  /** Query client defaults */
  query: {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  },
} as const;

export type AppConfig = typeof config;
