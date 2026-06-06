import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch hẹn đã hoàn thành",
  description: "Danh sách lịch hẹn đã hoàn tất.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
