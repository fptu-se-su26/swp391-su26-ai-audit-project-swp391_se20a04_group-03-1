import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { palette, radii, spacing } from "@/shared/theme";

// Tài khoản mobile do quản trị viên/công ty cấp -> không tự đặt lại mật khẩu.
// Màn này hướng dẫn liên hệ để được cấp lại.
export default function ForgotScreen() {
  const router = useRouter();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={28} color={palette.accent} />
          </View>
          <Text style={styles.title}>Quên mật khẩu?</Text>
          <Text style={styles.body}>
            Tài khoản trên ứng dụng do quản trị viên hệ thống hoặc công ty của
            bạn cấp. Để được cấp lại mật khẩu, vui lòng liên hệ:
          </Text>

          <View style={styles.infoBlock}>
            <Row
              icon="business-outline"
              label="Tài xế"
              value="Liên hệ công ty vận tải quản lý tài khoản của bạn."
            />
            <Row
              icon="shield-checkmark-outline"
              label="Quản lý cổng"
              value="Liên hệ quản trị viên cảng (bộ phận vận hành)."
            />
          </View>

          <Pressable onPress={() => router.replace("/login")} style={styles.button}>
            <Text style={styles.buttonText}>Quay lại đăng nhập</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={palette.accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: palette.bgDeep },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: palette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 9999,
    backgroundColor: palette.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.borderStrong,
    marginBottom: spacing.md,
  },
  title: { color: palette.text, fontSize: 22, fontWeight: "900" },
  body: {
    color: palette.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  infoBlock: { marginTop: spacing.lg, gap: spacing.md },
  row: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  rowLabel: { color: palette.text, fontSize: 15, fontWeight: "800" },
  rowValue: { color: palette.textMuted, fontSize: 13, marginTop: 2, lineHeight: 18 },
  button: {
    marginTop: spacing.xl,
    backgroundColor: palette.accent,
    borderRadius: radii.lg,
    paddingVertical: 14,
    alignItems: "center",
  },
  buttonText: { color: palette.ink, fontWeight: "900", fontSize: 15 },
});
