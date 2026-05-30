import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from "react-native";
import { WebView } from "react-native-webview";

interface VideoStreamProps {
  title: string;
  cameraId: string;
  streamUrl?: string;
}

/**
 * Renders an MJPEG camera stream inside a WebView (React Native does not
 * support MJPEG natively in <Image>). Falls back to an offline state when
 * the stream URL is absent or the WebView reports an error.
 */
export function VideoStream({
  title,
  cameraId,
  streamUrl = "http://localhost:5001/video_feed",
}: VideoStreamProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Minimal HTML page that renders the MJPEG stream as a full-viewport <img>.
  const mjpegHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { background:#000; width:100vw; height:100vh; display:flex; align-items:center; justify-content:center; }
          img { width:100%; height:100%; object-fit:contain; }
        </style>
      </head>
      <body>
        <img src="${streamUrl}" />
      </body>
    </html>
  `;

  const streamContent = (
    <View style={styles.streamWrapper}>
      {/* ── MJPEG stream via WebView ── */}
      {!hasError && streamUrl ? (
        <>
          {isLoading && (
            <ActivityIndicator
              style={StyleSheet.absoluteFill}
              size="large"
              color="#94a3b8"
            />
          )}
          <WebView
            style={styles.webview}
            originWhitelist={["*"]}
            source={{ html: mjpegHtml }}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback
            onLoadEnd={() => setIsLoading(false)}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
            onHttpError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
          />
        </>
      ) : (
        /* ── Offline / error fallback ── */
        <View style={styles.offlineContainer}>
          <View style={styles.offlineIconBox}>
            <Text style={styles.offlineIcon}>📷</Text>
          </View>
          <Text style={styles.offlineTitle}>Mất tín hiệu camera</Text>
          <Text style={styles.offlineSub}>Camera ID: {cameraId}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setHasError(false);
              setIsLoading(true);
            }}
          >
            <Text style={styles.retryText}>Thử kết nối lại</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Controls overlay ── */}
      <View style={styles.overlay} pointerEvents="box-none">
        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.overlayTitle}>{title}</Text>
            <Text style={styles.overlaySub}>{cameraId}</Text>
          </View>
          <View style={styles.controlButtons}>
            {/* Mute toggle */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsMuted(!isMuted)}
            >
              <Text style={styles.iconText}>{isMuted ? "🔇" : "🔊"}</Text>
            </TouchableOpacity>

            {/* Fullscreen toggle */}
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setIsFullscreen(!isFullscreen)}
            >
              <Text style={styles.iconText}>{isFullscreen ? "⊙" : "⤢"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── LIVE / OFFLINE badge ── */}
      <View style={styles.badge}>
        <View
          style={[
            styles.badgeDot,
            { backgroundColor: !hasError ? "#fff" : "#64748b" },
          ]}
        />
        <Text style={styles.badgeText}>{!hasError ? "LIVE" : "OFFLINE"}</Text>
      </View>
    </View>
  );

  /* ── Fullscreen modal ── */
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
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: "#000",
  },
  streamWrapper: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },

  /* Offline */
  offlineContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 16,
  },
  offlineIconBox: {
    padding: 16,
    borderRadius: 9999,
    backgroundColor: "rgba(30,41,59,0.6)",
    borderWidth: 1,
    borderColor: "rgba(71,85,105,0.5)",
  },
  offlineIcon: {
    fontSize: 36,
    color: "#64748b",
  },
  offlineTitle: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  offlineSub: {
    color: "#64748b",
    fontSize: 12,
    textAlign: "center",
    marginTop: 2,
  },
  retryButton: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#475569",
  },
  retryText: {
    color: "#cbd5e1",
    fontSize: 12,
  },

  /* Controls overlay */
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  bottomBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  overlayTitle: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  overlaySub: {
    color: "#94a3b8",
    fontSize: 11,
    fontFamily: "monospace",
  },
  controlButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 8,
  },
  iconText: {
    fontSize: 16,
  },

  /* Badge */
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#dc2626",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },

  /* Fullscreen close button */
  closeButton: {
    position: "absolute",
    top: 44,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(15,23,42,0.8)",
    borderWidth: 1,
    borderColor: "rgba(71,85,105,0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
