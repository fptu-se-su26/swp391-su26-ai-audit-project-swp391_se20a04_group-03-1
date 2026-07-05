import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- ADMIN LOGIC ---
  if (pathname.startsWith("/admin")) {
    const tokenAdmin = request.cookies.get("tokenAdmin")?.value;
    const isAuthPageAdmin =
      pathname === "/admin/login" ||
      pathname === "/admin/forgot-password" ||
      pathname.includes("/admin/reset-password");

    if (!tokenAdmin && !isAuthPageAdmin) {
      const response = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      response.headers.set("Cache-Control", "no-store, max-age=0");
      return response;
    }

    if (tokenAdmin && isAuthPageAdmin) {
      const response = NextResponse.redirect(
        new URL("/admin/dashboard", request.url),
      );
      response.headers.set("Cache-Control", "no-store, max-age=0");
      return response;
    }
  }

  // --- COMPANY LOGIC ---
  if (pathname.startsWith("/client/company")) {
    const tokenCompany = request.cookies.get("tokenCompany")?.value;
    const isAuthPageCompany =
      pathname === "/client/company/login" ||
      pathname === "/client/company/forgot-password" ||
      pathname.includes("/client/company/reset-password");

    if (!tokenCompany && !isAuthPageCompany) {
      const response = NextResponse.redirect(
        new URL("/client/company/login", request.url),
      );
      response.headers.set("Cache-Control", "no-store, max-age=0");
      return response;
    }

    if (tokenCompany && isAuthPageCompany) {
      const response = NextResponse.redirect(
        new URL("/client/company/dashboard", request.url),
      );
      response.headers.set("Cache-Control", "no-store, max-age=0");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/client/company/:path*"],
};
