import React from "react";
import { View, Text, Modal, Pressable, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { palette, radii, spacing } from "@/shared/theme";
import type { DriverAppointment } from "@/shared/types";

// Thẻ thông hành tài xế — QR sinh động theo từng lịch hẹn (qrToken).
export default function DriverPassModal({
  visible,
  onClose,
  appointment,
  driverName,
}: {
  visible: boolean;
  onClose: () => void;
  appointment?: DriverAppointment | null;
  driverName?: string;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.frame}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>PORT DRIVER PASS</Text>
          </View>

          <View style={styles.qrBox}>
            {appointment?.qrToken ? (
              <QRCode
                value={appointment.qrToken}
                size={220}
                backgroundColor="#ffffff"
                color="#05140b"
              />
            ) : (
              <Text style={styles.qrPlaceholder}>Không có mã QR</Text>
            )}
          </View>

          <Text style={styles.scanHint}>
            Đưa mã cho nhân viên cổng quét để vào cảng
          </Text>

          <View style={styles.infoPanel}>
            <Row label="MÃ LỊCH HẸN" value={appointment?.code ?? "-"} />
            <Row label="TÀI XẾ" value={driverName ?? "-"} />
            <Row label="BIỂN SỐ" value={appointment?.truckPlate ?? "-"} />
            <Row label="CONTAINER" value={appointment?.containerNo ?? "-"} />
            <Row label="KHUNG GIỜ" value={appointment?.timeSlot ?? "-"} />
          </View>

          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Đóng</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  frame: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: palette.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.borderStrong,
    padding: spacing.lg,
    alignItems: "center",
  },
  badge: {
    backgroundColor: palette.surfaceMuted,
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 22,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.borderStrong,
  },
  badgeText: {
    color: palette.accent,
    fontWeight: "900",
    letterSpacing: 1.3,
    fontSize: 12,
  },
  qrBox: {
    backgroundColor: "#ffffff",
    padding: 14,
    borderRadius: 16,
  },
  qrPlaceholder: {
    width: 220,
    height: 220,
    textAlign: "center",
    textAlignVertical: "center",
    color: "#64748b",
  },
  scanHint: {
    color: palette.textMuted,
    fontSize: 12,
    marginTop: spacing.md,
    textAlign: "center",
  },
  infoPanel: { marginTop: spacing.md, width: "100%" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: palette.surfaceMuted,
  },
  rowLabel: {
    color: palette.textSubtle,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  rowValue: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800",
    maxWidth: "62%",
    textAlign: "right",
  },
  closeButton: {
    marginTop: spacing.lg,
    backgroundColor: palette.accent,
    borderRadius: radii.lg,
    paddingVertical: 13,
    width: "100%",
    alignItems: "center",
  },
  closeButtonText: {
    color: palette.ink,
    fontWeight: "900",
    fontSize: 15,
  },
});
