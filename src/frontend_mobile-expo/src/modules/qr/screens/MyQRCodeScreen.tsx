import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useLocalSearchParams, useRouter } from "expo-router";

import { stitchPalette } from '@/shared/theme';



export default function MyQRCodeScreen() {
  const router = useRouter();
  const { appointmentCode, driverName, licensePlate, timeSlot } = useLocalSearchParams<any>();
  

  const qrPayload = JSON.stringify({
    appointmentCode,
    driverName,
    licensePlate,
    timeSlot,
  });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.kicker}>PORT DRIVER PASS</Text>
        <Text style={styles.title}>Mã QR Check-in</Text>

        <View style={styles.qrWrapper}>
          <View style={styles.qrInner}>
            <QRCode
              value={qrPayload}
              size={220}
              color={stitchPalette.ink}
              backgroundColor="#f8f3ec"
            />
          </View>
        </View>

        <View style={styles.instructionBadge}>
          <Text style={styles.instructionText}>
            Vui lòng đưa mã này cho bảo vệ để quét
          </Text>
          <Text style={styles.instructionSubtext}>
            Please show this code to the security guard
          </Text>
        </View>

        <View style={styles.detailsBlock}>
          <DetailRow label="MÃ LỊCH HẸN" value={appointmentCode} />
          <DetailRow label="TÀI XẾ" value={driverName} />
          <DetailRow label="BIỂN SỐ" value={licensePlate} />
          <DetailRow label="KHUNG GIỜ" value={timeSlot} />
        </View>
      </View>

      <Pressable style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeButtonText}>Đóng</Text>
      </Pressable>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stitchPalette.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: stitchPalette.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: stitchPalette.borderStrong,
    padding: 24,
    alignItems: "center",
    gap: 18,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 32,
    elevation: 12,
  },
  kicker: {
    color: stitchPalette.accentSoft,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 3,
  },
  title: {
    color: stitchPalette.text,
    fontSize: 24,
    fontWeight: "900",
  },
  qrWrapper: {
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#f4ead9",
    borderWidth: 1,
    borderColor: "#f0c88f",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 8,
  },
  qrInner: {
    padding: 12,
    backgroundColor: "#f8f3ec",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionBadge: {
    width: "100%",
    backgroundColor: stitchPalette.accent,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
    gap: 4,
  },
  instructionText: {
    color: stitchPalette.ink,
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
  },
  instructionSubtext: {
    color: "rgba(17, 24, 39, 0.65)",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    fontStyle: "italic",
  },
  detailsBlock: {
    width: "100%",
    gap: 0,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: stitchPalette.borderSoft,
  },
  detailLabel: {
    color: stitchPalette.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  detailValue: {
    color: stitchPalette.text,
    fontSize: 15,
    fontWeight: "700",
  },
  closeButton: {
    marginTop: 24,
    backgroundColor: stitchPalette.surfaceAlt,
    borderColor: stitchPalette.borderStrong,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 32,
    paddingVertical: 14,
  },
  closeButtonText: {
    color: stitchPalette.text,
    fontSize: 15,
    fontWeight: "800",
  },
});
