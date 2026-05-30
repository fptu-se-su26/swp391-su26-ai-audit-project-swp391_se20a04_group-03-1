import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useLocalSearchParams, useRouter } from "expo-router";

import { stitchPalette } from "@/shared/theme";

export default function MyQRCodeScreen() {
  const router = useRouter();
  const { appointmentCode, driverName, licensePlate, timeSlot } =
    useLocalSearchParams<any>();

  const code = String(appointmentCode ?? "AP-1024");
  const driver = String(driverName ?? "Nguyen Van An");
  const plate = String(licensePlate ?? "51C-123.45");
  const slot = String(timeSlot ?? "14:20");

  const qrPayload = JSON.stringify({
    appointmentCode: code,
    driverName: driver,
    licensePlate: plate,
    timeSlot: slot,
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={styles.headerDot} />
          <Text style={styles.headerText}>ACTIVE UPLINK</Text>
        </View>
        <Text style={styles.headerCode}>SENS-ORCH-729</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.kicker}>DIGITAL MANIFEST</Text>
        <Text style={styles.title}>TAP TO SHOW CHECK-IN QR</Text>

        <View style={styles.qrWrapper}>
          <View style={styles.qrInner}>
            <QRCode
              value={qrPayload}
              size={220}
              color="#0f172a"
              backgroundColor="#f8f3ec"
            />
          </View>
        </View>

        <View style={styles.instructionBadge}>
          <Text style={styles.instructionText}>
            ĐƯA MÃ NÀY CHO BẢO VỆ QUÉT TẠI CỔNG
          </Text>
        </View>

        <View style={styles.detailsBlock}>
          <DetailRow label="MÃ LỊCH HẸN" value={code} />
          <DetailRow label="TÀI XẾ" value={driver} />
          <DetailRow label="BIỂN SỐ" value={plate} />
          <DetailRow label="KHUNG GIỜ" value={slot} />
        </View>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>ĐÓNG</Text>
        </Pressable>
      </View>
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
    backgroundColor: "#0b1326",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 28,
    justifyContent: "space-between",
  },
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.32)",
    backgroundColor: "rgba(12, 21, 44, 0.7)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor: "#34d399",
  },
  headerText: {
    color: "#5be4b4",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
  },
  headerCode: {
    color: "#d7bb8c",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(16, 24, 44, 0.9)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.35)",
    padding: 18,
    alignItems: "center",
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 18,
    elevation: 8,
  },
  kicker: {
    color: "#d7bb8c",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  title: {
    color: "#e7ecff",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  qrWrapper: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: "#f4ead9",
    borderWidth: 1,
    borderColor: "#f0c88f",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 8,
  },
  qrInner: {
    padding: 10,
    backgroundColor: "#f8f3ec",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionBadge: {
    width: "100%",
    backgroundColor: "#f59e0b",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  instructionText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.3,
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
    borderBottomColor: "rgba(148, 163, 184, 0.25)",
  },
  detailLabel: {
    color: "#9fb0d7",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  detailValue: {
    color: "#e7ecff",
    fontSize: 15,
    fontWeight: "700",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "center",
  },
  secondaryButton: {
    minWidth: 148,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    borderColor: "rgba(148, 163, 184, 0.35)",
    borderWidth: 1,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "#d7ddf0",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
});
