import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { ScreenShell } from '@/shared/components/layout/ScreenShell';
import { fetchYardSpots } from '@/shared/api/portal-api';
import { QueryStateHandler } from '@/shared/components/';

export default function YardScreen() {
  const {
    data: spots = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["yard-spots"],
    queryFn: fetchYardSpots,
  });

  // ── Derived stats — recomputed only when the spots array changes ────────────
  const { freeCount, occupiedCount, reservedCount } = useMemo(
    () => ({
      freeCount: spots.filter((s) => s.status === "Free").length,
      occupiedCount: spots.filter((s) => s.status === "Occupied").length,
      reservedCount: spots.filter((s) => s.status === "Reserved").length,
    }),
    [spots],
  );

  return (
    <ScreenShell
      title="Bãi xe"
      subtitle="Sơ đồ bãi và trạng thái các ô đỗ theo khu vực."
    >
      <QueryStateHandler
        isLoading={isLoading}
        isError={isError}
        errorMessage="Không thể tải dữ liệu bãi xe. Vui lòng thử lại sau."
      >
        {/* ── Summary row ── */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, styles.freeCard]}>
            <Text style={styles.summaryValue}>{freeCount}</Text>
            <Text style={styles.summaryLabel}>Trống</Text>
          </View>
          <View style={[styles.summaryCard, styles.occupiedCard]}>
            <Text style={styles.summaryValue}>{occupiedCount}</Text>
            <Text style={styles.summaryLabel}>Đã chiếm</Text>
          </View>
          <View style={[styles.summaryCard, styles.reservedCard]}>
            <Text style={styles.summaryValue}>{reservedCount}</Text>
            <Text style={styles.summaryLabel}>Đã đặt</Text>
          </View>
        </View>

        {/* ── Spot list ── */}
        {spots.map((spot) => (
          <View key={spot.id} style={styles.card}>
            <View>
              <Text style={styles.spotId}>{spot.id}</Text>
              <Text style={styles.spotZone}>Khu {spot.zone}</Text>
            </View>
            <Text
              style={[
                styles.spotStatus,
                spot.status === "Free"
                  ? styles.statusFree
                  : spot.status === "Occupied"
                    ? styles.statusOccupied
                    : styles.statusReserved,
              ]}
            >
              {spot.status}
            </Text>
          </View>
        ))}

        {/* Empty state (data loaded but no spots returned) */}
        {spots.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có dữ liệu ô đỗ xe.</Text>
          </View>
        )}
      </QueryStateHandler>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#0f1a2a",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderTopWidth: 3,
  },
  freeCard: { borderTopColor: "#34d399" },
  occupiedCard: { borderTopColor: "#ef4444" },
  reservedCard: { borderTopColor: "#f59e0b" },
  summaryValue: {
    color: "#f8fafc",
    fontSize: 24,
    fontWeight: "800",
  },
  summaryLabel: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 12,
  },
  card: {
    backgroundColor: "#0f1a2a",
    borderColor: "#1f2937",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  spotId: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 15,
  },
  spotZone: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
  spotStatus: {
    fontSize: 11,
    fontWeight: "800",
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  statusFree: {
    color: "#d1fae5",
    backgroundColor: "#047857",
  },
  statusOccupied: {
    color: "#fee2e2",
    backgroundColor: "#dc2626",
  },
  statusReserved: {
    color: "#fff7ed",
    backgroundColor: "#f59e0b",
  },
  emptyContainer: {
    paddingTop: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "600",
  },
});
