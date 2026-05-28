import React, { useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import ScreenShell from "../../components/layout/ScreenShell";
import { fetchAppointments } from "../../services/portalApi";
import type { RootTabParamList } from "../../navigation/AppNavigator";
import { stitchPalette } from "../../theme/stitchPalette";
import { QueryStateHandler } from "../../components/ui/query-state-handler";

type Props = BottomTabScreenProps<RootTabParamList, "Appointments">;

type FilterKey = "all" | "active" | "pending" | "history";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Đang xử lý" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "history", label: "Lịch sử" },
];

function formatStatus(status: string) {
  switch (status) {
    case "Confirmed":
      return "Đã xác nhận";
    case "Pending":
      return "Đang chờ";
    case "Waiting":
      return "Chờ xử lý";
    default:
      return status;
  }
}

function getStatusTone(status: string) {
  switch (status) {
    case "Confirmed":
      return styles.statusConfirmed;
    case "Pending":
      return styles.statusPending;
    case "Waiting":
      return styles.statusWaiting;
    default:
      return styles.statusWaiting;
  }
}

export default function AppointmentsScreen({ navigation }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });

  const visibleAppointments = useMemo(() => {
    switch (activeFilter) {
      case "active":
        return appointments.filter(
          (item) => item.status === "Confirmed" || item.status === "Waiting",
        );
      case "pending":
        return appointments.filter((item) => item.status === "Pending");
      case "history":
        return appointments.filter((item) => item.status !== "Pending");
      default:
        return appointments;
    }
  }, [activeFilter, appointments]);

  const confirmedCount = appointments.filter(
    (item) => item.status === "Confirmed",
  ).length;
  const pendingCount = appointments.filter(
    (item) => item.status === "Pending",
  ).length;
  const waitingCount = appointments.filter(
    (item) => item.status === "Waiting",
  ).length;

  return (
    <ScreenShell
      title="Lịch hẹn"
      subtitle="Xem thông tin, pass QR và trạng thái. Liên hệ điều phối khi cần hỗ trợ."
    >
      <QueryStateHandler
        isLoading={isLoading}
        isError={isError}
        errorMessage="Không tải được danh sách lịch hẹn. Vui lòng thử lại sau."
      >
      <View style={styles.heroCard}>
        <Text style={styles.heroKicker}>PORT DRIVER</Text>
        <Text style={styles.heroTitle}>Active Slots</Text>
        <Text style={styles.heroSubtitle}>
          Tài xế chỉ xem thông tin, check-in QR và liên hệ điều phối khi cần.
        </Text>

        <View style={styles.summaryRow}>
          <SummaryChip label="Đã xác nhận" value={confirmedCount} />
          <SummaryChip label="Đang chờ" value={pendingCount} />
          <SummaryChip label="Chờ xử lý" value={waitingCount} />
        </View>
      </View>

      <View style={styles.filterRow}>
        {filters.map((filter) => {
          const selected = filter.key === activeFilter;
          return (
            <Pressable
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[
                styles.filterChip,
                selected && styles.filterChipActive,
                { marginRight: 10 },
              ]}
            >
              <Text
                style={[styles.filterText, selected && styles.filterTextActive]}
              >
                {filter.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>Lịch trong ngày</Text>
        <Text style={styles.listHeaderSub}>
          {visibleAppointments.length} mục hiển thị
        </Text>
      </View>

      {visibleAppointments.map((item) => {
        const isConfirmed = item.status === "Confirmed";

        return (
          <View key={item.code} style={styles.card}>
            <View style={styles.cardTopRow}>
              <View>
                <Text style={styles.cardCode}>{item.code}</Text>
                <Text style={styles.cardTime}>{item.time}</Text>
              </View>
              <View style={[styles.statusPill, getStatusTone(item.status)]}>
                <Text style={styles.statusText}>
                  {formatStatus(item.status)}
                </Text>
              </View>
            </View>

            <View style={styles.metaBlock}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Xe</Text>
                <Text style={styles.metaValue}>{item.truck}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Khuyến nghị</Text>
                <Text style={styles.metaValue}>
                  {isConfirmed ? "Xem pass và quét QR" : "Chờ điều phối xử lý"}
                </Text>
              </View>
            </View>

            <View style={styles.actionRow}>
              <Pressable
                style={styles.primaryAction}
                onPress={() => {
                  if (isConfirmed) {
                    navigation.getParent()?.navigate("QRScanner" as never);
                    return;
                  }

                  Alert.alert(
                    "Chưa thể mở pass",
                    "Lịch này chưa ở trạng thái xác nhận. Hãy chờ điều phối hoặc liên hệ hỗ trợ.",
                  );
                }}
              >
                <Text style={styles.primaryActionText}>
                  {isConfirmed ? "Xem pass / Quét QR" : "Xem hướng dẫn"}
                </Text>
              </Pressable>

              <Pressable
                style={styles.secondaryAction}
                onPress={() => {
                  Alert.alert(
                    "Liên hệ điều phối",
                    "Vui lòng liên hệ điều phối để xử lý lịch đang chờ hoặc hỗ trợ vào cổng.",
                  );
                }}
              >
                <Text style={styles.secondaryActionText}>Điều phối</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Hỗ trợ điều phối</Text>
        <Text style={styles.infoBody}>
          Nếu cần hỗ trợ đổi khung giờ, xác nhận lịch hoặc kiểm tra pass, hãy
          liên hệ điều phối để được hướng dẫn.
        </Text>
      </View>
      </QueryStateHandler>
    </ScreenShell>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryChip}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: stitchPalette.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: stitchPalette.borderStrong,
    gap: 10,
  },
  heroKicker: {
    color: stitchPalette.accentSoft,
    fontSize: 11,
    letterSpacing: 3,
    fontWeight: "800",
  },
  heroTitle: {
    color: stitchPalette.text,
    fontSize: 30,
    fontWeight: "900",
  },
  heroSubtitle: {
    color: stitchPalette.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },
  summaryChip: {
    minWidth: 96,
    flexGrow: 1,
    backgroundColor: stitchPalette.surfaceAlt,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: stitchPalette.borderSoft,
    padding: 12,
    marginRight: 10,
  },
  summaryLabel: {
    color: stitchPalette.textSubtle,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryValue: {
    marginTop: 4,
    color: stitchPalette.text,
    fontSize: 20,
    fontWeight: "900",
  },
  filterRow: {
    flexDirection: "row",
    paddingVertical: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: stitchPalette.surface,
    borderWidth: 1,
    borderColor: "rgba(246, 192, 106, 0.18)",
  },
  filterChipActive: {
    backgroundColor: "#f6c06a",
  },
  filterText: {
    color: "#cbd5e1",
    fontSize: 13,
    fontWeight: "700",
  },
  filterTextActive: {
    color: "#111827",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listHeaderTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "800",
  },
  listHeaderSub: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#101b31",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: stitchPalette.borderStrong,
    padding: 16,
    // spacing between internal blocks handled via margins
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardCode: {
    color: stitchPalette.text,
    fontSize: 18,
    fontWeight: "900",
  },
  cardTime: {
    marginTop: 4,
    color: stitchPalette.textMuted,
    fontSize: 13,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.6,
    color: stitchPalette.ink,
  },
  statusConfirmed: {
    backgroundColor: "rgba(77,215,165,0.12)",
    borderWidth: 1,
    borderColor: "rgba(77,215,165,0.28)",
    shadowColor: "rgba(77,215,165,0.16)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 16,
    elevation: 6,
  },
  statusPending: {
    backgroundColor: "rgba(244,172,28,0.12)",
    borderWidth: 1,
    borderColor: "rgba(244,172,28,0.28)",
    shadowColor: "rgba(244,172,28,0.14)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  statusWaiting: {
    backgroundColor: "rgba(121,168,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(121,168,255,0.26)",
    shadowColor: "rgba(121,168,255,0.12)",
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  statusCancelled: {
    backgroundColor: "rgba(239,124,84,0.10)",
    borderWidth: 1,
    borderColor: "rgba(239,124,84,0.24)",
    shadowColor: "rgba(239,124,84,0.10)",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  metaBlock: {
    paddingTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: {
    color: stitchPalette.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  metaValue: {
    color: stitchPalette.textSoft,
    fontSize: 13,
    fontWeight: "600",
    flexShrink: 1,
    textAlign: "right",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  primaryAction: {
    flex: 1,
    backgroundColor: stitchPalette.accent,
    borderRadius: 18,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  primaryActionText: {
    color: stitchPalette.ink,
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryAction: {
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryActionText: {
    color: stitchPalette.text,
    fontSize: 13,
    fontWeight: "800",
  },
  infoCard: {
    backgroundColor: stitchPalette.surfaceAlt,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: stitchPalette.borderSoft,
    padding: 16,
    gap: 8,
  },
  infoTitle: {
    color: stitchPalette.text,
    fontSize: 15,
    fontWeight: "800",
  },
  infoBody: {
    color: stitchPalette.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
});
