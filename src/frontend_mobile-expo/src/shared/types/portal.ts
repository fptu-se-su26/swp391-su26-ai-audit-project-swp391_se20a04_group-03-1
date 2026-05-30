/**
 * Portal Domain Types
 *
 * Shared type definitions for the yard management / audit platform.
 * Used across dashboard, appointments, notifications, and yard modules.
 */

/** Dashboard summary card data */
export interface DashboardSummary {
  checkInsToday: number;
  freeSpots: number;
  pendingTasks: number;
  activeAlerts: number;
  nextAppointment: string;
}

/** Notification item from the bell feed */
export interface NotificationItem {
  id: string;
  title: string;
  time: string;
  status: 'Unread' | 'Read';
  level: 'info' | 'warning' | 'success';
}

/** Appointment row */
export interface AppointmentItem {
  code: string;
  time: string;
  truck: string;
  status: 'Confirmed' | 'Pending' | 'Waiting';
}

/** Yard spot (compact — used in list/grid views) */
export interface YardSpot {
  id: string;
  status: 'Free' | 'Occupied' | 'Reserved';
  zone: string;
}

/** Yard spot (detailed — used in real-time map views) */
export interface Spot {
  id: string;
  zone: string;
  x: number;
  y: number;
  status: 'free' | 'occupied' | 'reserved' | 'fault';
  geo: { lat: number; lon: number };
}
