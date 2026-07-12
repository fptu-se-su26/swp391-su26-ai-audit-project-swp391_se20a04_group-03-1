/**
 * Environment & API Configuration
 *
 * Nguồn cấu hình runtime. Ưu tiên biến môi trường EXPO_PUBLIC_* (Expo SDK 56),
 * rồi tới app.json `extra`, rồi mặc định.
 */
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** App environment */
export type AppEnv = 'development' | 'staging' | 'production';

const extra = Constants.expoConfig?.extra ?? {};

/**
 * Trên Android EMULATOR, "localhost"/"127.0.0.1" trỏ về chính máy ảo, KHÔNG
 * phải máy chạy backend. Host của máy tính là alias 10.0.2.2. Tự đổi để dev
 * bằng emulator không phải cấu hình gì.
 *
 * LƯU Ý: điện thoại THẬT (Expo Go) không dùng được 10.0.2.2 — phải đặt
 * EXPO_PUBLIC_API_URL = http://<IP-LAN-máy-chạy-BE>:4000/api
 */
function resolveHostForAndroidEmulator(url: string): string {
  if (Platform.OS !== 'android') return url;
  return url.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2');
}

const rawApiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL ??
  (extra.API_BASE_URL as string) ??
  'http://localhost:4000/api';

export const config = {
  /** Current environment */
  env: (process.env.EXPO_PUBLIC_APP_ENV ?? extra.APP_ENV ?? 'development') as AppEnv,

  /**
   * Backend API base URL (no trailing slash). Backend LogiPort mặc định cổng 4000.
   */
  apiBaseUrl: resolveHostForAndroidEmulator(rawApiBaseUrl),

  /** MJPEG video stream base URL */
  streamBaseUrl: resolveHostForAndroidEmulator(
    process.env.EXPO_PUBLIC_STREAM_URL ??
      (extra.STREAM_BASE_URL as string) ??
      'http://localhost:5001',
  ),

  /** SSE real-time endpoint */
  sseBaseUrl: resolveHostForAndroidEmulator(
    process.env.EXPO_PUBLIC_SSE_URL ??
      (extra.SSE_BASE_URL as string) ??
      'http://localhost:8080/sse',
  ),

  /** Query client defaults */
  query: {
    staleTime: 30_000,
    gcTime: 5 * 60_000,
    retry: 2,
  },
} as const;

export type AppConfig = typeof config;
