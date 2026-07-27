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
