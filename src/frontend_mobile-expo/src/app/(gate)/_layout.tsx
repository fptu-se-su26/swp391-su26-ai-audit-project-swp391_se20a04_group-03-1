import React from "react";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { stitchPalette } from "@/shared/theme";
import { useAuth } from "@/shared/state/auth";
import { useTabBarStyle } from "@/shared/hooks/use-tab-bar-style";

export default function GateTabLayout() {
  const auth = useAuth();
  // Hook phải gọi TRƯỚC mọi return sớm (quy tắc hooks của React).
  const { tabBarStyle } = useTabBarStyle();

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
        tabBarStyle,
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
        name="history"
        options={{
          title: "Lịch sử quét",
          tabBarLabel: "Lịch sử",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" color={color} size={size} />
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
