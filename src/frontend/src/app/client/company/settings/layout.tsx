import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cài đặt tài khoản",
  description:
    "Thông tin doanh nghiệp, đổi mật khẩu và quản lý phiên đăng nhập trên hệ thống LogiPort.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
