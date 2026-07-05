import { RequirePermission } from "@/lib/permissions";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <RequirePermission resource="container-providers" action="update">
      {children}
    </RequirePermission>
  );
}
