/**
 * Địa chỉ web dùng để dựng link trong email.
 *
 * Vì sao cần helper riêng thay vì nối thẳng process.env:
 *
 *  1. Trước đây các email dùng `process.env.NEXT_PUBLIC_URL` — biến này KHÔNG hề
 *     tồn tại trong .env, nên mọi link đều rơi về fallback "http://localhost:3000",
 *     tức là email gửi cho khách hàng có nút bấm về máy localhost, bấm không ra gì.
 *
 *  2. Giá trị trong .env của dự án hay kèm dấu nháy (FRONTEND_URL="http://...").
 *     Nối thẳng sẽ tạo ra URL hỏng dạng `"https://x"/client/login`, nên phải bóc
 *     nháy — cùng lý do mà chỗ xử lý COOKIE_DOMAIN đã phải làm vậy.
 *
 *  3. Fallback là TÊN MIỀN THẬT, không phải localhost: nếu server quên đặt biến,
 *     email vẫn có link bấm được, thay vì hỏng âm thầm.
 */

/** Tên miền web chính thức — dùng khi không cấu hình biến môi trường nào. */
const FALLBACK_WEB_URL = "https://datnotes.click";

/** Bóc dấu nháy, khoảng trắng và dấu "/" thừa ở cuối. */
const normalize = (value?: string): string =>
  (value || "")
    .replace(/['"]/g, "")
    .trim()
    .replace(/\/+$/, "");

/**
 * URL gốc của web (không có "/" ở cuối), lấy từ FRONTEND_URL — cùng biến mà
 * server đã dùng để cấu hình CORS, nên không phải khai báo thêm biến mới.
 */
export const getWebUrl = (): string =>
  normalize(process.env.FRONTEND_URL) || FALLBACK_WEB_URL;

/** Ghép đường dẫn vào URL web, luôn ra link hợp lệ. */
export const webLink = (path: string): string => {
  const base = getWebUrl();
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
};
