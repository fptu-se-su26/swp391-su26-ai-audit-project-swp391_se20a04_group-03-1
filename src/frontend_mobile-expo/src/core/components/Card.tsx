/**
 * Card — Shared UI Component
 *
 * A flexible card container with optional header, content, and footer sections.
 * Built with React Native primitives, replacing the old web div-based card.
 *
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader title="Summary" subtitle="Today's overview" />
 *   <CardContent>
 *     <Text>Card body goes here</Text>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>Action</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
import React, { type ReactNode } from 'react';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { palette, radii, spacing } from '@/core/theme';

// ─── Card Container ──────────────────────────────────────────────────────────

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ─── Card Header ─────────────────────────────────────────────────────────────

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: ViewStyle;
}

export function CardHeader({ title, subtitle, action, style }: CardHeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

// ─── Card Content ────────────────────────────────────────────────────────────

interface CardContentProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function CardContent({ children, style }: CardContentProps) {
  return <View style={[styles.content, style]}>{children}</View>;
}

// ─── Card Footer ─────────────────────────────────────────────────────────────

interface CardFooterProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function CardFooter({ children, style }: CardFooterProps) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 13,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.borderSoft,
    backgroundColor: palette.surfaceAlt,
  },
});
