/**
 * Portal API — Mock Service Layer
 *
 * Simulated API endpoints for development. These will be replaced
 * with real `apiClient.get(...)` calls once the backend is integrated.
 */
import type {
  AppointmentItem,
  DashboardSummary,
  NotificationItem,
  YardSpot,
} from '@/shared/types';

const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

// ─── Mock data ───────────────────────────────────────────────────────────────

const dashboardSummary: DashboardSummary = {
  checkInsToday: 18,
  freeSpots: 24,
  pendingTasks: 6,
  activeAlerts: 3,
  nextAppointment: '10:30 - Truck 19',
};

const notifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Xe vào cổng A',
    time: '08:20',
    status: 'Unread',
    level: 'warning',
  },
  {
    id: 'n2',
    title: 'Appointment 12h30 đã xác nhận',
    time: '07:55',
    status: 'Unread',
    level: 'success',
  },
  {
    id: 'n3',
    title: 'Spot B-02 đã được dọn',
    time: 'Yesterday',
    status: 'Read',
    level: 'info',
  },
];

const appointments: AppointmentItem[] = [
  { code: 'AP-1024', time: '09:30', truck: 'Truck 19', status: 'Confirmed' },
  { code: 'AP-1025', time: '11:00', truck: 'Truck 21', status: 'Pending' },
  { code: 'AP-1026', time: '14:20', truck: 'Truck 09', status: 'Waiting' },
];

const yardSpots: YardSpot[] = [
  { id: 'A-01', zone: 'A', status: 'Free' },
  { id: 'A-02', zone: 'A', status: 'Occupied' },
  { id: 'B-01', zone: 'B', status: 'Reserved' },
  { id: 'B-02', zone: 'B', status: 'Free' },
  { id: 'C-01', zone: 'C', status: 'Free' },
  { id: 'C-02', zone: 'C', status: 'Occupied' },
];

// ─── Public API ──────────────────────────────────────────────────────────────

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  await delay(250);
  return dashboardSummary;
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  await delay(300);
  return notifications;
}

export async function fetchAppointments(): Promise<AppointmentItem[]> {
  await delay(300);
  return appointments;
}

export async function fetchYardSpots(): Promise<YardSpot[]> {
  await delay(300);
  return yardSpots;
}

/**
 * Dev helper: subscribe to simulated scan results (manager scans driver's QR)
 * Returns an unsubscribe function.
 */
export function subscribeToScanResults(
  handler: (payload: { appointmentCode: string; result: 'ok' | 'invalid' }) => void,
) {
  // In development we used to auto-fire a simulated result after a delay.
  // That behavior caused premature toasts when the driver hadn't been scanned yet.
  // Remove the automatic timer — callers may now register a handler and
  // optionally trigger simulation manually via `simulateScanResult`.
  let active = true;

  // No automatic trigger here. Keep handler registered until unsubscribed.
  const safeHandler = (payload: { appointmentCode: string; result: 'ok' | 'invalid' }) => {
    if (!active) return;
    handler(payload);
  };

  // For simplicity this function returns an unsubscribe that deactivates the handler.
  return () => {
    active = false;
  };
}

// Dev helper: allow manual simulation of a scan result to all registered handlers.
// Note: consumers can implement their own test hooks; the subscribe function
// no longer auto-fires.
// Note: no simulation helpers are provided in this module. Real-time scan
// results should be delivered by the backend (WebSocket / SSE / Push). For
// local testing, register your handler with `subscribeToScanResults` and
// invoke it manually from a dev-only test harness if needed.
