import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Quản lý Tài khoản Admin",
  description: "Quản lý danh sách, thêm mới và xét duyệt các tài khoản quản trị viên.",
};

// Chặn ở layout để bao cả trang con /trash — trước đây chỉ trang danh sách tự
// chặn, gõ thẳng URL /settings/admins/trash là vào được khung trang.
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="settings.admins" action="view">
      {children}
    </RequirePermission>
  );
}
