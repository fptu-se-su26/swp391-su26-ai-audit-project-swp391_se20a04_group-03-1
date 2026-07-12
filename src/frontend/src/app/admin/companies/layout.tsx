import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Quản lý Công ty",
  description: "Quản lý danh sách công ty vận tải.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="companies" action="view">
      {children}
    </RequirePermission>
  );
}
