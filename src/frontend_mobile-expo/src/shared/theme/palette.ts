/**
 * Stitch Design System — Color Palette
 *
 * Single source of truth for all color values across the app.
 * Organized into semantic groups for easy consumption.
 */

/** Background & surface colors */
export const backgrounds = {
  bg: '#091122',
  bgDeep: '#050b14',
  surface: '#101b31',
  surfaceAlt: '#0f1a2a',
  surfaceMuted: '#18243d',
} as const;

/** Border colors (with alpha) */
export const borders = {
  borderSoft: 'rgba(184, 140, 69, 0.32)',
  borderStrong: 'rgba(246, 192, 106, 0.26)',
} as const;

/** Accent & semantic colors */
export const accents = {
  accent: '#f6b11c',
  accentSoft: '#f6c06a',
  accentHover: '#ffbf3f',
  success: '#4dd7a5',
  warning: '#f4ac1c',
  danger: '#ef7c54',
  info: '#79a8ff',
} as const;

/** Text colors — from brightest to most muted */
export const texts = {
  text: '#f8fafc',
  textSoft: '#e2e8f0',
  textMuted: '#cbd5e1',
  textSubtle: '#94a3b8',
  ink: '#111827',
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
