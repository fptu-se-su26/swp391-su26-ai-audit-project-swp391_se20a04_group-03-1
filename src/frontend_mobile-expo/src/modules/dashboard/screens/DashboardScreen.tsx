import React, { useMemo, useState, useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { ScreenShell } from "@/shared/components/layout/ScreenShell";
import { Snackbar } from "@/shared/components/feedback/Snackbar";
import { subscribeToScanResults } from "@/shared/api/portal-api";

type GateState = "waiting" | "success" | "error";

export default function DashboardScreen() {
  const router = useRouter();
  const [gateState, setGateState] = useState<GateState>("waiting");
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);

  const gateStatus = useMemo(() => {
    switch (gateState) {
      case "success":
        return {
          header: "TRẠNG THÁI HIỆN TẠI",
          message: "GIAI ĐOẠN: ĐÃ VÀO CỔNG",
          banner: styles.statusBannerSuccess,
          stripe: styles.statusStripeSuccess,
          text: styles.statusHeadlineSuccess,
        };
      case "error":
        return {
          header: "TRẠNG THÁI HIỆN TẠI",
          message: "CẢNH BÁO: MÃ KHÔNG HỢP LỆ",
          banner: styles.statusBannerError,
          stripe: styles.statusStripeError,
          text: styles.statusHeadlineError,
        };
      default:
        return {
          header: "TRẠNG THÁI HIỆN TẠI",
          message: "GIAI ĐOẠN: ĐANG CHỜ TẠI CỔNG",
          banner: styles.statusBannerWaiting,
          stripe: styles.statusStripeWaiting,
          text: styles.statusHeadlineWaiting,
        };
    }
  }, [gateState]);

  useEffect(() => {
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    const unsub = subscribeToScanResults((payload) => {
      if (payload.result === "ok") {
        setGateState("success");
        setSnackMessage("Đã quét thành công — Cho phép vào");
      } else {
        setGateState("error");
        setSnackMessage("Mã không hợp lệ — Không được phép vào");
      }
      setSnackVisible(true);
      // close QR modal when result arrives
      setShowQrModal(false);

      // auto-reset to waiting after a short period to return UI to default
      if (resetTimer) clearTimeout(resetTimer as ReturnType<typeof setTimeout>);
      resetTimer = setTimeout(() => setGateState("waiting"), 8000);
    });

    return () => {
      unsub();
      if (resetTimer) clearTimeout(resetTimer as ReturnType<typeof setTimeout>);
    };
  }, []);

  return (
    <ScreenShell
      title="TÀI XẾ CẢNG"
      subtitle="Cảng thông minh IoT · giao diện tối cho tài xế"
      hideHeader
    >
      <View style={styles.headerBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            {Array.from({ length: 5 }).map((_, index) => (
              <View key={`brand-dot-${index}`} style={styles.brandDot} />
            ))}
          </View>
          <View>
            <Text style={styles.brandText}>PORT DRIVER</Text>
            <Text style={styles.brandSubtext}>SMART PORT IOT</Text>
          </View>
        </View>
        <View style={styles.signalGlyph} />
      </View>

      <View style={styles.sectionPanel}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.connectionRow}>
            <View style={styles.connectionDot} />
            <Text style={styles.sectionHeaderLeft}>ACTIVE UPLINK</Text>
          </View>
          <Text style={styles.sectionHeaderRight}>SENS-ORCH-729</Text>
        </View>
        <View style={[styles.statusBannerBase, gateStatus.banner]}>
          <View style={[styles.statusStripeBase, gateStatus.stripe]} />
          <View style={styles.statusBody}>
            <Text style={styles.statusKicker}>{gateStatus.header}</Text>
            <Text style={[styles.statusHeadlineBase, gateStatus.text]}>
              {gateStatus.message}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionPanel}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeaderLeft}>DIGITAL MANIFEST</Text>
          <Text style={styles.sectionHeaderRight}>TXN-992-K</Text>
        </View>

        <Pressable
          style={styles.qrCard}
          onPress={() => {
            setShowQrModal(true);
          }}
          accessibilityRole="button"
          accessibilityLabel="Chạm để mở mã QR check-in"
        >
          <View style={styles.qrFrame}>
            <MiniQrPreview />
          </View>
          <View style={styles.qrBadge}>
            <Text style={styles.qrBadgeText}>TAP TO CHECK-IN</Text>
          </View>
        </Pressable>

        {showQrModal && (
          <View style={styles.qrModalOverlay} pointerEvents="auto">
            <View style={styles.qrModalInner}>
              <View style={styles.qrModalFrame}>
                <LargeQrDisplay />
              </View>
              <View style={styles.qrModalActions}>
                <Text style={styles.hintText}>Đưa mã cho bảo vệ quét tại cổng. Chờ kết quả...</Text>
                <Pressable
                  style={styles.resetButton}
                  onPress={() => setShowQrModal(false)}
                  accessibilityRole="button"
                >
                  <Text style={styles.resetButtonText}>ĐÓNG</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>

      <View style={styles.hintPanel}>
        <Text style={styles.hintTitle}>LUỒNG THAO TÁC NHANH CHO TÀI XẾ</Text>
        <Text style={styles.hintText}>
          1. Mở mã QR bằng nút TAP TO CHECK-IN.
        </Text>
        <Text style={styles.hintText}>2. Đưa mã cho bảo vệ quét tại cổng.</Text>
        <Text style={styles.hintText}>
          3. Bảo vệ quét mã — ứng dụng sẽ nhận thông báo kết quả tự động.
        </Text>
      </View>

      <Snackbar
        visible={snackVisible}
        message={snackMessage}
        onDismiss={() => setSnackVisible(false)}
      />

      <View style={styles.footerSpacer} />
    </ScreenShell>
  );
}

function MiniQrPreview() {
  const modules = [
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 1, 0, 1, 0, 1],
    [1, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 0, 0],
    [1, 1, 1, 0, 1, 1, 1],
    [1, 0, 0, 1, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1],
  ];

  return (
    <View style={styles.qrGrid}>
      {modules.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.qrRow}>
          {row.map((cell, cellIndex) => (
            <View
              key={`cell-${rowIndex}-${cellIndex}`}
              style={[styles.qrCell, cell === 0 && styles.qrCellEmpty]}
            />
          ))}
        </View>
      ))}
      <View style={styles.qrCenterDot} />
    </View>
  );
}

function LargeQrDisplay() {
  return (
    <View style={{flex:1, alignItems:'center', justifyContent:'center'}}>
      <View style={{width:320, height:320, padding:18, borderRadius:20, backgroundColor:'#f4ead9', borderWidth:1, borderColor:'#f0c88f'}}>
        <MiniQrPreview />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  brandMark: {
    width: 30,
    height: 30,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  brandDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#f6c06a",
  },
  brandText: {
    color: "#f6c06a",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0.9,
  },
  brandSubtext: {
    color: "#9fb0d7",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2.2,
    marginTop: 1,
  },
  signalGlyph: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#f6c06a",
    borderTopColor: "transparent",
    borderLeftColor: "transparent",
    transform: [{ rotate: "45deg" }],
  },
  connectionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  connectionDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#5be4b4",
    shadowColor: "#5be4b4",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 5,
  },
  sectionPanel: {
    borderWidth: 1,
    borderColor: "rgba(246, 192, 106, 0.35)",
    backgroundColor: "rgba(16, 24, 44, 0.88)",
    padding: 14,
    gap: 14,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionHeaderLeft: {
    color: "#d7ddf0",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  sectionHeaderRight: {
    color: "#d7bb8c",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  statusBannerBase: {
    minHeight: 156,
    flexDirection: "row",
    overflow: "hidden",
  },
  statusBannerWaiting: {
    backgroundColor: "#4a3b28",
  },
  statusBannerSuccess: {
    backgroundColor: "#0f3b2c",
  },
  statusBannerError: {
    backgroundColor: "#3d1f25",
  },
  statusStripeBase: {
    width: 8,
  },
  statusStripeWaiting: {
    backgroundColor: "#f6c06a",
  },
  statusStripeSuccess: {
    backgroundColor: "#10b981",
  },
  statusStripeError: {
    backgroundColor: "#ef4444",
  },
  statusBody: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: "center",
  },
  statusKicker: {
    color: "#f1bf7b",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginBottom: 12,
  },
  statusHeadlineBase: {
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 37,
    letterSpacing: 0.3,
  },
  statusHeadlineWaiting: {
    color: "#f8c883",
  },
  statusHeadlineSuccess: {
    color: "#7df0c6",
  },
  statusHeadlineError: {
    color: "#ff9c9c",
  },
  qrCard: {
    alignItems: "center",
    gap: 16,
  },
  qrFrame: {
    width: 300,
    height: 300,
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#f4ead9",
    borderWidth: 1,
    borderColor: "#f0c88f",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 20,
    elevation: 8,
  },
  qrGrid: {
    flex: 1,
    backgroundColor: "#111318",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 14,
    borderColor: "#f8f3ec",
    position: "relative",
  },
  qrRow: {
    flexDirection: "row",
  },
  qrCell: {
    width: 19,
    height: 19,
    margin: 2,
    backgroundColor: "#f5f7fb",
  },
  qrCellEmpty: {
    backgroundColor: "#151a1f",
  },
  qrCenterDot: {
    position: "absolute",
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#e24d3a",
  },
  qrBadge: {
    width: "100%",
    backgroundColor: "#f6c06a",
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#111827",
  },
  qrBadgeText: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  quickAction: {
    flex: 1,
    minHeight: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  quickActionSuccess: {
    backgroundColor: "rgba(16, 185, 129, 0.16)",
    borderColor: "rgba(16, 185, 129, 0.55)",
  },
  quickActionError: {
    backgroundColor: "rgba(239, 68, 68, 0.16)",
    borderColor: "rgba(239, 68, 68, 0.55)",
  },
  quickActionSuccessText: {
    color: "#86efcd",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  quickActionErrorText: {
    color: "#fecaca",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  errorPanel: {
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.5)",
    backgroundColor: "rgba(61, 31, 37, 0.78)",
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  errorTitle: {
    color: "#ffb4b4",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  errorText: {
    color: "#fcd5d5",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  resetButton: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(246, 192, 106, 0.5)",
    backgroundColor: "rgba(245, 158, 11, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    color: "#f6c06a",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  hintPanel: {
    borderWidth: 1,
    borderColor: "rgba(246, 192, 106, 0.25)",
    backgroundColor: "rgba(16, 24, 44, 0.66)",
    borderRadius: 12,
    padding: 12,
    gap: 5,
  },
  hintTitle: {
    color: "#dbe3fb",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  hintText: {
    color: "#bfc8df",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  footerSpacer: {
    height: 12,
  },
  qrModalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(2,6,23,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  qrModalInner: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  qrModalFrame: {
    width: '100%',
    backgroundColor: '#f4ead9',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0c88f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrModalActions: {
    marginTop: 12,
    alignItems: 'center',
    gap: 10,
  },
});
