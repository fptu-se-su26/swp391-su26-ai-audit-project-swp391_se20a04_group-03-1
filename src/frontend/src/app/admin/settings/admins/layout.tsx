import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Tài khoản Admin",
  description: "Quản lý danh sách, thêm mới và xét duyệt các tài khoản quản trị viên.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
