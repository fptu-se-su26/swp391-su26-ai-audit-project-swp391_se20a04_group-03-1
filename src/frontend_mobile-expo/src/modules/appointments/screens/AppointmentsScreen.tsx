import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { ScreenShell } from "@/shared/components/layout/ScreenShell";
import { QueryStateHandler } from "@/shared/components/query-state-handler";
import DriverPassModal from "@/modules/dashboard/components/DriverPassModal";
import { fetchDriverAppointments } from "@/shared/api/mobile-api";
import { useAuth } from "@/shared/state/auth";
import { palette, radii, spacing } from "@/shared/theme";
import type { AppointmentStatus, DriverAppointment } from "@/shared/types";

type FilterKey = "all" | "Pending" | "Confirmed";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "Pending", label: "Đang chờ" },
  { key: "Confirmed", label: "Đã xác nhận" },
];

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  Pending: "Đang chờ",
  Confirmed: "Đã xác nhận",
  Cancelled: "Đã hủy",
  Completed: "Hoàn tất",
};

function statusColor(status: AppointmentStatus) {
  switch (status) {
    case "Confirmed":
      return palette.success;
    case "Pending":
      return palette.warning;
    case "Cancelled":
      return palette.danger;
    default:
      return palette.textSubtle;
  }
}

export default function AppointmentsScreen() {
  const auth = useAuth();
  const driverName = (auth.user as any)?.fullName as string | undefined;
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [selected, setSelected] = useState<DriverAppointment | null>(null);

  const {
    data: appointments = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["driver-appointments"],
    queryFn: fetchDriverAppointments,
  });

  const visible = useMemo(() => {
    if (activeFilter === "all") return appointments;
    return appointments.filter((a) => a.status === activeFilter);
  }, [activeFilter, appointments]);

  return (
    <ScreenShell
      title="LỊCH HẸN CỦA BẠN"
      subtitle="Mở mã QR của từng lịch hẹn để nhân viên cổng quét khi vào cảng."
    >
      <QueryStateHandler
        isLoading={isLoading}
        isError={isError}
        errorMessage="Không tải được lịch hẹn. Vui lòng thử lại."
      >
        <View style={styles.filterRow}>
          {filters.map((f) => {
            const on = f.key === activeFilter;
            return (
              <Pressable
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {visible.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="calendar-clear-outline"
              size={36}
              color={palette.textSubtle}
            />
            <Text style={styles.emptyText}>Chưa có lịch hẹn nào.</Text>
            <Pressable onPress={() => refetch()}>
              <Text style={styles.refreshText}>Tải lại</Text>
            </Pressable>
          </View>
        ) : (
          visible.map((item) => {
            const canShow =
              item.status === "Pending" || item.status === "Confirmed";
            return (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.time}>{item.timeSlot}</Text>
                    <Text style={styles.code}>#{item.code}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      { borderColor: statusColor(item.status) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: statusColor(item.status) },
                      ]}
                    >
                      {STATUS_LABEL[item.status]}
                    </Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Meta label="Biển số" value={item.truckPlate} />
                  <Meta label="Container" value={item.containerNo} />
                </View>
                <View style={styles.metaRow}>
                  <Meta label="Mục đích" value={item.purpose} />
                </View>

                <Pressable
                  style={[styles.qrBtn, !canShow && styles.qrBtnDisabled]}
                  disabled={!canShow}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setSelected(item);
                  }}
                >
                  <Ionicons
                    name="qr-code-outline"
                    size={18}
                    color={palette.ink}
                  />
                  <Text style={styles.qrBtnText}>Hiện mã QR</Text>
                </Pressable>
              </View>
            );
          })
        )}

        <DriverPassModal
          visible={!!selected}
          onClose={() => setSelected(null)}
          appointment={selected}
          driverName={driverName}
        />
      </QueryStateHandler>
    </ScreenShell>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  filterRow: { flexDirection: "row", gap: 8, marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: palette.surfaceMuted,
    backgroundColor: palette.surface,
  },
  chipOn: { backgroundColor: palette.accent, borderColor: palette.accent },
  chipText: { color: palette.textMuted, fontSize: 13, fontWeight: "700" },
  chipTextOn: { color: palette.ink },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii["2xl"],
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  time: { color: palette.text, fontSize: 20, fontWeight: "900" },
  code: { color: palette.textSubtle, fontSize: 12, marginTop: 2 },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
    borderWidth: 1,
  },
  statusText: { fontSize: 12, fontWeight: "800" },
  metaRow: { flexDirection: "row", gap: spacing.md },
  metaLabel: { color: palette.textSubtle, fontSize: 11, fontWeight: "700" },
  metaValue: { color: palette.textSoft, fontSize: 14, fontWeight: "600", marginTop: 2 },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: palette.accent,
    borderRadius: radii.lg,
    paddingVertical: 12,
  },
  qrBtnDisabled: { opacity: 0.4 },
  qrBtnText: { color: palette.ink, fontWeight: "900", fontSize: 14 },
  empty: {
    alignItems: "center",
    gap: 8,
    paddingVertical: spacing["2xl"],
  },
  emptyText: { color: palette.textMuted, fontSize: 14 },
  refreshText: { color: palette.accent, fontWeight: "800", marginTop: 4 },
});
