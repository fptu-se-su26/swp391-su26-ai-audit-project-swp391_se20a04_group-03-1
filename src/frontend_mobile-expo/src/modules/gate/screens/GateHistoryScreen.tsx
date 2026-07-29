import React, { useMemo, useState } from "react";
import { StyleSheet, Text, View, Pressable } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { ScreenShell } from "@/shared/components/layout/ScreenShell";
import { QueryStateHandler } from "@/shared/components/query-state-handler";
import { fetchGateHistory } from "@/shared/api/mobile-api";
import { palette, radii, spacing } from "@/shared/theme";
import type { GatePassageItem } from "@/shared/types";

/**
 * Lịch sử các lượt xe do CHÍNH tài khoản quản lý cổng này quét.
 *
 * Dữ liệu suy ra từ nhật ký sửa đổi của lượt qua cổng (ai tạo lúc check-in / ai
 * sửa lúc check-out), nên không cần lưu thêm bảng riêng.
 */

type FilterKey = "all" | "in" | "out";

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "in", label: "Trong bãi" },
  { key: "out", label: "Đã ra" },
];

const fmtTime = (value?: string | null): string =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export default function GateHistoryScreen() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["gate-history"],
    queryFn: fetchGateHistory,
  });

  const items = data?.items ?? [];
  const stats = data?.stats;

  const visible = useMemo(
    () =>
      filter === "all"
        ? items
        : items.filter((i: GatePassageItem) => i.status === filter),
    [filter, items],
  );

  return (
    <ScreenShell
      title="LỊCH SỬ QUÉT"
      subtitle="Các lượt xe do tài khoản của bạn xử lý tại cổng."
      onReload={refetch}
      reloading={isFetching}
    >
      <QueryStateHandler
        isLoading={isLoading}
        isError={isError}
        errorMessage="Không tải được lịch sử quét. Vui lòng thử lại."
      >
        {/* Thống kê */}
        <View style={styles.statGrid}>
          <StatCard
            label="Tổng lượt"
            value={stats?.total ?? 0}
            icon="albums-outline"
            color={palette.text}
          />
          <StatCard
            label="Vào hôm nay"
            value={stats?.checkInToday ?? 0}
            icon="enter-outline"
            color={palette.success}
          />
          <StatCard
            label="Ra hôm nay"
            value={stats?.checkOutToday ?? 0}
            icon="exit-outline"
            color={palette.info}
          />
          <StatCard
            label="Còn trong bãi"
            value={stats?.stillInside ?? 0}
            icon="time-outline"
            color={palette.warning}
          />
        </View>

        {/* Bộ lọc */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Danh sách */}
        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="file-tray-outline"
              size={36}
              color={palette.textSubtle}
            />
            <Text style={styles.emptyText}>
              {items.length === 0
                ? "Bạn chưa quét lượt xe nào."
                : "Không có lượt nào khớp bộ lọc."}
            </Text>
          </View>
        ) : (
          visible.map((item) => <PassageCard key={item.id} item={item} />)
        )}
      </QueryStateHandler>
    </ScreenShell>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function PassageCard({ item }: { item: GatePassageItem }) {
  const inside = item.status === "in";
  return (
    <View style={styles.card}>
      <View style={styles.cardHead}>
        <Text style={styles.plate}>{item.truckPlate}</Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: inside
                ? "rgba(244,172,28,0.14)"
                : "rgba(59,130,246,0.14)",
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: inside ? palette.warning : palette.info },
            ]}
          >
            {inside ? "TRONG BÃI" : "ĐÃ RA"}
          </Text>
        </View>
      </View>

      <Row label="Container" value={item.containerNo} />
      <Row label="Tài xế" value={item.driverName} />
      <Row label="Mục đích" value={item.purpose} />
      {item.assignedSlot ? (
        <Row
          label="Ô đỗ"
          value={
            item.yardName ? `${item.yardName} • ${item.assignedSlot}` : item.assignedSlot
          }
        />
      ) : null}
      <Row label="Giờ vào" value={fmtTime(item.checkInTime)} />
      <Row label="Giờ ra" value={fmtTime(item.checkOutTime)} />
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  statCard: {
    flexGrow: 1,
    flexBasis: "47%",
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.md,
    gap: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "900",
  },
  statLabel: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "700",
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.surfaceMuted,
  },
  chipActive: {
    backgroundColor: palette.accent,
    borderColor: palette.accent,
  },
  chipText: {
    color: palette.textMuted,
    fontSize: 12,
    fontWeight: "700",
  },
  chipTextActive: {
    color: palette.ink,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.md,
  },
  cardHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  plate: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900",
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  rowLabel: {
    color: palette.textSubtle,
    fontSize: 12,
  },
  rowValue: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "700",
    maxWidth: "62%",
    textAlign: "right",
  },
  empty: {
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 13,
    textAlign: "center",
  },
});
