import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";

import { ScreenShell } from "@/shared/components/layout/ScreenShell";
import { fetchAppointments } from "@/shared/api/portal-api";
import DriverPassModal from "@/modules/dashboard/components/DriverPassModal";
import { getProfile } from "@/shared/state/profile";
import styles from "../style/Appointments.style";
import { QueryStateHandler } from "@/shared/components/query-state-handler";

type FilterKey = "all" | "active" | "pending" | "history";

const filters: Array<{ key: FilterKey; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "active", label: "Đang xử lý" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "history", label: "Lịch sử" },
];

function formatStatus(status: string) {
  switch (status) {
    case "Confirmed":
      return "Đã xác nhận";
    case "Pending":
      return "Đang chờ";
    case "Waiting":
      return "Chờ xử lý";
    default:
      return status;
  }
}

function getStatusTone(status: string) {
  switch (status) {
    case "Confirmed":
      return styles.statusConfirmed;
    case "Pending":
      return styles.statusPending;
    case "Waiting":
      return styles.statusWaiting;
    default:
      return styles.statusWaiting;
  }
}

function getStatusTextColor(status: string) {
  switch (status) {
    case "Confirmed":
      return "#ffffff";
    case "Pending":
      return "#ffffff";
    case "Waiting":
      return "#f8fafc";
    default:
      return "#ffffff";
  }
}

import { useRouter } from "expo-router";
export default function () {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const {
    data: appointments = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["appointments"],
    queryFn: fetchAppointments,
  });

  // Only show Confirmed and Pending appointments per product requirement
  const visibleAppointments = useMemo(() => {
    const filtered = appointments.filter(
      (item) => item.status === "Confirmed" || item.status === "Pending",
    );

    switch (activeFilter) {
      case "active":
        return filtered.filter((item) => item.status === "Confirmed");
      case "pending":
        return filtered.filter((item) => item.status === "Pending");
      default:
        return filtered;
    }
  }, [activeFilter, appointments]);

  const [showPass, setShowPass] = useState(false);
  const [selected, setSelected] = useState<any | undefined>(undefined);

  const confirmedCount = appointments.filter(
    (item) => item.status === "Confirmed",
  ).length;
  const pendingCount = appointments.filter(
    (item) => item.status === "Pending",
  ).length;
  const waitingCount = appointments.filter(
    (item) => item.status === "Waiting",
  ).length;

  return (
    <ScreenShell
      title="Lịch hẹn"
      subtitle="Xem thông tin, pass QR và trạng thái. Liên hệ điều phối khi cần hỗ trợ."
    >
      <QueryStateHandler
        isLoading={isLoading}
        isError={isError}
        errorMessage="Không tải được danh sách lịch hẹn. Vui lòng thử lại sau."
      >
        <View style={styles.pageContainer}>
          <View style={styles.heroCard}>
            <Text style={styles.heroKicker}>TÀI XẾ CẢNG</Text>
            <Text style={styles.heroTitle}>Lượt hoạt động</Text>
            <Text style={styles.heroSubtitle}>
              Tài xế chỉ xem thông tin, check-in QR và liên hệ điều phối khi
              cần.
            </Text>

            <View style={styles.summaryRow}>
              <SummaryChip label="Đã xác nhận" value={confirmedCount} />
              <SummaryChip label="Đang chờ" value={pendingCount} />
              <SummaryChip label="Chờ xử lý" value={waitingCount} />
            </View>
          </View>

          <View style={styles.filterRow}>
            {filters.map((filter) => {
              const selected = filter.key === activeFilter;
              return (
                <Pressable
                  key={filter.key}
                  onPress={() => setActiveFilter(filter.key)}
                  style={[
                    styles.filterChip,
                    selected && styles.filterChipActive,
                    { marginRight: 10 },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      selected && styles.filterTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.listHeader}>
            <Text style={styles.listHeaderTitle}>Lịch trong ngày</Text>
            <Text style={styles.listHeaderSub}>
              {visibleAppointments.length} mục hiển thị
            </Text>
          </View>

          <View style={styles.listContainer}>
            {visibleAppointments.map((item) => {
              const isConfirmed = item.status === "Confirmed";
              return (
                <Pressable
                  key={item.code}
                  style={[styles.card, width >= 900 && styles.cardWide]}
                  onPress={() => {
                    // gentle haptic feedback to confirm touch
                    Haptics.selectionAsync();
                  }}
                >
                  <View style={styles.cardTopRowCentered}>
                    <View style={styles.timeBlock}>
                      <Text style={styles.cardTimeLarge}>{item.time}</Text>
                      <Text style={styles.cardLocation}>
                        {item.truck ?? "—"}
                      </Text>
                    </View>
                    <View
                      style={[styles.statusPill, getStatusTone(item.status)]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusTextColor(item.status) },
                        ]}
                      >
                        {formatStatus(item.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaBlockCompact}>
                    <Text style={styles.cardCodeCompact}>{item.code}</Text>
                    <Text style={styles.metaValueCompact}>
                      {item.truck ?? "-"}
                    </Text>
                  </View>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={styles.primaryActionLarge}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        if (isConfirmed) {
                          // show driver's pass modal (fast path)
                          setSelected(item);
                          setShowPass(true);
                          return;
                        }

                        Alert.alert(
                          "Chưa thể mở pass",
                          "Lịch này chưa ở trạng thái xác nhận. Hãy chờ điều phối hoặc liên hệ hỗ trợ.",
                        );
                      }}
                    >
                      <Text style={styles.primaryActionTextLarge}>
                        {isConfirmed ? "Xem thẻ thông hành" : "Hướng dẫn"}
                      </Text>
                    </Pressable>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Reuse DriverPassModal for quick pass view */}
          <DriverPassModal
            visible={showPass}
            onClose={() => setShowPass(false)}
            profile={getProfile()}
            appointment={selected}
            verified={true}
          />

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Hỗ trợ điều phối</Text>
            <Text style={styles.infoBody}>
              Nếu cần hỗ trợ đổi khung giờ, xác nhận lịch hoặc kiểm tra pass,
              hãy liên hệ điều phối để được hướng dẫn.
            </Text>
          </View>
        </View>
      </QueryStateHandler>
    </ScreenShell>
  );
}

function SummaryChip({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryChip}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}
