import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Quản lý Tài xế",
  description: "Quản lý danh sách tài xế.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="drivers" action="view">
      {children}
    </RequirePermission>
  );
}
