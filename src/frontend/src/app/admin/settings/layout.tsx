import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cài đặt chung",
  description: "Cấu hình hệ thống và quản lý cài đặt trang web.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
