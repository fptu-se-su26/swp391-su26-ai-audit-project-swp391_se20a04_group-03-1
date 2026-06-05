/**
 * Style Utilities
 *
 * CVA-based variant helper adapted for React Native.
 * Since React Native doesn't use CSS class names, we use CVA only for
 * variant logic and map the resolved variant keys to StyleSheet styles.
 *
 * The `cn` function is kept for any web-rendering scenarios (expo-web).
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind/CSS class names (used for web rendering only).
 * On native, prefer StyleSheet.create + CVA variant keys.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
