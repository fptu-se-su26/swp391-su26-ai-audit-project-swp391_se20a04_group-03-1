/**
 * Snackbar — Shared Feedback Component
 *
 * Animated bottom toast notification with optional undo action.
 * Uses Moti for slide-up/fade animation. Replaces the old web-based
 * Snackbar that used HTML divs and lucide-react icons.
 *
 * @example
 * ```tsx
 * <Snackbar
 *   visible={showSnackbar}
 *   message="Spot đã được cập nhật"
 *   onDismiss={() => setShowSnackbar(false)}
 *   onUndo={handleUndo}
 * />
 * ```
 */
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { MotiView, AnimatePresence } from "moti";
import { Ionicons } from "@expo/vector-icons";
import { palette, radii, spacing } from "@/shared/theme";
import { Button } from "../Button";

interface SnackbarProps {
  /** Whether the snackbar is visible */
  visible: boolean;
  /** The message to display */
  message: string;
  /** Visual tone for the snackbar */
  variant?: "neutral" | "success" | "error";
  /** Screen position of the toast */
  position?: "bottom" | "top-right";
  /** Callback when the snackbar is dismissed */
  onDismiss: () => void;
  /** Optional undo callback — shows an "Undo" button if provided */
  onUndo?: () => void;
  /** Auto-dismiss duration in ms. Set to 0 to disable. Default: 4000 */
  duration?: number;
}

export function Snackbar({
  visible,
  message,
  variant = "neutral",
  position = "bottom",
  onDismiss,
  onUndo,
  duration = 4000,
}: SnackbarProps) {
  React.useEffect(() => {
    if (!visible || duration === 0) return;
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [visible, duration, onDismiss]);

  return (
    <AnimatePresence>
      {visible && (
        <MotiView
          from={{ opacity: 0, translateY: 60 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: 60 }}
          transition={{ type: "spring", damping: 18, stiffness: 200 }}
          style={
            position === "top-right"
              ? styles.wrapperTopRight
              : styles.wrapperBottom
          }
        >
          <View
            style={[
              styles.container,
              variant === "success" && styles.containerSuccess,
              variant === "error" && styles.containerError,
            ]}
          >
            <View style={styles.left}>
              <View style={styles.iconBox}>
                <Ionicons
                  name={
                    variant === "success"
                      ? "checkmark-circle"
                      : variant === "error"
                        ? "alert-circle"
                        : "notifications"
                  }
                  size={16}
                  color={
                    variant === "success"
                      ? "#7df0c6"
                      : variant === "error"
                        ? "#ff9c9c"
                        : palette.accent
                  }
                />
              </View>
              <View style={styles.textGroup}>
                <Text
                  style={[
                    styles.message,
                    variant === "success" && styles.messageSuccess,
                    variant === "error" && styles.messageError,
                  ]}
                  numberOfLines={2}
                >
                  {message}
                </Text>
                <Text style={styles.hint}>
                  {variant === "success"
                    ? "Cổng đã ghi nhận mã hợp lệ."
                    : variant === "error"
                      ? "Vui lòng kiểm tra lại mã và thử lại."
                      : "Hoàn tác sẽ khôi phục trạng thái trước đó."}
                </Text>
              </View>
            </View>
            <View style={styles.actions}>
              {onUndo ? (
                <Button
                  variant="outline"
                  size="xs"
                  onPress={() => {
                    onUndo();
                    onDismiss();
                  }}
                >
                  Hoàn tác
                </Button>
              ) : null}
              <Button variant="ghost" size="xs" onPress={onDismiss}>
                Đóng
              </Button>
            </View>
          </View>
        </MotiView>
      )}
    </AnimatePresence>
  );
}

const styles = StyleSheet.create({
  wrapperBottom: {
    position: "absolute",
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 50,
  },
  wrapperTopRight: {
    position: "absolute",
    top: 20,
    right: 16,
    width: 320,
    maxWidth: "92%",
    zIndex: 60,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.borderSoft,
    backgroundColor: `${palette.surface}F2`, // 95% opacity
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  containerSuccess: {
    borderColor: "rgba(125, 240, 198, 0.32)",
    backgroundColor: "#0f3b2cf2",
  },
  containerError: {
    borderColor: "rgba(255, 156, 156, 0.32)",
    backgroundColor: "#3d1f25f2",
  },
  left: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: {
    flex: 1,
  },
  message: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "600",
  },
  messageSuccess: {
    color: "#e7fff6",
  },
  messageError: {
    color: "#fff1f1",
  },
  hint: {
    color: palette.textSubtle,
    fontSize: 11,
    marginTop: 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
});
