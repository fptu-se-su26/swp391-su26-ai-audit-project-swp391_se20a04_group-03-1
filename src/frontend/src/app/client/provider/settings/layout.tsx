import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cài đặt tài khoản",
  description:
    "Thông tin hãng tàu, cấu hình mã BIC, đổi mật khẩu và quản lý phiên đăng nhập.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
