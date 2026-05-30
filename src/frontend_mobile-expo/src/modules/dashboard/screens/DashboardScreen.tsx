import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ScreenShell } from '@/shared/components/layout/ScreenShell';
import {
  fetchDashboardSummary,
  fetchNotifications,
  fetchAppointments,
  fetchYardSpots,
} from '@/shared/api/portal-api';
import { QueryStateHandler } from '@/shared/components/query-state-handler';

export default function DashboardScreen() {
  const router = useRouter();
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
  });

  const notificationsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
  });

  const appointmentsQuery = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });

  const yardQuery = useQuery({
    queryKey: ["yard-spots"],
    queryFn: fetchYardSpots,
  });

  const anyLoading =
    summaryQuery.isLoading ||
    notificationsQuery.isLoading ||
    appointmentsQuery.isLoading ||
    yardQuery.isLoading;

  const anyError =
    summaryQuery.isError ||
    notificationsQuery.isError ||
    appointmentsQuery.isError ||
    yardQuery.isError;

  const summary = summaryQuery.data;
  const notifications = notificationsQuery.data ?? [];
  const yardSpots = yardQuery.data ?? [];
  const scheduleItems = appointmentsQuery.data ?? [];
  const topScheduleItems = scheduleItems.slice(0, 2);
  const activeAlerts =
    summary?.activeAlerts ??
    notifications.filter((item) => item.status === "Unread").length;
  const freeSpots =
    summary?.freeSpots ??
    yardSpots.filter((spot) => spot.status === "Free").length;
  const pendingTasks =
    summary?.pendingTasks ??
    scheduleItems.filter((item) => item.status !== "Confirmed").length;
  const nextAppointmentTime = (summary?.nextAppointment ?? "14:20").split(
    " - ",
  )[0];

  return (
    <ScreenShell
      title="TÀI XẾ CẢNG"
      subtitle="Cảng thông minh IoT · giao diện tối cho tài xế"
      hideHeader
    >
      <QueryStateHandler
        isLoading={anyLoading}
        isError={anyError}
        spinnerOnly
        errorMessage="Không tải được dữ liệu trang chủ. Vui lòng kiểm tra kết nối và thử lại."
      >
        <View style={styles.headerBar}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}>
              {Array.from({ length: 5 }).map((_, index) => (
                <View key={`brand-dot-${index}`} style={styles.brandDot} />
              ))}
            </View>
            <View>
              <Text style={styles.brandText}>TÀI XẾ CẢNG</Text>
              <Text style={styles.brandSubtext}>CẢNG THÔNG MINH IOT</Text>
            </View>
          </View>
          <View style={styles.signalGlyph} />
        </View>


        <View style={styles.sectionPanel}>
          <View style={styles.sectionHeaderRow}>
            <View style={styles.connectionRow}>
              <View style={styles.connectionDot} />
              <Text style={styles.sectionHeaderLeft}>KẾT NỐI ĐANG HOẠT ĐỘNG</Text>
            </View>
            <Text style={styles.sectionHeaderRight}>SENS-ORCH-729</Text>
          </View>
          <View style={styles.statusBanner}>
            <View style={styles.statusStripe} />
            <View style={styles.statusBody}>
              <Text style={styles.statusKicker}>TRẠNG THÁI HIỆN TẠI</Text>
              <Text style={styles.statusHeadline}>
                GIAI ĐOẠN: ĐANG CHỜ TẠI CỔNG
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionPanel}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderLeft}>LỆNH ĐIỆN TỬ</Text>
            <Text style={styles.sectionHeaderRight}>TXN-992-K</Text>
          </View>

          <Pressable
            style={styles.qrCard}
            onPress={() =>
              router.push({
                pathname: "/modal/qr",
                params: {
                  appointmentCode: "AP-1024",
                  driverName: "Nguyen Van An",
                  licensePlate: "51C-123.45",
                  timeSlot: "09:30",
                }
              })
            }
            accessibilityRole="button"
            accessibilityLabel="Chạm để check-in QR"
          >
            <View style={styles.qrFrame}>
              <MiniQrPreview />
            </View>
            <View style={styles.qrBadge}>
              <Text style={styles.qrBadgeText}>CHẠM ĐỂ CHECK-IN</Text>
            </View>
          </Pressable>

          <View style={styles.infoGrid}>
            <InfoTile label="KHÓA BÃI" value="ZONE-4" />
            <InfoTile
              label="GIỜ VÀO CỔNG DỰ KIẾN"
              value={nextAppointmentTime}
              align="right"
            />
          </View>
        </View>

        <View style={styles.sectionRowTitle}>
          <Text style={styles.sectionRowTitleText}>LỊCH TRONG NGÀY</Text>
        </View>

        <View style={styles.scheduleStack}>
          {topScheduleItems.map((item, index) => (
            <ScheduleCard
              key={item.code}
              time={item.time}
              tag={mapScheduleStatus(item.status)}
              containerCode={`CONT: ${item.code.replace("AP-", "MSCU ")}`}
              gate={index === 0 ? "G-12" : "G-08"}
              accent={index === 0 ? styles.accentMint : styles.accentSand}
            />
          ))}
        </View>

        <View style={styles.footerStats}>
          <StatChip label="LẦN CHECK-IN" value={summary?.checkInsToday ?? 0} />
          <StatChip label="Ô TRỐNG" value={freeSpots} />
          <StatChip label="CẢNH BÁO" value={activeAlerts} />
          <StatChip label="ĐANG CHỜ XỬ LÝ" value={pendingTasks} />
        </View>

        <View style={styles.footerSpacer} />
      </QueryStateHandler>
    </ScreenShell>
  );
}

function InfoTile({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "right";
}) {
  return (
    <View style={[styles.infoTile, align === "right" && styles.infoTileRight]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text
        style={[styles.infoValue, align === "right" && styles.infoValueRight]}
      >
        {value}
      </Text>
    </View>
  );
}

function ScheduleCard({
  time,
  tag,
  containerCode,
  gate,
  accent,
}: {
  time: string;
  tag: string;
  containerCode: string;
  gate: string;
  accent: StyleProp<ViewStyle>;
}) {
  return (
    <View style={styles.scheduleCard}>
      <View style={[styles.scheduleAccent, accent]} />
      <View style={styles.scheduleContent}>
        <View style={styles.scheduleLeft}>
          <Text style={styles.scheduleTime}>{time}</Text>
          <Text style={styles.scheduleTag}>{tag}</Text>
          <Text style={styles.scheduleCode}>{containerCode}</Text>
        </View>
        <View style={styles.scheduleRight}>
          <Text style={styles.scheduleGateLabel}>CỔNG</Text>
          <Text style={styles.scheduleGateValue}>{gate}</Text>
        </View>
      </View>
    </View>
  );
}

function mapScheduleStatus(status: string) {
  switch (status.toLowerCase()) {
    case "confirmed":
      return "ĐÃ XÁC NHẬN";
    case "pending":
      return "ĐANG CHỜ";
    case "waiting":
      return "ĐANG CHỜ XỬ LÝ";
    case "cancelled":
      return "ĐÃ HỦY";
    case "completed":
      return "HOÀN TẤT";
    default:
      return status.toUpperCase();
  }
}

function MiniQrPreview() {
  const modules = [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 0, 0],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
  ];

  return (
    <View style={styles.qrGrid}>
      {modules.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.qrRow}>
          {row.map((cell, cellIndex) => (
            <View
              key={`cell-${rowIndex}-${cellIndex}`}
              style={[styles.qrCell, cell === 0 && styles.qrCellEmpty]}
            />
          ))}
        </View>
      ))}
      <View style={styles.qrCenterDot} />
    </View>
  );
}

function StatChip({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.statChip}>
      <Text style={styles.statChipLabel}>{label}</Text>
      <Text style={styles.statChipValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 30,
    height: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#f6c06a",
  },
  brandText: {
    color: "#f6c06a",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  brandSubtext: {
    color: "#9fb0d7",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2.2,
    marginTop: 1,
  },
  signalGlyph: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#f6c06a",
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  connectionDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#5be4b4",
    shadowColor: "#5be4b4",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  sectionPanel: {
    borderWidth: 1,
    borderColor: "rgba(246, 192, 106, 0.35)",
    backgroundColor: "rgba(16, 24, 44, 0.88)",
    padding: 14,
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderLeft: {
    color: "#d7ddf0",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sectionHeaderRight: {
    color: "#d7bb8c",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusBanner: {
    minHeight: 156,
    backgroundColor: "#4a3b28",
    flexDirection: "row",
    overflow: "hidden",
  },
  statusStripe: {
    width: 8,
    backgroundColor: "#f6c06a",
  },
  statusBody: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: "center",
  },
  statusKicker: {
    color: "#f1bf7b",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  statusHeadline: {
    color: "#f8c883",
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 37,
    letterSpacing: 0.3,
  },
  qrCard: {
    alignItems: "center",
    gap: 16,
  },
  qrFrame: {
    width: 300,
    height: 300,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#f4ead9",
    borderWidth: 1,
    borderColor: "#f0c88f",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 8,
  },
  qrGrid: {
    flex: 1,
    backgroundColor: "#111318",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 14,
    borderColor: "#f8f3ec",
    position: "relative",
  },
  qrRow: {
    flexDirection: "row",
  },
  qrCell: {
    width: 19,
    height: 19,
    margin: 2,
    backgroundColor: "#f5f7fb",
  },
  qrCellEmpty: {
    backgroundColor: "#151a1f",
  },
  qrCenterDot: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#e24d3a",
  },
  qrBadge: {
    width: "100%",
    backgroundColor: "#f6c06a",
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#111827",
  },
  qrBadgeText: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: "row",
    gap: 0,
  },
  infoTile: {
    flex: 1,
    paddingTop: 18,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderColor: "rgba(246, 192, 106, 0.22)",
  },
  infoTileRight: {
    alignItems: "flex-start",
    paddingLeft: 18,
    borderLeftWidth: 1,
    borderLeftColor: "rgba(246, 192, 106, 0.22)",
  },
  infoLabel: {
    color: "#d8c3ad",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginBottom: 8,
  },
  infoValue: {
    color: "#e5ebff",
    fontSize: 25,
    fontWeight: "900",
  },
  infoValueRight: {
    fontSize: 22,
  },
  sectionRowTitle: {
    paddingTop: 4,
  },
  sectionRowTitleText: {
    color: "#dbe3fb",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 1,
  },
  scheduleStack: {
    gap: 12,
  },
  scheduleCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "rgba(246, 192, 106, 0.24)",
    backgroundColor: "rgba(16, 24, 44, 0.88)",
    minHeight: 96,
  },
  scheduleAccent: {
    width: 6,
  },
  accentMint: {
    backgroundColor: "#60d5b2",
  },
  accentSand: {
    backgroundColor: "#5d4b34",
  },
  scheduleContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  scheduleLeft: {
    flex: 1,
    gap: 6,
    paddingRight: 10,
  },
  scheduleRight: {
    width: 78,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  scheduleTime: {
    color: "#dfe7ff",
    fontSize: 16,
    fontWeight: "900",
  },
  scheduleTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(246, 192, 106, 0.18)",
    color: "#d9d0c0",
    fontSize: 11,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 3,
    letterSpacing: 0.7,
  },
  scheduleCode: {
    color: "#dfe7ff",
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 24,
  },
  scheduleGateLabel: {
    color: "#d8c3ad",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  scheduleGateValue: {
    color: "#f6c06a",
    fontSize: 21,
    fontWeight: "900",
    marginTop: 4,
  },
  footerStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statChip: {
    minWidth: 78,
    flexGrow: 1,
    borderWidth: 1,
    borderColor: "rgba(246, 192, 106, 0.18)",
    backgroundColor: "rgba(9, 15, 28, 0.6)",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statChipLabel: {
    color: "#bfc8df",
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  statChipValue: {
    color: "#f6c06a",
    fontSize: 18,
    fontWeight: "900",
  },
  footerSpacer: {
    height: 12,
  },
});
