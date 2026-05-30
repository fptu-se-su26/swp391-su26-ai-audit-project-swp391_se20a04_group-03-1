import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Switch,
  Pressable,
  TouchableOpacity,
} from "react-native";


import { ScreenShell } from '@/shared/components/layout/ScreenShell';
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const profile = {
    fullName: "Nguyen Van An",
    license: "VN-99283-8821",
    company: "Saigon Port Logistics J.S.C",
    avatarUrl:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=300&auto=format&fit=crop",
  };

  return (
    <ScreenShell title="Cài đặt" subtitle="Quản lý tài khoản và thiết bị">
      <View style={styles.container}>
        <View style={styles.identityCard}>
          <Image source={{ uri: profile.avatarUrl }} style={styles.avatar} />
          <View style={styles.identityText}>
            <Text style={styles.name}>{profile.fullName}</Text>
            <Text style={styles.license}>License: {profile.license}</Text>
            <Text style={styles.company}>{profile.company}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="notifications"
                size={20}
                color="#f6b11c"
                style={{ marginRight: 10 }}
              />
              <View>
                <Text style={styles.rowLabel}>Push Notifications</Text>
                <Text style={styles.rowSub}>Nhận cảnh báo và nhắc nhở</Text>
              </View>
            </View>
            <Switch value={pushEnabled} onValueChange={setPushEnabled} />
          </View>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="moon"
                size={20}
                color="#94a3b8"
                style={{ marginRight: 10 }}
              />
              <View>
                <Text style={styles.rowLabel}>Industrial Dark Mode</Text>
                <Text style={styles.rowSub}>
                  Giao diện tối theo theme công nghiệp
                </Text>
              </View>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          {/* Removed links to Notifications / Help — app trimmed to 3 main screens */}
        </View>

        <Pressable
          style={styles.logoutBtn}
          onPress={() => router.push('/(tabs)' as any)}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="log-out" size={18} color="#071122" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </View>
        </Pressable>
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f1a2a",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(246,192,106,0.18)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  avatar: { width: 64, height: 64, borderRadius: 10, marginRight: 12 },
  identityText: { flex: 1 },
  name: { color: "#f8fafc", fontSize: 18, fontWeight: "700" },
  license: { color: "#f6b11c", marginTop: 4 },
  company: { color: "#cbd5e1", marginTop: 2 },
  section: {
    marginTop: 20,
    backgroundColor: "#0b1528",
    padding: 12,
    borderRadius: 12,
  },
  sectionTitle: { color: "#94a3b8", fontWeight: "700", marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  rowLabel: { color: "#f8fafc", fontWeight: "600" },
  rowSub: { color: "#94a3b8", fontSize: 12 },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: "#071428",
  },
  navLabel: { color: "#f8fafc", fontWeight: "600" },
  logoutBtn: {
    marginTop: 20,
    backgroundColor: "#ef7c54",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ef7c54",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  logoutText: { color: "#071122", fontWeight: "800" },
});
