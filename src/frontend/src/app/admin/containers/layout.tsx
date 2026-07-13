import type { Metadata } from "next";
import { RequirePermission } from "@/lib/permissions";

export const metadata: Metadata = {
  title: "Quản lý Container",
  description: "Quản lý trạng thái và vị trí container.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="containers" action="view">
      {children}
    </RequirePermission>
  );
}
