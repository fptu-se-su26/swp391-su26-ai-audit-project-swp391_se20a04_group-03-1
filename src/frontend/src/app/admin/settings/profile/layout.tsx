import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tài khoản của tôi",
  description: "Xem thông tin cá nhân, đổi mật khẩu và quản lý phiên đăng nhập.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
