"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  Truck,
  Warehouse,
  Box,
  ArrowUpDown,
  Lock,
  BarChart3,
  X,
  Building2,
  IdCard,
} from "lucide-react"

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Đặt lịch xe",
    href: "/admin/appointments",
    icon: Calendar,
  },
  {
    label: "Quản lý công ty",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    label: "Quản lý tài xế",
    href: "/admin/drivers",
    icon: IdCard,
  },
  {
    label: "Quản lý cổng",
    href: "/admin/gate",
    icon: Truck,
  },
  {
    label: "Quản lý bãi",
    href: "/admin/yard",
    icon: Warehouse,
  },
  {
    label: "Quản lý container",
    href: "/admin/containers",
    icon: Box,
  },
  {
    label: "Báo cáo",
    href: "/admin/reports",
    icon: BarChart3,
  },
]

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 border-r border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 transition-transform duration-200 lg:relative lg:top-0 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between lg:hidden mb-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Menu</h2>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950/30 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn(
                  "h-5 w-5 transition-transform duration-200 group-hover:scale-105",
                  isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500"
                )} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
