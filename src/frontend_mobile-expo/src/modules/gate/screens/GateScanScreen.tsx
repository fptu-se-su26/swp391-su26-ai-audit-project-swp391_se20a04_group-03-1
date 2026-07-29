import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ScreenShell } from "@/shared/components/layout/ScreenShell";
import { Button } from "@/shared/components/Button";
import { QRScanner } from "@/shared/components/media/QRScanner";
import { gateScanRequest } from "@/shared/api/mobile-api";
import { palette, radii, spacing } from "@/shared/theme";
import type { GateScanResult } from "@/shared/types";

type Mode = "idle" | "scanning" | "loading" | "result";

const REASON_TEXT: Record<string, string> = {
  INVALID_TOKEN: "Mã QR không hợp lệ hoặc đã hết hạn.",
  WRONG_TYPE: "Mã QR không đúng định dạng của hệ thống.",
  NOT_FOUND: "Không tìm thấy lịch hẹn tương ứng.",
  CANCELLED: "Lịch hẹn đã bị hủy — không được phép vào.",
  COMPLETED: "Lịch hẹn đã hoàn tất trước đó.",
  NOT_CONFIRMED: "Lịch hẹn chưa được duyệt — không thể qua cổng.",
  OUT_OF_WINDOW: "Chưa tới hoặc đã quá khung giờ lịch hẹn.",
  YARD_FULL: "Bãi đỗ đã đầy — chưa thể cho xe vào.",
  UNKNOWN: "Không xác thực được mã QR.",
};

export default function GateScanScreen() {
  const [mode, setMode] = useState<Mode>("idle");
  const [result, setResult] = useState<GateScanResult | null>(null);
  const [error, setError] = useState("");
  const [manualToken, setManualToken] = useState("");

  async function verify(token: string) {
    if (!token.trim()) return;
    setMode("loading");
    setError("");
    try {
      const res = await gateScanRequest(token.trim());
      setResult(res);
      setMode("result");
      await Haptics.notificationAsync(
        res.valid
          ? Haptics.NotificationFeedbackType.Success
          : Haptics.NotificationFeedbackType.Error,
      );
    } catch (err: any) {
      setError(err?.message ?? "Không thể xử lý quét cổng");
      setMode("idle");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  function reset() {
    setResult(null);
    setError("");
    setManualToken("");
    setMode("idle");
  }

  return (
    <ScreenShell
      title="QUÉT CỔNG THỦ CÔNG"
      subtitle="Dùng khi AI quét cổng không xử lý được — quét mã QR của tài xế để xác thực."
      // Màn này không có dữ liệu để tải lại; nút làm mới đưa về trạng thái sẵn
      // sàng quét, hữu ích khi đang kẹt ở màn kết quả hoặc thông báo lỗi.
      onReload={reset}
    >
      {/* Trạng thái nhàn rỗi / lỗi */}
      {mode === "idle" && (
        <View style={styles.panel}>
          <View style={styles.iconCircle}>
            <Ionicons name="qr-code-outline" size={40} color={palette.accent} />
          </View>
          <Text style={styles.panelTitle}>Sẵn sàng quét</Text>
          <Text style={styles.panelHint}>
            Nhấn nút bên dưới để mở camera và quét mã QR trên điện thoại tài xế.
          </Text>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <Button
            variant="primary"
            size="lg"
            onPress={() => setMode("scanning")}
            icon={<Ionicons name="scan-outline" size={18} color={palette.ink} />}
            style={{ marginTop: spacing.md, width: "100%" }}
          >
            Mở camera quét
          </Button>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>HOẶC NHẬP TAY</Text>
            <View style={styles.dividerLine} />
          </View>

          <TextInput
            value={manualToken}
            onChangeText={setManualToken}
            placeholder="Dán/nhập mã QR khi camera lỗi"
            placeholderTextColor={palette.textSubtle}
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />
          <Button
            variant="outline"
            size="md"
            onPress={() => verify(manualToken)}
            disabled={!manualToken.trim()}
            style={{ marginTop: spacing.sm, width: "100%" }}
          >
            Xác thực mã đã nhập
          </Button>
        </View>
      )}

      {/* Đang xác thực */}
      {mode === "loading" && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Đang xác thực…</Text>
        </View>
      )}

      {/* Kết quả */}
      {mode === "result" && result && (
        <ResultCard result={result} onNext={reset} />
      )}

      {/* Camera quét toàn màn hình */}
      <Modal visible={mode === "scanning"} animationType="slide">
        <QRScanner
          onScan={(data) => verify(data)}
          onClose={() => setMode("idle")}
        />
      </Modal>
    </ScreenShell>
  );
}

function ResultCard({
  result,
  onNext,
}: {
  result: GateScanResult;
  onNext: () => void;
}) {
  const valid = result.valid;
  const appt = result.appointment;
  const driver = result.driver;
  const isCheckOut = result.direction === "out";

  // Tiêu đề theo chiều qua cổng: vào (check-in) hay ra (check-out).
  const title = valid
    ? isCheckOut
      ? "ĐÃ CHECK-OUT — CHO PHÉP RA"
      : "ĐÃ CHECK-IN — CHO PHÉP VÀO"
    : "KHÔNG HỢP LỆ";

  return (
    <View
      style={[
        styles.resultCard,
        { borderColor: valid ? palette.success : palette.danger },
      ]}
    >
      <View
        style={[
          styles.resultBadge,
          {
            backgroundColor: valid
              ? "rgba(30,215,96,0.14)"
              : "rgba(239,68,68,0.14)",
          },
        ]}
      >
        <Ionicons
          name={
            valid
              ? isCheckOut
                ? "exit-outline"
                : "enter-outline"
              : "close-circle"
          }
          size={44}
          color={valid ? palette.success : palette.danger}
        />
      </View>

      <Text
        style={[
          styles.resultTitle,
          { color: valid ? palette.success : palette.danger },
        ]}
      >
        {title}
      </Text>

      {valid && result.message ? (
        <Text style={styles.resultReason}>{result.message}</Text>
      ) : null}

      {!valid && (
        <Text style={styles.resultReason}>
          {result.message ||
            REASON_TEXT[result.reason ?? "UNKNOWN"] ||
            "Không hợp lệ."}
        </Text>
      )}

      {valid && appt && (
        <View style={styles.infoBlock}>
          <InfoRow
            label="Chiều"
            value={isCheckOut ? "Ra cổng (Check-out)" : "Vào cổng (Check-in)"}
          />
          {!isCheckOut && result.assignedSlot ? (
            <InfoRow label="Ô đỗ được cấp" value={result.assignedSlot} />
          ) : null}
          <InfoRow label="Mã lịch hẹn" value={appt.code} />
          <InfoRow label="Tài xế" value={driver?.fullName ?? "-"} />
          <InfoRow label="Biển số" value={appt.truckPlate} />
          <InfoRow label="Container" value={appt.containerNo} />
          <InfoRow label="Khung giờ" value={appt.timeSlot} />
          <InfoRow label="Mục đích" value={appt.purpose} />
          <InfoRow label="Trạng thái" value={appt.status} />
        </View>
      )}

      <Button
        variant="primary"
        size="lg"
        onPress={onNext}
        style={{ marginTop: spacing.lg, width: "100%" }}
      >
        Quét tiếp
      </Button>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: palette.surface,
    borderRadius: radii["2xl"],
    borderWidth: 1,
    borderColor: palette.borderSoft,
    padding: spacing.lg,
    alignItems: "center",
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 9999,
    backgroundColor: palette.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: palette.borderStrong,
    marginBottom: spacing.md,
  },
  panelTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
  },
  panelHint: {
    color: palette.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 19,
  },
  errorText: {
    color: palette.danger,
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: palette.surfaceMuted,
  },
  dividerText: {
    color: palette.textSubtle,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
  },
  input: {
    width: "100%",
    minHeight: 60,
    backgroundColor: palette.bgDeep,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.surfaceMuted,
    color: palette.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    textAlignVertical: "top",
  },
  resultCard: {
    backgroundColor: palette.surface,
    borderRadius: radii["2xl"],
    borderWidth: 2,
    padding: spacing.lg,
    alignItems: "center",
  },
  resultBadge: {
    width: 84,
    height: 84,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  resultReason: {
    color: palette.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  infoBlock: {
    width: "100%",
    marginTop: spacing.lg,
    gap: 2,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  infoLabel: {
    color: palette.textSubtle,
    fontSize: 13,
  },
  infoValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "700",
    maxWidth: "60%",
    textAlign: "right",
  },
});
