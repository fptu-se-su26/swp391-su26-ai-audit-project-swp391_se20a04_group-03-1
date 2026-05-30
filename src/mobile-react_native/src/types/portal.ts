export type DashboardSummary = {
  checkInsToday: number;
  freeSpots: number;
  pendingTasks: number;
  activeAlerts: number;
  nextAppointment: string;
};

export type NotificationItem = {
  id: string;
  title: string;
  time: string;
  status: "Unread" | "Read";
  level: "info" | "warning" | "success";
};

export type AppointmentItem = {
  code: string;
  time: string;
  truck: string;
  status: "Confirmed" | "Pending" | "Waiting";
};

export type YardSpot = {
  id: string;
  status: "Free" | "Occupied" | "Reserved";
  zone: string;
};
