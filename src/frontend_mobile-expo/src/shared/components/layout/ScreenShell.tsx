/**
 * ScreenShell — Shared Layout Component
 *
 * Khung màn hình dùng chung: header (thanh nhấn, tiêu đề, mô tả) + vùng nội dung
 * cuộn được, kèm nút tải lại tuỳ chọn.
 */
import React, { type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
// SafeAreaView của react-native KHÔNG có tác dụng trên Android (chỉ iOS), nên
// dùng bản của safe-area-context để chừa đúng tai thỏ / thanh phím ảo.
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { palette, radii, spacing } from "@/shared/theme";
import { useTabBarHeight } from "@/shared/hooks/use-tab-bar-style";

interface ScreenShellProps {
  /** Screen title */
  title: string;
  /** Screen subtitle */
  subtitle: string;
  /** Screen content */
  children: ReactNode;
  /** Hide the decorative header card */
  hideHeader?: boolean;
  /**
   * Có nút tải lại + kéo-xuống-để-làm-mới khi truyền hàm này.
   * Trả về `unknown` để nhận thẳng `refetch` của react-query (vốn trả về
   * Promise<QueryObserverResult>) mà không phải bọc lại ở từng màn.
   */
  onReload?: () => unknown;
  /** Đang tải lại -> nút quay vòng và bị khoá. */
  reloading?: boolean;
}

export function ScreenShell({
  title,
  subtitle,
  children,
  hideHeader = false,
  onReload,
  reloading = false,
}: ScreenShellProps) {
  const tabBarHeight = useTabBarHeight();

  return (
    // edges: bỏ "bottom" vì thanh tab đã tự chừa vùng phím ảo rồi — chừa hai lần
    // sẽ tạo khoảng trống thừa.
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          // Chừa đáy đúng bằng chiều cao thanh tab để nội dung cuối không bị che.
          { paddingBottom: tabBarHeight + spacing.lg },
        ]}
        refreshControl={
          onReload ? (
            <RefreshControl
              refreshing={reloading}
              onRefresh={() => {
                void onReload();
              }}
              tintColor={palette.accent}
              colors={[palette.accent]}
              progressBackgroundColor={palette.surface}
            />
          ) : undefined
        }
      >
        {!hideHeader ? (
          <View style={styles.header}>
            <View style={styles.headerRow}>
              <View style={styles.headerText}>
                <View style={styles.accentBar} />
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
              {onReload ? (
                <Pressable
                  onPress={() => {
                    void onReload();
                  }}
                  disabled={reloading}
                  accessibilityLabel="Tải lại dữ liệu"
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.reloadButton,
                    pressed && styles.reloadButtonPressed,
                    reloading && styles.reloadButtonDisabled,
                  ]}
                >
                  {reloading ? (
                    <ActivityIndicator size="small" color={palette.accent} />
                  ) : (
                    <Ionicons name="refresh" size={18} color={palette.accent} />
                  )}
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.bg,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    backgroundColor: palette.surfaceAlt,
    borderRadius: radii["2xl"],
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  accentBar: {
    height: 4,
    width: 56,
    borderRadius: 9999,
    backgroundColor: palette.accent,
    marginBottom: spacing.sm,
  },
  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: palette.textMuted,
    fontSize: 12,
    lineHeight: 17,
  },
  reloadButton: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.borderSoft,
  },
  reloadButtonPressed: {
    backgroundColor: palette.surfaceMuted,
  },
  reloadButtonDisabled: {
    opacity: 0.6,
  },
});
