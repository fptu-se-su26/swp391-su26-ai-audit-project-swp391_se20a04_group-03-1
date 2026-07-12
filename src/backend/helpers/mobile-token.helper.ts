import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.config";

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 ngày cho mobile

/**
 * Cấp JWT cho app mobile + ghi phiên vào Redis (single-session lock).
 * Trả về token để controller đưa vào body response.
 */
export async function issueMobileToken(
  id: string,
  role: "driver" | "gate_manager",
  extra: Record<string, unknown> = {},
): Promise<string> {
  const tokenVersion = Date.now().toString();

  const token = jwt.sign(
    { id, role, tokenVersion, ...extra },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" },
  );

  await redisClient.setEx(
    `auth:mobile:session:${id}`,
    SESSION_TTL_SECONDS,
    tokenVersion,
  );

  return token;
}

/** Hủy phiên mobile hiện tại (logout / vô hiệu hóa thiết bị). */
export async function revokeMobileSession(id: string): Promise<void> {
  await redisClient.del(`auth:mobile:session:${id}`);
}

/**
 * Ký QR token ngắn hạn cho một lịch hẹn. Token tự chứa apptId + driverId,
 * chống giả mạo bằng JWT_SECRET, không cần lưu DB.
 */
export function signAppointmentQrToken(
  apptId: string,
  driverId: string,
): string {
  return jwt.sign(
    { typ: "appt-qr", apptId, driverId },
    process.env.JWT_SECRET as string,
    { expiresIn: "12h" },
  );
}
