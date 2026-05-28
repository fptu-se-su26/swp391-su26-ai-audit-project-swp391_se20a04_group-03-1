import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../../navigation/AppNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "QRScanner">;

export default function QRScannerScreen({ navigation }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedData, setScannedData] = useState<string | null>(null);

  useEffect(() => {
    if (!permission) return;
    if (!permission.granted) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (scannedData) return;
      setScannedData(data);
      Alert.alert("Quét mã QR", `Đã quét: ${data}`, [
        {
          text: "Đóng",
          onPress: () => navigation.goBack(),
        },
      ]);
    },
    [navigation, scannedData],
  );

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Đang khởi tạo camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Cần quyền camera để quét QR</Text>
        <Text style={styles.subtitle}>
          Cho phép camera để tiếp tục check-in bằng QR.
        </Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Cấp quyền camera</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={scannedData ? undefined : handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.overlayText}>Đưa mã QR vào khung để quét</Text>
        {scannedData ? <Text style={styles.resultText}>{scannedData}</Text> : null}
      </View>

      <Pressable style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeButtonText}>Đóng màn quét</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#07111f",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(7,17,31,0.25)",
  },
  frame: {
    width: 240,
    height: 240,
    borderWidth: 2,
    borderColor: "#f59e0b",
    borderRadius: 24,
    backgroundColor: "transparent",
  },
  overlayText: {
    marginTop: 18,
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  resultText: {
    marginTop: 12,
    color: "#34d399",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  title: {
    color: "#f8fafc",
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    marginTop: 16,
    backgroundColor: "#f59e0b",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  buttonText: {
    color: "#07111f",
    fontWeight: "800",
  },
  secondaryButton: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },
  secondaryButtonText: {
    color: "#e2e8f0",
    fontWeight: "700",
  },
  closeButton: {
    position: "absolute",
    bottom: 28,
    alignSelf: "center",
    backgroundColor: "#0f1a2a",
    borderColor: "#334155",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  closeButtonText: {
    color: "#f8fafc",
    fontWeight: "700",
  },
});
