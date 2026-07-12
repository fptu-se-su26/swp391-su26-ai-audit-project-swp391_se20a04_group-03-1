import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";

import { ScreenShell } from "@/shared/components/layout/ScreenShell";
import { Button } from "@/shared/components/Button";
import { QueryStateHandler } from "@/shared/components/query-state-handler";
import { fetchMe } from "@/shared/api/mobile-api";
import { useAuth, signOut } from "@/shared/state/auth";
import { palette, radii, spacing } from "@/shared/theme";

type DriverProfile = {
  fullName?: string;
  email?: string;
  phone?: string;
  driverId?: string;
  company?: { companyName?: string; companyCode?: string } | null;
};

export default function SettingsScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  // Hồ sơ lấy từ /api/mobile/auth/me; dùng auth.user (đã có sẵn từ đăng nhập)
  // làm dữ liệu khởi tạo để hiển thị ngay, rồi làm mới nền.
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery<DriverProfile>({
    queryKey: ["me", "driver"],
    queryFn: async () => (await fetchMe()) as DriverProfile,
    initialData: (auth.user as DriverProfile) ?? undefined,
  });

  async function handleLogout() {
    setLoggingOut(true);
    await signOut();
    router.replace("/login");
  }

  return (
    <ScreenShell
      title="TÀI KHOẢN TÀI XẾ"
      subtitle="Thông tin do công ty vận tải cấp và quản lý."
    >
      <QueryStateHandler
        isLoading={isLoading && !profile}
        isError={isError && !profile}
        errorMessage="Không tải được thông tin tài khoản."
      >
        <View style={styles.card}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={34} color={palette.accent} />
          </View>
          <Text style={styles.name}>{profile?.fullName ?? "Tài xế"}</Text>
          {profile?.email ? (
            <Text style={styles.email}>{profile.email}</Text>
          ) : null}

          <View style={styles.infoBlock}>
            <Row label="Mã tài xế" value={profile?.driverId ?? "-"} />
            <Row label="Số điện thoại" value={profile?.phone ?? "-"} />
            <Row
              label="Công ty"
              value={profile?.company?.companyName ?? "-"}
            />
            <Row
              label="Mã công ty"
              value={profile?.company?.companyCode ?? "-"}
            />
          </View>

          <Pressable
            style={styles.refreshRow}
            onPress={() => refetch()}
            disabled={isRefetching}
          >
            <Ionicons name="refresh" size={15} color={palette.accent} />
            <Text style={styles.refreshText}>
              {isRefetching ? "Đang làm mới…" : "Làm mới thông tin"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.noteCard}>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={palette.textSubtle}
          />
          <Text style={styles.noteText}>
            Cần cập nhật họ tên, số điện thoại hay phương tiện? Vui lòng liên hệ
            công ty vận tải quản lý tài khoản của bạn.
          </Text>
        </View>

        <Button
          variant="danger"
          size="lg"
          loading={loggingOut}
          onPress={handleLogout}
          icon={
            <Ionicons name="log-out-outline" size={18} color={palette.danger} />
          }
          style={{ marginTop: spacing.md }}
        >
          Đăng xuất
        </Button>
      </QueryStateHandler>
    </ScreenShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderRadius: radii["2xl"],
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.lg,
    alignItems: "center",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: palette.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.borderStrong,
    marginBottom: spacing.sm,
  },
  name: { color: palette.text, fontSize: 20, fontWeight: "900" },
  email: { color: palette.textMuted, fontSize: 13, marginTop: 2 },
  infoBlock: { width: "100%", marginTop: spacing.lg },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  label: { color: palette.textSubtle, fontSize: 13 },
  value: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },
  refreshRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.md,
  },
  refreshText: { color: palette.accent, fontSize: 13, fontWeight: "800" },
  noteCard: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    backgroundColor: palette.surfaceAlt,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  noteText: {
    flex: 1,
    color: palette.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
});
