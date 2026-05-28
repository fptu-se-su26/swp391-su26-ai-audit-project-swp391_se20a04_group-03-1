import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import ScreenShell from "../../components/layout/ScreenShell";
import { fetchYardSpots } from "../../services/portalApi";

export default function YardScreen() {
  const { data: spots = [] } = useQuery({
    queryKey: ["yard-spots"],
    queryFn: fetchYardSpots,
  });

  return (
    <ScreenShell
      title="Bãi xe"
      subtitle="Sơ đồ bãi và trạng thái các ô đỗ theo khu vực."
    >
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.freeCard]}>
          <Text style={styles.summaryValue}>24</Text>
          <Text style={styles.summaryLabel}>Trống</Text>
        </View>
        <View style={[styles.summaryCard, styles.occupiedCard]}>
          <Text style={styles.summaryValue}>18</Text>
          <Text style={styles.summaryLabel}>Đã chiếm</Text>
        </View>
        <View style={[styles.summaryCard, styles.reservedCard]}>
          <Text style={styles.summaryValue}>6</Text>
          <Text style={styles.summaryLabel}>Đã đặt</Text>
        </View>
      </View>

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
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: "row",
    gap: 10,
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
});
