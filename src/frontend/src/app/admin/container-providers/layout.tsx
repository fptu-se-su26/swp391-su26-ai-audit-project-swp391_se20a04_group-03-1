import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Nhà Cung Cấp",
  description: "Quản lý danh sách nhà cung cấp.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="container-providers" action="view">
      {children}
    </RequirePermission>
  );
}
