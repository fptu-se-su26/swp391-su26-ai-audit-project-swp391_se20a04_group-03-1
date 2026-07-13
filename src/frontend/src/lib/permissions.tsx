"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";

/**
 * Tầng phân quyền phía client — CHỈ phục vụ UX (ẩn menu/nút, chặn gõ URL).
 * Backend mới là chốt chặn thật (mọi API đều qua requirePermission).
 */

interface Permission {
  resource: string;
  actions: string[];
}

interface PermissionState {
  loading: boolean;
  roleCode: string | null;
  isSuperAdmin: boolean;
  permissions: Permission[];
  can: (resource: string, action?: string) => boolean;
  refresh: () => Promise<void>;
}

const PermissionContext = createContext<PermissionState | null>(null);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [roleCode, setRoleCode] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);

  const fetchPermissions = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/me/permissions`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.code === "success") {
        setRoleCode(data.data.roleCode);
        setIsSuperAdmin(!!data.data.isSuperAdmin);
        setPermissions(data.data.permissions || []);
      }
    } catch {
      // Không lấy được quyền -> coi như không có quyền gì (fail-safe).
      setPermissions([]);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  // can("companies")           -> có quyền view trang companies?
  // can("companies","create")  -> có quyền create trên companies?
  const can = (resource: string, action: string = "view") => {
    if (isSuperAdmin) return true;
    const p = permissions.find((x) => x.resource === resource);
    return !!p && p.actions.includes(action);
  };

  return (
    <PermissionContext.Provider
      value={{
        loading,
        roleCode,
        isSuperAdmin,
        permissions,
        can,
        refresh: fetchPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const ctx = useContext(PermissionContext);
  if (!ctx) {
    throw new Error("usePermissions phải được dùng trong <PermissionProvider>");
  }
  return ctx;
}

/**
 * Gate hiển thị: chỉ render children nếu có quyền.
 * <Can resource="settings.admins" action="create"><Button/></Can>
 */
export function Can({
  resource,
  action = "view",
  children,
  fallback = null,
}: {
  resource: string;
  action?: string;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { can } = usePermissions();
  return <>{can(resource, action) ? children : fallback}</>;
}

/**
 * Guard cấp trang: bọc quanh nội dung trang. Không có quyền view -> màn 403.
 */
export function RequirePermission({
  resource,
  action = "view",
  children,
}: {
  resource: string;
  action?: string;
  children: ReactNode;
}) {
  const { can, loading } = usePermissions();
  const router = useRouter();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-[#1ed760]" />
        <p className="mt-3 font-bold uppercase tracking-wider text-[12px] text-[#666666] dark:text-[#b3b3b3]">
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
    );
  }

  if (!can(resource, action)) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="p-5 rounded-full bg-[#f3727f]/10 mb-6">
          <ShieldAlert className="h-14 w-14 text-[#f3727f]" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-wider text-[#121212] dark:text-[#ffffff]">
          Không có quyền truy cập
        </h2>
        <p className="mt-2 font-bold text-[#666666] dark:text-[#b3b3b3] max-w-md">
          Bạn không được cấp quyền để xem trang này. Vui lòng liên hệ quản trị
          viên nếu cần hỗ trợ.
        </p>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="mt-6 bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 py-2.5 transition-colors"
        >
          Về Bảng điều khiển
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
