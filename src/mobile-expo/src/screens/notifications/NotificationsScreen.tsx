import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenShell from "../../components/layout/ScreenShell";

type Notification = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

const PLACEHOLDER_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    icon: "car-outline",
    iconColor: "#f6b11c",
    title: "Xe đã vào bãi",
    body: "Biển số 51G-123.45 vừa check-in tại Bãi A.",
    time: "2 phút trước",
    unread: true,
  },
  {
    id: "2",
    icon: "alert-circle-outline",
    iconColor: "#ef4444",
    title: "Cảnh báo camera",
    body: "Camera CAM-03 mất tín hiệu. Vui lòng kiểm tra.",
    time: "15 phút trước",
    unread: true,
  },
  {
    id: "3",
    icon: "checkmark-circle-outline",
    iconColor: "#22c55e",
    title: "Thanh toán thành công",
    body: "Xe 30A-567.89 đã thanh toán phí gửi xe.",
    time: "1 giờ trước",
    unread: false,
  },
  {
    id: "4",
    icon: "calendar-outline",
    iconColor: "#60a5fa",
    title: "Nhắc lịch hẹn",
    body: "Bạn có lịch hẹn bảo trì bãi xe vào ngày mai lúc 08:00.",
    time: "3 giờ trước",
    unread: false,
  },
];

function NotificationItem({ item }: { item: Notification }) {
  return (
    <View style={[styles.item, item.unread && styles.itemUnread]}>
      <View style={[styles.iconBox, { borderColor: item.iconColor + "40" }]}>
        <Ionicons name={item.icon} size={22} color={item.iconColor} />
      </View>
      <View style={styles.itemBody}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.itemText} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.itemTime}>{item.time}</Text>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  return (
    <ScreenShell title="Thông báo" subtitle="Cập nhật mới nhất từ hệ thống">
      <FlatList
        data={PLACEHOLDER_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <NotificationItem item={item} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#334155"
            />
            <Text style={styles.emptyText}>Không có thông báo nào</Text>
          </View>
        }
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  separator: {
    height: 8,
  },
  item: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#0b1528",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  itemUnread: {
    borderColor: "rgba(246,177,28,0.25)",
    backgroundColor: "#0f1e38",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    marginRight: 12,
    flexShrink: 0,
  },
  itemBody: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  itemTitle: {
    color: "#f8fafc",
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
    marginRight: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f6b11c",
  },
  itemText: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  itemTime: {
    color: "#475569",
    fontSize: 11,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    color: "#334155",
    fontSize: 15,
    fontWeight: "600",
  },
});
