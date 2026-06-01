import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("tokenAdmin")?.value;

  // Xác định các trang không yêu cầu đăng nhập
  const isAuthPage =
    pathname === "/admin/login" ||
    pathname === "/admin/register" ||
    pathname === "/admin/forgot-password" ||
    pathname.includes("/admin/reset-password");

  // 1. CHƯA CÓ TOKEN: Nếu cố truy cập vào các trang /admin khác (ngoại trừ login/register) -> Đuổi về login
  if (!token && !isAuthPage) {
    const response = NextResponse.redirect(new URL("/admin/login", request.url));
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // 2. ĐÃ CÓ TOKEN: Nếu vô tình truy cập lại trang login/register -> Đẩy thẳng vào dashboard
  if (token && isAuthPage) {
    const response = NextResponse.redirect(new URL("/admin/dashboard", request.url));
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    return response;
  }

  // 3. Các trường hợp hợp lệ khác -> Cho phép đi tiếp
  return NextResponse.next();
}

// Cấu hình matcher: Middleware này chỉ kích hoạt cho tất cả các request có tiền tố /admin
export const config = {
  matcher: ["/admin/:path*"],
};
