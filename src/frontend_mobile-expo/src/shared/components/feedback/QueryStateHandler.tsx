/**
 * QueryStateHandler — Shared Feedback Component
 *
 * Render helper for TanStack Query loading/error states.
 * Shows skeleton loaders during fetch, error states on failure,
 * and renders children on success.
 *
 * Migrated from the old project — already built with React Native primitives.
 *
 * @example
 * ```tsx
 * const { data, isLoading, isError } = useQuery({ ... });
 *
 * <QueryStateHandler isLoading={isLoading} isError={isError}>
 *   <DashboardContent data={data} />
 * </QueryStateHandler>
 * ```
 */
import React, { type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, radii, spacing } from '@/shared/theme';

// ─── Skeleton Block ──────────────────────────────────────────────────────────

interface SkeletonBlockProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: object;
}

function SkeletonBlock({
  width = '100%',
  height = 18,
  borderRadius = 8,
  style,
}: SkeletonBlockProps) {
  return (
    <View
      style={[
        skeletonStyles.block,
        { width: width as number | string, height, borderRadius },
        style,
      ]}
    />
  );
}

const skeletonStyles = StyleSheet.create({
  block: {
    backgroundColor: palette.surfaceMuted,
    opacity: 0.7,
  },
});

// ─── Loading Skeleton ────────────────────────────────────────────────────────

export function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Summary row */}
      <View style={styles.skeletonRow}>
        <SkeletonBlock width="30%" height={72} borderRadius={radii.lg} />
        <SkeletonBlock width="30%" height={72} borderRadius={radii.lg} />
        <SkeletonBlock width="30%" height={72} borderRadius={radii.lg} />
      </View>

      {/* Card skeletons */}
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonCardRow}>
            <SkeletonBlock width="40%" height={16} />
            <SkeletonBlock width="20%" height={22} borderRadius={9999} />
          </View>
          <SkeletonBlock width="60%" height={13} style={{ marginTop: 8 }} />
          <SkeletonBlock width="80%" height={13} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

// ─── Error State ─────────────────────────────────────────────────────────────

export function ErrorState({ message }: { message?: string }) {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconBox}>
        <Ionicons name="cloud-offline-outline" size={40} color={palette.danger} />
      </View>
      <Text style={styles.errorTitle}>Không tải được dữ liệu</Text>
      <Text style={styles.errorBody}>
        {message ?? 'Đã xảy ra lỗi kết nối. Vui lòng thử lại sau.'}
      </Text>
    </View>
  );
}

// ─── Compound Wrapper ────────────────────────────────────────────────────────

interface QueryStateHandlerProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  /** Show a centered spinner instead of skeleton cards */
  spinnerOnly?: boolean;
  children: ReactNode;
}

export function QueryStateHandler({
  isLoading,
  isError,
  errorMessage,
  spinnerOnly = false,
  children,
}: QueryStateHandlerProps) {
  if (isLoading) {
    if (spinnerOnly) {
      return (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.spinnerText}>Đang tải…</Text>
        </View>
      );
    }
    return <LoadingSkeleton />;
  }

  if (isError) {
    return <ErrorState message={errorMessage} />;
  }

  return <>{children}</>;
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  skeletonContainer: {
    gap: spacing.md,
    padding: spacing.xs,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: spacing.xs,
  },
  skeletonCard: {
    backgroundColor: palette.bgDeep,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: palette.surfaceMuted,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  skeletonCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spinnerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: spacing.md,
  },
  spinnerText: {
    color: palette.textSubtle,
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing['2xl'],
    gap: spacing.md,
  },
  errorIconBox: {
    padding: spacing.xl,
    borderRadius: 9999,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  errorTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
  },
  errorBody: {
    color: palette.textSubtle,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
