/**
 * ScreenShell — Shared Layout Component
 *
 * Consistent screen wrapper with header (accent bar, title, subtitle)
 * and scrollable content area. Used by all feature module screens.
 *
 * @example
 * ```tsx
 * <ScreenShell title="Bãi xe" subtitle="Quản lý vị trí đỗ xe">
 *   <YardGrid />
 * </ScreenShell>
 * ```
 */
import React, { type ReactNode } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { palette, radii, spacing } from '@/core/theme';

interface ScreenShellProps {
  /** Screen title */
  title: string;
  /** Screen subtitle */
  subtitle: string;
  /** Screen content */
  children: ReactNode;
  /** Hide the decorative header card */
  hideHeader?: boolean;
}

export function ScreenShell({
  title,
  subtitle,
  children,
  hideHeader = false,
}: ScreenShellProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        {!hideHeader ? (
          <View style={styles.header}>
            <View style={styles.accentBar} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    overflow: 'hidden',
  },
  accentBar: {
    height: 4,
    width: 72,
    borderRadius: 9999,
    backgroundColor: palette.accent,
    marginBottom: spacing.md,
  },
  title: {
    color: palette.text,
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
