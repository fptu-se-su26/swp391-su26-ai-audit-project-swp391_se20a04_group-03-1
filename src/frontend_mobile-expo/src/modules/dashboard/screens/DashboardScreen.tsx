import React, { useMemo, useState, useEffect } from "react";
import { Pressable, Text, View, Image } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenShell } from "@/shared/components/layout/ScreenShell";
import { Snackbar } from "@/shared/components/feedback/Snackbar";
import { subscribeToScanResults } from "@/shared/api/portal-api";
import styles from "../style/Dashboard.style";
import DriverPassModal from "../components/DriverPassModal";
import { getProfile } from "@/shared/state/profile";

type GateState = "waiting" | "success" | "error";

export default function DashboardScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ authToast?: string }>();
  const [gateState, setGateState] = useState<GateState>("waiting");
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [loginToastVisible, setLoginToastVisible] = useState(false);
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
    if (params.authToast === "login-success") {
      setLoginToastVisible(true);
      const timer = setTimeout(() => setLoginToastVisible(false), 2600);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [params.authToast]);

  useEffect(() => {
    // Only subscribe to scan results while the QR modal is open. This avoids
    // receiving events (or simulated events) while the driver hasn't opened
    // the modal yet.
    if (!showQrModal) return;

    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let closeTimer: ReturnType<typeof setTimeout> | null = null;
    const unsub = subscribeToScanResults((payload) => {
      if (payload.result === "ok") {
        setGateState("success");
        setSnackMessage("Đã quét thành công — Cho phép vào");
        if (closeTimer)
          clearTimeout(closeTimer as ReturnType<typeof setTimeout>);
        closeTimer = setTimeout(() => setShowQrModal(false), 1800);
      } else {
        setGateState("error");
        setSnackMessage("Mã không hợp lệ — Không được phép vào");
        setShowQrModal(false);
      }
      setSnackVisible(true);

      // auto-reset to waiting after a short period to return UI to default
      if (resetTimer) clearTimeout(resetTimer as ReturnType<typeof setTimeout>);
      resetTimer = setTimeout(() => setGateState("waiting"), 8000);
    });

    return () => {
      unsub();
      if (resetTimer) clearTimeout(resetTimer as ReturnType<typeof setTimeout>);
      if (closeTimer) clearTimeout(closeTimer as ReturnType<typeof setTimeout>);
    };
  }, [showQrModal]);

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
            <Text style={styles.brandText}>TÀI XẾ CẢNG</Text>
            <Text style={styles.brandSubtext}>
              LOGIPORT MANAGEMENT SYSTEM V2.0
            </Text>
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
          <Text style={styles.sectionHeaderLeft}>MÃ QR QUÉT CỔNG </Text>
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
            <Image
              source={require("../../../../assets/images/qr.png")}
              style={styles.qrImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.qrBadge}>
            <Text style={styles.qrBadgeText}>MỞ MÃ QR</Text>
          </View>
        </Pressable>

        <DriverPassModal
          visible={showQrModal}
          onClose={() => setShowQrModal(false)}
          profile={getProfile()}
          appointment={{ code: "AP-1024", time: "09:30" }}
          verified={gateState === "success"}
        />
      </View>

      <View style={styles.hintPanel}>
        <Text style={styles.hintTitle}>LUỒNG THAO TÁC NHANH CHO TÀI XẾ</Text>
        <Text style={styles.hintText}>
          1. Vào cổng bằng cách ấn nút MỞ MÃ QR.
        </Text>
        <Text style={styles.hintText}>2. Đưa mã cho bảo vệ quét tại cổng.</Text>
        <Text style={styles.hintText}>
          3. Bảo vệ quét mã — ứng dụng sẽ nhận thông báo kết quả tự động.
        </Text>
      </View>

      <Snackbar
        position="top-right"
        visible={loginToastVisible}
        message="Đăng nhập thành công"
        variant="success"
        onDismiss={() => setLoginToastVisible(false)}
        duration={2600}
      />

      <Snackbar
        visible={snackVisible}
        message={snackMessage}
        variant={
          gateState === "success"
            ? "success"
            : gateState === "error"
              ? "error"
              : "neutral"
        }
        onDismiss={() => setSnackVisible(false)}
      />

      <View style={styles.footerSpacer} />
    </ScreenShell>
  );
}
