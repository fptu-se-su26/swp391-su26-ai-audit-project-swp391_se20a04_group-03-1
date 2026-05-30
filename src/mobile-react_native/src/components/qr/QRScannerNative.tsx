import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";

// This is a POC skeleton using react-native-vision-camera.
// Hướng dẫn cài đặt:
// 1. yarn add react-native-vision-camera
// 2. làm theo hướng dẫn cài đặt native trong README của thư viện (quyền camera, cấu hình Android/iOS)

// File này cố ý giữ logic tối giản để kiểm tra quyền camera và khả năng render.

type Props = {
  onScan?: (data: string) => void;
};

export default function QRScannerNative({ onScan }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(false);
  const [scannerAvailable, setScannerAvailable] = useState<boolean>(false);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    async function request() {
      try {
        const CameraModule = await import("react-native-vision-camera");
        const Cam: any = CameraModule;
        const status = await Cam.Camera.getCameraPermissionStatus();
        if (status !== "authorized") {
          const req = await Cam.Camera.requestCameraPermission();
          setHasPermission(req === "authorized");
        } else {
          setHasPermission(true);
        }

        // Best-effort: check for camera devices (may vary by version)
        try {
          const devices = await (Cam && Cam.getAvailableCameraDevices
            ? Cam.getAvailableCameraDevices()
            : Cam.devices());
          setCameraAvailable(Boolean(devices && devices.length !== 0));
        } catch (err) {
          setCameraAvailable(true);
        }

        // Detect optional scanner plugin
        try {
          await import("vision-camera-code-scanner");
          setScannerAvailable(true);
        } catch (err) {
          setScannerAvailable(false);
        }
      } catch (e) {
        setHasPermission(false as any);
        setCameraAvailable(false);
        setScannerAvailable(false);
      }
    }

    request();
  }, []);

  const handleSimulate = useCallback(() => {
    onScan?.("POC-QR-12345");
  }, [onScan]);

  if (hasPermission === null)
    return <Text style={styles.center}>Đang kiểm tra quyền camera...</Text>;

  if (hasPermission === false || !cameraAvailable) {
    return (
      <View style={styles.container}>
        <Text style={styles.center}>
          Camera không khả dụng hoặc quyền truy cập bị từ chối.
        </Text>
        <Text style={styles.instructions}>
          Cài `react-native-vision-camera` và làm theo cấu hình native. Để bật
          giải mã QR tự động, hãy cài thêm `vision-camera-code-scanner` và
          `react-native-reanimated`.
        </Text>
        <Button title="Mô phỏng quét" onPress={handleSimulate} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.center}>
        Camera sẵn sàng{scannerAvailable ? " — đã bật trình quét" : ""}.
      </Text>
      <View style={styles.previewPlaceholder}>
        <Text style={{ color: "#999" }}>
          Xem trước camera (giao diện native sẽ hiển thị tại đây sau khi cấu hình)
        </Text>
      </View>
      <View style={{ marginTop: 12 }}>
        {scannerAvailable ? (
          <Text style={styles.instructions}>
            Đã phát hiện plugin quét — frame processor sẽ giải mã mã QR.
          </Text>
        ) : (
          <Button title="Mô phỏng quét" onPress={handleSimulate} />
        )}
      </View>
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
  instructions: { marginTop: 8, color: "#999" },
  previewPlaceholder: {
    width: "100%",
    height: 320,
    borderRadius: 12,
    backgroundColor: "#0b0b0b",
    borderWidth: 1,
    borderColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
});
