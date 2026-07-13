import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { stitchPalette } from "@/shared/theme";
import { useAuth } from "@/shared/state/auth";

export default function GateTabLayout() {
  const auth = useAuth();

  if (!auth.isReady) {
    return null;
  }
  if (!auth.isAuthenticated) {
    return <Redirect href="/login" />;
  }
  // Sai vai trò -> đẩy sang nhóm đúng.
  if (auth.role !== "gate_manager") {
    return <Redirect href="/(driver)" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: stitchPalette.surfaceAlt },
        headerTintColor: stitchPalette.text,
        tabBarStyle: {
          backgroundColor: stitchPalette.surfaceAlt,
          borderTopColor: stitchPalette.borderSoft,
          borderTopWidth: 1,
          height: 74,
          paddingTop: 8,
          paddingBottom: 8,
        },
        // Tab được chọn: chỉ đổi màu icon + chữ sang xanh (không dùng khối nền).
        tabBarActiveTintColor: stitchPalette.accent,
        tabBarInactiveTintColor: stitchPalette.textSubtle,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          marginBottom: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Quét cổng",
          tabBarLabel: "Quét cổng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Tài khoản",
          tabBarLabel: "Tài khoản",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
