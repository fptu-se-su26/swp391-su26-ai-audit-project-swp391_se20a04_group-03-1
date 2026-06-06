import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Bảng điều khiển tổng quan quản lý cảng.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
