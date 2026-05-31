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

import { ScreenShell } from "@/shared/components/layout/ScreenShell";
import { useProfile, setProfile, Profile } from "@/shared/state/profile";
import { signOut } from "@/shared/state/auth";
import { TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen() {
  const router = useRouter();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const profile = useProfile();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Profile>(profile);

  function startEdit() {
    setDraft(profile);
    setEditing(true);
  }

  function cancelEdit() {
    setDraft(profile);
    setEditing(false);
  }

  function saveEdit() {
    // Basic validation
    if (!draft.fullName || !draft.license) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập họ tên và giấy phép lái xe.",
      );
      return;
    }
    setProfile(draft);
    setEditing(false);
    Alert.alert(
      "Lưu thành công",
      "Thông tin tài xế đã được cập nhật (chưa đồng bộ server).",
    );
    // navigate back to Dashboard (tabs index) after save
    try {
      router.push("/(tabs)");
    } catch (e) {
      // ignore navigation errors
    }
  }

  function handleLogout() {
    signOut();
    router.replace("/login");
  }

  return (
    <ScreenShell title="Cài đặt" subtitle="Quản lý tài khoản và thiết bị">
      <View style={styles.container}>
        <View style={styles.identityCard}>
          <Image
            source={{ uri: editing ? draft.avatarUrl : profile.avatarUrl }}
            style={styles.avatar}
          />
          <View style={styles.identityText}>
            {editing ? (
              <TextInput
                value={draft.fullName}
                onChangeText={(t) => setDraft({ ...draft, fullName: t })}
                style={styles.input}
              />
            ) : (
              <Text style={styles.name}>{profile.fullName}</Text>
            )}

            {editing ? (
              <TextInput
                value={draft.license}
                onChangeText={(t) => setDraft({ ...draft, license: t })}
                style={styles.smallInput}
              />
            ) : (
              <Text style={styles.license}>License: {profile.license}</Text>
            )}

            {editing ? (
              <TextInput
                value={draft.company}
                onChangeText={(t) => setDraft({ ...draft, company: t })}
                style={styles.smallInput}
              />
            ) : (
              <Text style={styles.company}>{profile.company}</Text>
            )}
          </View>

          <View style={{ marginLeft: 8 }}>
            {!editing ? (
              <Pressable style={styles.editBtn} onPress={startEdit}>
                <Text style={styles.editText}>Chỉnh sửa</Text>
              </Pressable>
            ) : (
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable style={styles.saveBtn} onPress={saveEdit}>
                  <Text style={styles.saveText}>Lưu</Text>
                </Pressable>
                <Pressable style={styles.cancelBtn} onPress={cancelEdit}>
                  <Text style={styles.cancelText}>Hủy</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tùy chọn</Text>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons
                name="notifications"
                size={20}
                color="#f6b11c"
                style={{ marginRight: 10 }}
              />
              <View>
                <Text style={styles.rowLabel}>Thông báo đẩy</Text>
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
                <Text style={styles.rowLabel}>Giao diện tối</Text>
                <Text style={styles.rowSub}>
                  Giao diện tối theo theme công nghiệp
                </Text>
              </View>
            </View>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>

          <View style={[styles.section, { marginTop: 12 }]}>
            <Text style={styles.sectionTitle}>Thông tin lái xe</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số điện thoại</Text>
              {editing ? (
                <TextInput
                  value={draft.phone}
                  onChangeText={(t) => setDraft({ ...draft, phone: t })}
                  style={styles.smallInput}
                />
              ) : (
                <Text style={styles.infoValue}>{profile.phone}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Biển số xe</Text>
              {editing ? (
                <TextInput
                  value={draft.vehicleNumber}
                  onChangeText={(t) => setDraft({ ...draft, vehicleNumber: t })}
                  style={styles.smallInput}
                />
              ) : (
                <Text style={styles.infoValue}>{profile.vehicleNumber}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Loại phương tiện</Text>
              {editing ? (
                <TextInput
                  value={draft.vehicleType}
                  onChangeText={(t) => setDraft({ ...draft, vehicleType: t })}
                  style={styles.smallInput}
                />
              ) : (
                <Text style={styles.infoValue}>{profile.vehicleType}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Hết hạn GPLX</Text>
              {editing ? (
                <TextInput
                  value={draft.licenseExpiry}
                  onChangeText={(t) => setDraft({ ...draft, licenseExpiry: t })}
                  style={styles.smallInput}
                />
              ) : (
                <Text style={styles.infoValue}>{profile.licenseExpiry}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Bảo hiểm</Text>
              {editing ? (
                <TextInput
                  value={draft.insurancePolicy}
                  onChangeText={(t) =>
                    setDraft({ ...draft, insurancePolicy: t })
                  }
                  style={styles.smallInput}
                />
              ) : (
                <Text style={styles.infoValue}>{profile.insurancePolicy}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Khám sức khỏe</Text>
              {editing ? (
                <TextInput
                  value={draft.medicalExpiry}
                  onChangeText={(t) => setDraft({ ...draft, medicalExpiry: t })}
                  style={styles.smallInput}
                />
              ) : (
                <Text style={styles.infoValue}>{profile.medicalExpiry}</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Người liên hệ khẩn cấp</Text>
              {editing ? (
                <TextInput
                  value={draft.emergencyContact?.phone ?? ""}
                  onChangeText={(t) =>
                    setDraft({
                      ...draft,
                      emergencyContact: {
                        ...(draft.emergencyContact ?? { name: "" }),
                        phone: t,
                      },
                    })
                  }
                  style={styles.smallInput}
                />
              ) : (
                <Text style={styles.infoValue}>
                  {profile.emergencyContact?.name} —{" "}
                  {profile.emergencyContact?.phone}
                </Text>
              )}
            </View>
          </View>

          {/* Removed links to Notifications / Help — app trimmed to 3 main screens */}
        </View>

        <Pressable
          style={styles.logoutBtn}
          onPress={handleLogout}
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
  editBtn: {
    backgroundColor: "#0ea5a4",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editText: { color: "#071122", fontWeight: "800" },
  saveBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveText: { color: "#071122", fontWeight: "900" },
  cancelBtn: {
    backgroundColor: "#334155",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelText: { color: "#f8fafc", fontWeight: "700" },
  input: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "700",
    borderBottomWidth: 0,
    paddingVertical: 4,
  },
  smallInput: {
    color: "#cbd5e1",
    fontSize: 14,
    paddingVertical: 4,
    borderBottomWidth: 0,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: { color: "#94a3b8", fontSize: 13, fontWeight: "700" },
  infoValue: { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
});
