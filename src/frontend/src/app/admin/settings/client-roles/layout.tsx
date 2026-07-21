import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Loại hình Doanh nghiệp",
  description:
    "Cấu hình các loại hình doanh nghiệp để client chọn khi đăng ký tài khoản.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="settings.client-roles" action="view">
      {children}
    </RequirePermission>
  );
}
