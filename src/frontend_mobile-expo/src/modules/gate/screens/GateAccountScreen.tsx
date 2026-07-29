import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { ScreenShell } from "@/shared/components/layout/ScreenShell";
import { Button } from "@/shared/components/Button";
import { fetchMe } from "@/shared/api/mobile-api";
import { useAuth, signOut } from "@/shared/state/auth";
import { palette, radii, spacing } from "@/shared/theme";

export default function GateAccountScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  // Lấy hồ sơ mới nhất từ /auth/me, dùng dữ liệu đăng nhập sẵn có để hiện ngay.
  const { data: profile, refetch, isRefetching } = useQuery<any>({
    queryKey: ["me", "gate"],
    queryFn: fetchMe,
    initialData: (auth.user as any) ?? undefined,
  });

  const user = profile ?? auth.user ?? {};
  const gate = (user as any).gate as
    | { name: string; type: string }
    | undefined
    | null;

  async function handleSignOut() {
    setLoading(true);
    await signOut();
    router.replace("/login");
  }

  return (
    <ScreenShell
      title="TÀI KHOẢN QUẢN LÝ CỔNG"
      subtitle="Thông tin nhân viên và phiên đăng nhập."
      onReload={refetch}
      reloading={isRefetching}
    >
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Ionicons name="shield-checkmark" size={34} color={palette.accent} />
        </View>
        <Text style={styles.name}>
          {(user as any).fullName ?? "Quản lý cổng"}
        </Text>
        <Text style={styles.email}>{(user as any).email ?? ""}</Text>

        <View style={styles.infoBlock}>
          <Row label="Vai trò" value="Quản lý cổng" />
          <Row
            label="Cổng phụ trách"
            value={gate ? `${gate.name} (${gate.type})` : "Chưa phân công"}
          />
        </View>
      </View>

      <Button
        variant="danger"
        size="lg"
        loading={loading}
        onPress={handleSignOut}
        icon={<Ionicons name="log-out-outline" size={18} color={palette.danger} />}
        style={{ marginTop: spacing.md }}
      >
        Đăng xuất
      </Button>
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
  name: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "900",
  },
  email: {
    color: palette.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  infoBlock: {
    width: "100%",
    marginTop: spacing.lg,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  label: { color: palette.textSubtle, fontSize: 13 },
  value: { color: palette.text, fontSize: 15, fontWeight: "700" },
});
