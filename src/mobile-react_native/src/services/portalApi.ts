import type {
  AppointmentItem,
  DashboardSummary,
  NotificationItem,
  YardSpot,
} from "../types/portal";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const dashboardSummary: DashboardSummary = {
  checkInsToday: 18,
  freeSpots: 24,
  pendingTasks: 6,
  activeAlerts: 3,
  nextAppointment: "10:30 - Truck 19",
};

const notifications: NotificationItem[] = [
  {
    id: "n1",
    title: "Xe vào cổng A",
    time: "08:20",
    status: "Unread",
    level: "warning",
  },
  {
    id: "n2",
    title: "Appointment 12h30 đã xác nhận",
    time: "07:55",
    status: "Unread",
    level: "success",
  },
  {
    id: "n3",
    title: "Spot B-02 đã được dọn",
    time: "Yesterday",
    status: "Read",
    level: "info",
  },
];

const appointments: AppointmentItem[] = [
  { code: "AP-1024", time: "09:30", truck: "Truck 19", status: "Confirmed" },
  { code: "AP-1025", time: "11:00", truck: "Truck 21", status: "Pending" },
  { code: "AP-1026", time: "14:20", truck: "Truck 09", status: "Waiting" },
];

const yardSpots: YardSpot[] = [
  { id: "A-01", zone: "A", status: "Free" },
  { id: "A-02", zone: "A", status: "Occupied" },
  { id: "B-01", zone: "B", status: "Reserved" },
  { id: "B-02", zone: "B", status: "Free" },
  { id: "C-01", zone: "C", status: "Free" },
  { id: "C-02", zone: "C", status: "Occupied" },
];

export async function fetchDashboardSummary() {
  await delay(250);
  return dashboardSummary;
}

export async function fetchNotifications() {
  await delay(300);
  return notifications;
}

export async function fetchAppointments() {
  await delay(300);
  return appointments;
}

export async function fetchYardSpots() {
  await delay(300);
  return yardSpots;
}
