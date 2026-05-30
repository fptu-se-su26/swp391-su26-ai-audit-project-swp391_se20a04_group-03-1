/**
 * @module navigation
 *
 * Navigation configuration and route type definitions.
 * With Expo Router, most navigation is handled by the file-based routing
 * in `src/app/`. This module provides supplementary config and types.
 */

/**
 * Tab route configuration — describes the main bottom tabs.
 * Used to generate tab bar items programmatically.
 */
export interface TabRoute {
  name: string;
  title: string;
  icon: string; // Ionicons name
  href: string; // Expo Router href
}

export const mainTabs: TabRoute[] = [
  { name: 'dashboard', title: 'Trang chủ', icon: 'grid-outline', href: '/(tabs)/' },
  { name: 'notifications', title: 'Thông báo', icon: 'notifications-outline', href: '/(tabs)/notifications' },
  { name: 'appointments', title: 'Lịch hẹn', icon: 'calendar-outline', href: '/(tabs)/appointments' },
  { name: 'yard', title: 'Bãi xe', icon: 'locate-outline', href: '/(tabs)/yard' },
  { name: 'settings', title: 'Cài đặt', icon: 'settings-outline', href: '/(tabs)/settings' },
];
