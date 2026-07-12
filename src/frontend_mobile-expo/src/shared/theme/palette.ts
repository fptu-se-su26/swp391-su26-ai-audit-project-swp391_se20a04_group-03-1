/**
 * Stitch Design System — Color Palette
 *
 * Single source of truth for all color values across the app.
 * Organized into semantic groups for easy consumption.
 */

/** Background & surface colors — neutral dark (đồng bộ web LogiPort). */
export const backgrounds = {
  bg: '#0b0f14',
  bgDeep: '#06090c',
  surface: '#121821',
  surfaceAlt: '#0e141c',
  surfaceMuted: '#1a232e',
} as const;

/** Border colors (with alpha) — xanh LogiPort. */
export const borders = {
  borderSoft: 'rgba(30, 215, 96, 0.22)',
  borderStrong: 'rgba(30, 215, 96, 0.34)',
} as const;

/** Accent & semantic colors — LogiPort green (#1ed760). */
export const accents = {
  accent: '#1ed760',
  accentSoft: '#4ade80',
  accentHover: '#22e56a',
  success: '#1ed760',
  warning: '#f4ac1c',
  danger: '#ef4444',
  info: '#3b82f6',
} as const;

/** Text colors — from brightest to most muted */
export const texts = {
  text: '#f8fafc',
  textSoft: '#e2e8f0',
  textMuted: '#cbd5e1',
  textSubtle: '#94a3b8',
  ink: '#05140b',
} as const;

/**
 * Unified palette — backward-compatible flat export.
 * Prefer using the grouped exports above for new code.
 */
export const palette = {
  ...backgrounds,
  ...borders,
  ...accents,
  ...texts,
} as const;

export type PaletteKey = keyof typeof palette;
