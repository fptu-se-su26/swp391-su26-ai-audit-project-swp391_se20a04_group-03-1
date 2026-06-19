import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Lịch hẹn",
  description: "Quản lý lịch hẹn giao nhận container.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
