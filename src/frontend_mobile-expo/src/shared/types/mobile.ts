/**
 * Kiểu dữ liệu cho app mobile (khớp payload backend /api/mobile/*).
 */

export type MobileRole = "driver" | "gate_manager";

export interface CompanyRef {
  _id: string;
  companyName: string;
  companyCode: string;
}

export interface GateRef {
  _id: string;
  name: string;
  type: "in" | "out";
}

export interface DriverUser {
  id: string;
  driverId: string;
  fullName: string;
  phone?: string;
  email?: string;
  company?: CompanyRef | null;
}

export interface GateUser {
  id: string;
  fullName: string;
  email: string;
  gate?: GateRef | null;
}

export interface LoginResult {
  token: string;
  role: MobileRole;
  user: DriverUser | GateUser;
}

export type AppointmentStatus =
  | "Pending"
  | "Confirmed"
  | "Cancelled"
  | "Completed";

/** Lịch hẹn của tài xế, kèm qrToken để render QR động. */
export interface DriverAppointment {
  id: string;
  code: string;
  truckPlate: string;
  containerNo: string;
  scheduledDate: string;
  timeSlot: string;
  purpose: string;
  status: AppointmentStatus;
  qrToken: string;
}

/** Một lượt qua cổng do tài khoản quản lý cổng hiện tại đã quét. */
export interface GatePassageItem {
  id: string;
  truckPlate: string;
  containerNo: string;
  driverName: string;
  purpose: string;
  timeSlot: string;
  appointmentStatus: string;
  assignedSlot: string | null;
  yardName: string | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  /** "in" = còn trong bãi, "out" = đã rời cảng. */
  status: "in" | "out";
}

export interface GateHistoryStats {
  total: number;
  checkInToday: number;
  checkOutToday: number;
  stillInside: number;
}

export interface GateHistory {
  stats: GateHistoryStats;
  items: GatePassageItem[];
}

/** Kết quả quét cổng (fallback thủ công). */
export interface GateScanResult {
  valid: boolean;
  reason?: string;
  // Chiều qua cổng do backend suy ra: "in" = check-in, "out" = check-out.
  direction?: "in" | "out";
  // Ô đỗ được cấp khi check-in.
  assignedSlot?: string | null;
  yardName?: string | null;
  message?: string;
  appointment?: {
    id: string;
    code: string;
    truckPlate: string;
    containerNo: string;
    scheduledDate: string;
    timeSlot: string;
    purpose: string;
    status: AppointmentStatus;
  };
  driver?: {
    driverId: string;
    fullName: string;
    phone?: string;
  } | null;
}
