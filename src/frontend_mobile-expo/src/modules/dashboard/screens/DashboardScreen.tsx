import React, { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { ScreenShell } from "@/shared/components/layout/ScreenShell";
import DriverPassModal from "../components/DriverPassModal";
import { fetchDriverAppointments } from "@/shared/api/mobile-api";
import { useAuth } from "@/shared/state/auth";
import { palette, radii, spacing } from "@/shared/theme";
import type { DriverAppointment } from "@/shared/types";

export default function DashboardScreen() {
  const router = useRouter();
  const auth = useAuth();
  const user = auth.user as any;
  const [showPass, setShowPass] = useState(false);

  const { data: appointments = [] } = useQuery({
    queryKey: ["driver-appointments"],
    queryFn: fetchDriverAppointments,
  });

  // Lịch hẹn gần nhất còn hiệu lực để mở QR nhanh.
  const nextAppt: DriverAppointment | undefined = useMemo(
    () =>
      appointments.find(
        (a) => a.status === "Pending" || a.status === "Confirmed",
      ),
    [appointments],
  );

  return (
    <ScreenShell
      title="TÀI XẾ CẢNG"
      subtitle="Cảng thông minh LogiPort — mã QR vào cổng của bạn."
    >
      {/* Lời chào */}
      <View style={styles.hero}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Ionicons name="cube" size={18} color={palette.ink} />
          </View>
          <Text style={styles.wordmark}>
            Logi<Text style={{ color: palette.accent }}>Port</Text>
          </Text>
        </View>
        <Text style={styles.hello}>
          Xin chào, {user?.fullName ?? "tài xế"}
        </Text>
        {user?.company?.companyName ? (
          <Text style={styles.company}>{user.company.companyName}</Text>
        ) : null}
      </View>

      {/* Thẻ QR nhanh */}
      <View style={styles.card}>
        <Text style={styles.cardKicker}>MÃ QR VÀO CỔNG</Text>
        {nextAppt ? (
          <>
            <Text style={styles.apptTime}>{nextAppt.timeSlot}</Text>
            <Text style={styles.apptMeta}>
              #{nextAppt.code} · {nextAppt.truckPlate} · {nextAppt.purpose}
            </Text>
            <Pressable style={styles.qrBtn} onPress={() => setShowPass(true)}>
              <Ionicons name="qr-code-outline" size={18} color={palette.ink} />
              <Text style={styles.qrBtnText}>Mở mã QR</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.noAppt}>
            Bạn chưa có lịch hẹn nào đang chờ vào cổng.
          </Text>
        )}
      </View>

      {/* Hướng dẫn */}
      <View style={styles.hintPanel}>
        <Text style={styles.hintTitle}>LUỒNG THAO TÁC NHANH</Text>
        <Text style={styles.hintText}>1. Mở mã QR của lịch hẹn.</Text>
        <Text style={styles.hintText}>
          2. Đưa mã cho nhân viên cổng quét khi tới cảng.
        </Text>
        <Text style={styles.hintText}>
          3. Xem tất cả lịch hẹn ở tab “Lịch hẹn”.
        </Text>
        <Pressable
          style={styles.linkBtn}
          onPress={() => router.push("/(driver)/appointments")}
        >
          <Text style={styles.linkText}>Xem tất cả lịch hẹn</Text>
          <Ionicons name="arrow-forward" size={16} color={palette.accent} />
        </Pressable>
      </View>

      <DriverPassModal
        visible={showPass}
        onClose={() => setShowPass(false)}
        appointment={nextAppt}
        driverName={user?.fullName}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: palette.surface,
    borderRadius: radii["2xl"],
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.lg,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  wordmark: { color: palette.text, fontSize: 18, fontWeight: "900" },
  hello: { color: palette.text, fontSize: 22, fontWeight: "900", marginTop: 14 },
  company: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii["2xl"],
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: spacing.lg,
    alignItems: "center",
  },
  cardKicker: {
    color: palette.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  apptTime: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
  },
  apptMeta: { color: palette.textMuted, fontSize: 13, marginTop: 4 },
  qrBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: palette.accent,
    borderRadius: radii.lg,
    paddingVertical: 13,
    paddingHorizontal: 28,
    marginTop: spacing.lg,
    alignSelf: "stretch",
  },
  qrBtnText: { color: palette.ink, fontWeight: "900", fontSize: 15 },
  noAppt: {
    color: palette.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.md,
    lineHeight: 20,
  },
  hintPanel: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: radii["2xl"],
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.lg,
  },
  hintTitle: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  hintText: { color: palette.textMuted, fontSize: 14, lineHeight: 22 },
  linkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  linkText: { color: palette.accent, fontWeight: "800", fontSize: 14 },
});
