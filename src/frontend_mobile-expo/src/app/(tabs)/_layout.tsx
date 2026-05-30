import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { stitchPalette } from "@/shared/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: stitchPalette.surfaceAlt },
        headerTintColor: stitchPalette.text,
        tabBarStyle: {
          backgroundColor: stitchPalette.bg,
          borderTopColor: stitchPalette.borderStrong,
          height: 74,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 8,
        },
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 4,
          marginVertical: 6,
        },
        tabBarActiveTintColor: stitchPalette.ink,
        tabBarInactiveTintColor: stitchPalette.textSubtle,
        tabBarActiveBackgroundColor: stitchPalette.accent,
        tabBarInactiveBackgroundColor: "transparent",
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
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Alerts",
          tabBarLabel: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Slots",
          tabBarLabel: "Slots",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="yard"
        options={{
          title: "Parking",
          tabBarLabel: "Parking",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Ops",
          tabBarLabel: "Ops",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="reader-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
