import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Cấu hình vận hành",
  description:
    "Đặt các tham số vận hành của cảng, ví dụ sức chứa tối đa mỗi khung giờ đặt lịch.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="settings.system" action="view">
      {children}
    </RequirePermission>
  );
}
