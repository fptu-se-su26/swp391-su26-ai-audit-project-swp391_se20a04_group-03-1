/**
 * Navigation theme for Expo Router / React Navigation.
 *
 * Uses our Stitch palette tokens so the navigator chrome
 * (headers, tab bars, etc.) matches the rest of the app.
 */
import { DarkTheme, type Theme } from '@react-navigation/native';
import { palette } from './palette';

export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: palette.bg,
    card: palette.surfaceAlt,
    primary: palette.accent,
    text: palette.text,
    border: palette.surfaceMuted,
    notification: palette.danger,
  },
};
