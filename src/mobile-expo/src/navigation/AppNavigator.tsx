import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import DashboardScreen from "../screens/dashboard/DashboardScreen";
import AppointmentsScreen from "../screens/appointments/AppointmentsScreen";
import YardScreen from "../screens/yard/YardScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";
import MyQRCodeScreen from "../screens/qr/MyQRCodeScreen";
import { stitchPalette } from "../theme/stitchPalette";

export type RootTabParamList = {
  Dashboard: undefined;
  Notifications: undefined;
  Appointments: undefined;
  Yard: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  MyQRCode: {
    appointmentCode: string;
    driverName: string;
    licensePlate: string;
    timeSlot: string;
  };
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

type MainTabsProps = NativeStackScreenProps<RootStackParamList, "MainTabs">;

function MainTabs(props: MainTabsProps): React.JSX.Element {
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
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
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Trang chủ",
          tabBarLabel: "Trang chủ",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: "Thông báo",
          tabBarLabel: "Thông báo",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          title: "Lịch hẹn",
          tabBarLabel: "Lịch hẹn",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Yard"
        component={YardScreen}
        options={{
          title: "Bãi xe",
          tabBarLabel: "Bãi xe",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="locate-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Cài đặt",
          tabBarLabel: "Cài đặt",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MyQRCode"
        component={MyQRCodeScreen}
        options={{ title: "Mã QR của tôi", presentation: "modal" }}
      />
    </Stack.Navigator>
  );
}
