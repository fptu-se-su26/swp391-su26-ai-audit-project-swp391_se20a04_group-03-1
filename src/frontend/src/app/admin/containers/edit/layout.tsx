import { RequirePermission } from "@/lib/permissions";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="containers" action="update">
      {children}
    </RequirePermission>
  );
}
