import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thùng rác Lịch hẹn",
  description: "Các lịch hẹn đã bị xóa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
