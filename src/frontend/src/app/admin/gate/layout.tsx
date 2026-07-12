import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Nhật ký Cổng",
  description: "Giám sát xe ra vào qua cổng.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="gates" action="view">
      {children}
    </RequirePermission>
  );
}
