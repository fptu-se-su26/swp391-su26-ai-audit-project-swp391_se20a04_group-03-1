import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";

type Props = {
  onScan?: (data: string) => void;
};

export default function QRScannerNative({ onScan }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <Text style={styles.center}>Đang kiểm tra quyền camera...</Text>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.center}>Camera không khả dụng hoặc quyền bị từ chối.</Text>
        <Button title="Cấp quyền Camera" onPress={requestPermission} />
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    setScanned(true);
    onScan?.(data);
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.center}>Đang quét mã QR...</Text>
      <View style={styles.previewPlaceholder}>
        <CameraView
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          style={StyleSheet.absoluteFill}
        />
      </View>
      {scanned && <Button title="Chạm để quét lại" onPress={() => setScanned(false)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  center: { textAlign: "center", marginBottom: 8 },
  previewPlaceholder: {
    width: "100%",
    height: 320,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#0b0b0b",
    borderWidth: 1,
    borderColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
});
