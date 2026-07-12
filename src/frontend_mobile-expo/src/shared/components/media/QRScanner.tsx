/**
 * QRScanner — Shared Media Component
 *
 * Full rewrite using `expo-camera` instead of `react-native-vision-camera`.
 * Uses the Expo Camera API for barcode scanning with built-in permission handling.
 *
 * @example
 * ```tsx
 * <QRScanner
 *   onScan={(data) => console.log('Scanned:', data)}
 *   onClose={() => navigation.goBack()}
 * />
 * ```
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { palette, radii, spacing } from '@/shared/theme';
import { Button } from '../Button';

interface QRScannerProps {
  /** Called when a QR/barcode is successfully scanned */
  onScan?: (data: string) => void;
  /** Close/dismiss callback */
  onClose?: () => void;
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission?.granted && permission?.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const handleBarCodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;
    setScanned(true);
    onScan?.(result.data);
  };

  // ─── Permission not yet determined ───────────────────────────────────────
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.statusText}>Đang kiểm tra quyền camera...</Text>
      </View>
    );
  }

  // ─── Permission denied ───────────────────────────────────────────────────
  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.deniedIconBox}>
          <Ionicons name="camera-outline" size={48} color={palette.textSubtle} />
        </View>
        <Text style={styles.deniedTitle}>Cần quyền truy cập Camera</Text>
        <Text style={styles.deniedBody}>
          Ứng dụng cần quyền camera để quét mã QR. Vui lòng cấp quyền trong cài
          đặt.
        </Text>
        <Button variant="primary" onPress={requestPermission}>
          Cấp quyền Camera
        </Button>
      </View>
    );
  }

  // ─── Camera view with barcode scanner ────────────────────────────────────
  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['qr', 'ean13', 'code128'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      {/* Scan overlay */}
      <View style={styles.scanOverlay}>
        {/* Top bar */}
        <View style={styles.topBar}>
          {onClose ? (
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          ) : null}
          <Text style={styles.scanTitle}>Quét mã QR</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Scan window */}
        <View style={styles.scanWindow}>
          {/* Corner decorations */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>

        <Text style={styles.scanHint}>
          {scanned
            ? 'Đã quét thành công!'
            : 'Đặt mã QR trong khung để quét tự động'}
        </Text>

        {scanned ? (
          <Button
            variant="primary"
            size="md"
            onPress={() => setScanned(false)}
          >
            Quét lại
          </Button>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    gap: spacing.lg,
    backgroundColor: palette.bg,
  },
  statusText: {
    color: palette.textMuted,
    fontSize: 14,
  },
  deniedIconBox: {
    padding: spacing.xl,
    borderRadius: 9999,
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1,
    borderColor: palette.borderSoft,
  },
  deniedTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  deniedBody: {
    color: palette.textMuted,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanOverlay: {
    ...(StyleSheet.absoluteFill as object),
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  topBar: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  scanWindow: {
    width: 260,
    height: 260,
    borderRadius: radii.lg,
    borderWidth: 2,
    borderColor: 'rgba(30, 215, 96, 0.5)',
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderColor: palette.accent,
    borderWidth: 3,
  },
  cornerTL: {
    top: -1,
    left: -1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: radii.lg,
  },
  cornerTR: {
    top: -1,
    right: -1,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: radii.lg,
  },
  cornerBL: {
    bottom: -1,
    left: -1,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: radii.lg,
  },
  cornerBR: {
    bottom: -1,
    right: -1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: radii.lg,
  },
  scanHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: spacing['3xl'],
  },
});
