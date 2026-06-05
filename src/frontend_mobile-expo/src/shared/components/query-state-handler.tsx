/**
 * QueryStateHandler
 *
 * A shared render-helper for TanStack Query loading/error states.
 * Usage:
 *
 *   <QueryStateHandler isLoading={isLoading} isError={isError} errorMessage="...">
 *     {/* actual content *\/}
 *   </QueryStateHandler>
 */
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// ─── Skeleton block (animated shimmer via opacity) ───────────────────────────

function SkeletonBlock({
  width = "100%",
  height = 18,
  borderRadius = 8,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: object;
}) {
  return (
    <View
      style={[
        skeletonStyles.block,
        { width: width as any, height, borderRadius },
        style,
      ]}
    />
  );
}

const skeletonStyles = StyleSheet.create({
  block: {
    backgroundColor: "#1e2d44",
    opacity: 0.7,
  },
});

// ─── Loading skeleton layout ──────────────────────────────────────────────────

export function LoadingSkeleton() {
  return (
    <View style={styles.skeletonContainer}>
      {/* Mimics a summary-row */}
      <View style={styles.skeletonRow}>
        <SkeletonBlock width="30%" height={72} borderRadius={14} />
        <SkeletonBlock width="30%" height={72} borderRadius={14} />
        <SkeletonBlock width="30%" height={72} borderRadius={14} />
      </View>

      {/* Mimics card items */}
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.skeletonCard}>
          <View style={styles.skeletonCardRow}>
            <SkeletonBlock width="40%" height={16} />
            <SkeletonBlock width="20%" height={22} borderRadius={999} />
          </View>
          <SkeletonBlock width="60%" height={13} style={{ marginTop: 8 }} />
          <SkeletonBlock width="80%" height={13} style={{ marginTop: 6 }} />
        </View>
      ))}
    </View>
  );
}

// ─── Error state ──────────────────────────────────────────────────────────────

export function ErrorState({ message }: { message?: string }) {
  return (
    <View style={styles.errorContainer}>
      <View style={styles.errorIconBox}>
        <Ionicons name="cloud-offline-outline" size={40} color="#ef4444" />
      </View>
      <Text style={styles.errorTitle}>Không tải được dữ liệu</Text>
      <Text style={styles.errorBody}>
        {message ?? "Đã xảy ra lỗi kết nối. Vui lòng thử lại sau."}
      </Text>
    </View>
  );
}

// ─── Compound wrapper ─────────────────────────────────────────────────────────

interface QueryStateHandlerProps {
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  /** Show a centered spinner instead of skeleton cards */
  spinnerOnly?: boolean;
  children: React.ReactNode;
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
          <ActivityIndicator size="large" color="#f6b11c" />
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  skeletonContainer: {
    gap: 12,
    padding: 4,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 4,
  },
  skeletonCard: {
    backgroundColor: "#0b1528",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#1e2d44",
    padding: 16,
    gap: 4,
  },
  skeletonCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spinnerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    gap: 12,
  },
  spinnerText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
    paddingHorizontal: 24,
    gap: 12,
  },
  errorIconBox: {
    padding: 18,
    borderRadius: 9999,
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.25)",
  },
  errorTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
  },
  errorBody: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
