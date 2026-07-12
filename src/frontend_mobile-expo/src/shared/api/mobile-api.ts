/**
 * Mobile API — gọi backend thật tại /api/mobile/*.
 * Response convention: { code: "success" | "error", message, data }.
 */
import { apiClient } from "./client";
import type {
  DriverAppointment,
  GateScanResult,
  LoginResult,
  MobileRole,
} from "@/shared/types";

type ApiEnvelope<T> = {
  code: "success" | "error";
  message?: string;
  data?: T;
};

function extractErrorMessage(err: any, fallback: string): string {
  return (
    err?.response?.data?.message ??
    err?.message ??
    fallback
  );
}

// POST /auth/login — backend tự xác định role theo tài khoản.
export async function loginRequest(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    const res = await apiClient.post<ApiEnvelope<LoginResult>>(
      "/mobile/auth/login",
      { email, password },
    );
    if (res.data.code !== "success" || !res.data.data) {
      throw new Error(res.data.message ?? "Đăng nhập thất bại");
    }
    return res.data.data;
  } catch (err: any) {
    throw new Error(
      extractErrorMessage(err, "Tài khoản hoặc mật khẩu không chính xác"),
    );
  }
}

// GET /auth/me — dùng khi khôi phục phiên từ token đã lưu.
export async function fetchMe(): Promise<{ role: MobileRole } & Record<string, any>> {
  const res = await apiClient.get<ApiEnvelope<any>>("/mobile/auth/me");
  if (res.data.code !== "success" || !res.data.data) {
    throw new Error(res.data.message ?? "Phiên không hợp lệ");
  }
  return res.data.data;
}

// POST /auth/logout
export async function logoutRequest(): Promise<void> {
  try {
    await apiClient.post("/mobile/auth/logout");
  } catch {
    // Không chặn logout phía client dù backend lỗi.
  }
}

// GET /driver/appointments — kèm qrToken mỗi lịch hẹn.
export async function fetchDriverAppointments(): Promise<DriverAppointment[]> {
  const res = await apiClient.get<ApiEnvelope<DriverAppointment[]>>(
    "/mobile/driver/appointments",
  );
  if (res.data.code !== "success") {
    throw new Error(res.data.message ?? "Không thể lấy lịch hẹn");
  }
  return res.data.data ?? [];
}

// POST /gate/scan — xác thực QR (backend trả 200 kèm valid:false nếu không hợp lệ).
export async function gateScanRequest(
  qrToken: string,
): Promise<GateScanResult> {
  try {
    const res = await apiClient.post<ApiEnvelope<GateScanResult>>(
      "/mobile/gate/scan",
      { qrToken },
    );
    // Kể cả code "error" (mã không hợp lệ) backend vẫn trả data.valid=false.
    return (
      res.data.data ?? {
        valid: false,
        reason: "UNKNOWN",
      }
    );
  } catch (err: any) {
    throw new Error(extractErrorMessage(err, "Không thể xử lý quét cổng"));
  }
}
