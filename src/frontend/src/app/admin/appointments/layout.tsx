import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Quản lý Lịch hẹn",
  description: "Quản lý lịch hẹn giao nhận container.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="appointments" action="view">
      {children}
    </RequirePermission>
  );
}
