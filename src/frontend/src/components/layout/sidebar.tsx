"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/lib/permissions";
import {
  LayoutDashboard,
  Calendar,
  Truck,
  Warehouse,
  Box,
  BarChart3,
  X,
  Building2,
  IdCard,
  Ship,
  Settings,
} from "lucide-react";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

// Mỗi mục gắn `resource` để lọc theo quyền view.
const menuItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, resource: "dashboard" },
  { label: "Quản lý lịch hẹn", href: "/admin/appointments", icon: Calendar, resource: "appointments" },
  { label: "Quản lý công ty", href: "/admin/companies", icon: Building2, resource: "companies" },
  { label: "Quản lý nhà cung cấp", href: "/admin/container-providers", icon: Ship, resource: "container-providers" },
  { label: "Quản lý tài xế", href: "/admin/drivers", icon: IdCard, resource: "drivers" },
  { label: "Quản lý cổng", href: "/admin/gate", icon: Truck, resource: "gates" },
  { label: "Quản lý bãi", href: "/admin/yard", icon: Warehouse, resource: "yards" },
  { label: "Quản lý container", href: "/admin/containers", icon: Box, resource: "containers" },
  { label: "Báo cáo", href: "/admin/reports", icon: BarChart3, resource: "reports" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { can } = usePermissions();

  // Chỉ hiện mục có quyền view. Menu cài đặt hiện nếu có quyền vào bất kỳ trang con nào.
  const visibleItems = menuItems.filter((item) => can(item.resource, "view"));
  const canSeeSettings =
    can("settings.admins", "view") ||
    can("settings.roles", "view") ||
    can("settings.client-roles", "view");

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#000000]/50 lg:hidden z-40"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-[72px] bottom-0 w-64 border-r border-[#e5e5e5] dark:border-[#272727] bg-[#ffffff] dark:bg-[#181818] p-4 transition-all duration-300 lg:relative lg:top-0 lg:translate-x-0 z-50",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between lg:hidden mb-6">
          <h2 className="text-lg font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-[500px] text-[#666666] hover:bg-[#f0f0f0] dark:text-[#b3b3b3] dark:hover:bg-[#272727] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 rounded-[500px] text-[14px] font-bold transition-all duration-200",
                  isActive
                    ? "bg-[#1ed760] text-[#121212] shadow-sm transform scale-[1.02]"
                    : "text-[#666666] dark:text-[#b3b3b3] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff]",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    isActive
                      ? "text-[#121212]"
                      : "text-[#999999] dark:text-[#666666] group-hover:text-[#121212] dark:group-hover:text-[#ffffff]",
                  )}
                />
                <span
                  className={cn(
                    isActive && "uppercase tracking-wider text-[13px]",
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}

          {canSeeSettings && (
          <>
          <div className="pt-4 pb-2">
            <div className="h-px w-full bg-[#e5e5e5] dark:bg-[#272727]" />
          </div>

          <Link
            href="/admin/settings"
            className={cn(
              "flex items-center gap-4 px-5 py-3.5 rounded-[500px] text-[14px] font-bold transition-all duration-200",
              pathname.startsWith("/admin/settings")
                ? "bg-[#1ed760] text-[#121212] shadow-sm transform scale-[1.02]"
                : "text-[#666666] dark:text-[#b3b3b3] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff]",
            )}
          >
            <Settings
              className={cn(
                "h-5 w-5 transition-transform duration-200",
                pathname.startsWith("/admin/settings")
                  ? "text-[#121212]"
                  : "text-[#999999] dark:text-[#666666] group-hover:text-[#121212] dark:group-hover:text-[#ffffff]",
              )}
            />
            <span
              className={cn(
                pathname.startsWith("/admin/settings") &&
                  "uppercase tracking-wider text-[13px]",
              )}
            >
              Cài đặt chung
            </span>
          </Link>
          </>
          )}
        </nav>
      </aside>
    </>
  );
}
