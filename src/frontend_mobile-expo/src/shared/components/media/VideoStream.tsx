/**
 * VideoStream — Shared Media Component
 *
 * Renders an MJPEG camera stream inside a WebView.
 * Falls back to an offline state when the stream URL is absent or errors.
 * Supports fullscreen modal mode.
 *
 * NOTE: `react-native-webview` is not included in Expo SDK by default.
 * This component uses a simulated placeholder until webview is installed.
 * Run `npx expo install react-native-webview` when ready to use real streams.
 *
 * @example
 * ```tsx
 * <VideoStream title="Gate A" cameraId="CAM-01" />
 * ```
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { palette, radii, spacing } from '@/shared/theme';

interface VideoStreamProps {
  title: string;
  cameraId: string;
  streamUrl?: string;
}

export function VideoStream({
  title,
  cameraId,
  streamUrl,
}: VideoStreamProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, _setHasError] = useState(!streamUrl);

  const streamContent = (
    <View style={styles.streamWrapper}>
      {/* Offline / placeholder fallback */}
      {hasError || !streamUrl ? (
        <View style={styles.offlineContainer}>
          <View style={styles.offlineIconBox}>
            <Text style={styles.offlineIcon}>📷</Text>
          </View>
          <Text style={styles.offlineTitle}>Mất tín hiệu camera</Text>
          <Text style={styles.offlineSub}>Camera ID: {cameraId}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              // Will reconnect when WebView is integrated
            }}
          >
            <Text style={styles.retryText}>Thử kết nối lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.offlineContainer}>
          <ActivityIndicator size="large" color={palette.textSubtle} />
          <Text style={styles.offlineTitle}>Stream loading…</Text>
        </View>
      )}

      {/* Controls overlay */}
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.overlayTitle}>{title}</Text>
            <Text style={styles.overlaySub}>{cameraId}</Text>
          </View>
          <View style={styles.controlButtons}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Text style={styles.iconText}>{isMuted ? '🔇' : '🔊'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsFullscreen(!isFullscreen)}
            >
              <Text style={styles.iconText}>{isFullscreen ? '⊙' : '⤢'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* LIVE / OFFLINE badge */}
      <View style={styles.badge}>
        <View
          style={[
            styles.badgeDot,
            { backgroundColor: !hasError ? '#fff' : palette.textSubtle },
          ]}
        />
        <Text style={styles.badgeText}>
          {!hasError ? 'LIVE' : 'OFFLINE'}
        </Text>
      </View>
    </View>
  );

  if (isFullscreen) {
    return (
      <Modal
        visible={isFullscreen}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setIsFullscreen(false)}
      >
        <View style={styles.fullscreenContainer}>
          {streamContent}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsFullscreen(false)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return <View style={styles.card}>{streamContent}</View>;
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  streamWrapper: {
    flex: 1,
    backgroundColor: palette.surfaceAlt,
  },
  offlineContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  offlineIconBox: {
    padding: spacing.lg,
    borderRadius: 9999,
    backgroundColor: 'rgba(30,41,59,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(71,85,105,0.5)',
  },
  offlineIcon: {
    fontSize: 36,
    color: palette.textSubtle,
  },
  offlineTitle: {
    color: palette.textSubtle,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  offlineSub: {
    color: palette.textSubtle,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 2,
  },
  retryButton: {
    marginTop: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: palette.surfaceMuted,
  },
  retryText: {
    color: palette.textMuted,
    fontSize: 12,
  },
  overlay: {
    ...(StyleSheet.absoluteFill as object),
    justifyContent: 'flex-end',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  overlaySub: {
    color: palette.textSubtle,
    fontSize: 11,
    fontFamily: 'monospace',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radii.sm,
  },
  iconText: {
    fontSize: 16,
  },
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#dc2626',
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 44,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(15,23,42,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(71,85,105,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
