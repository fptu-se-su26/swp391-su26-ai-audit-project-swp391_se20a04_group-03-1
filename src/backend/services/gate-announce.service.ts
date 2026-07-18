import { publishAnnounceError } from "./mqtt.service";

/**
 * Phát câu CẢNH BÁO/LỖI ra loa tại cổng (qua Pi 5 → ESP32), dùng chung cho:
 *   - scan.controller: xe bị từ chối ở cổng (không lịch hẹn, sai giờ, bãi đầy...).
 *   - yard.controller: container đỗ sai vị trí trong bãi (báo ở loa cổng IN).
 *
 * Gom về một chỗ để: (1) làm sạch chữ cho Piper đọc mượt giống nhau, (2) debounce
 * tránh loa lải nhải khi cùng một sự kiện bắn lặp mỗi frame.
 */

/**
 * Làm sạch text cho Piper (giọng vi) đọc mượt:
 *  - bỏ [ngoặc vuông] và (ngoặc đơn) — nhãn "[Cổng ra - ...]" / "(07:00-09:00)" đọc lên rối.
 *  - "container" → "công-ten-nơ": để nguyên từ tiếng Anh thì Piper phonemize bằng luật
 *    tiếng Việt nên đọc sai/lạ.
 *  - hạ chữ HOA gào thét ("CẢNH BÁO"/"LỖI") về chữ thường cho tự nhiên.
 */
export const sanitizeForSpeech = (text: string): string =>
  String(text || "")
    .replace(/\[[^\]]*\]/g, " ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/container/gi, "công-ten-nơ")
    .replace(/CẢNH BÁO/g, "Cảnh báo")
    .replace(/LỖI/g, "Lỗi")
    .replace(/\s+/g, " ")
    .replace(/\s+([.,!?;:])/g, "$1") // bỏ khoảng trắng thừa trước dấu câu (do vừa cắt ngoặc)
    .trim();

// Chống loa lải nhải: cùng một sự kiện (dedupeKey) chỉ đọc lại sau ngần này ms.
const SPEAK_COOLDOWN_MS = 30_000;
const lastSpokenAt: Record<string, number> = {};

/**
 * Đọc một câu ra loa cổng, debounce theo `dedupeKey`.
 *
 * @param gate       "in" | "out" — loa cổng nào phát.
 * @param dedupeKey  khoá gom lặp: cùng khoá trong 30s thì bỏ qua. Caller tự đặt sao cho
 *                   "cùng nội dung / cùng đối tượng" ra cùng khoá (vd `yard:<yard>:<slot>:<mã>`).
 * @param message    câu gốc (chưa làm sạch) — hàm tự sanitize trước khi phát.
 */
export const speakGateAlert = (
  gate: "in" | "out",
  dedupeKey: string,
  message: string,
): void => {
  const cau = sanitizeForSpeech(message);
  if (!cau) return;

  const now = Date.now();
  const last = lastSpokenAt[dedupeKey];
  if (last && now - last < SPEAK_COOLDOWN_MS) return;
  lastSpokenAt[dedupeKey] = now;

  try {
    publishAnnounceError(gate, cau);
  } catch (err) {
    console.error("[MQTT] Lỗi publish câu loa:", err);
  }
};
