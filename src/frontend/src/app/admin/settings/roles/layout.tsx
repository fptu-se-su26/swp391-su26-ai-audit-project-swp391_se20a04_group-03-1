import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Vai trò & Phân quyền",
  description:
    "Tạo vai trò và gán quyền truy cập từng trang, từng thao tác cho quản trị viên.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="settings.roles" action="view">
      {children}
    </RequirePermission>
  );
}
