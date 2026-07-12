import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Quản lý Bãi đỗ",
  description: "Giám sát và cấu hình bãi đỗ container.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="yards" action="view">
      {children}
    </RequirePermission>
  );
}
