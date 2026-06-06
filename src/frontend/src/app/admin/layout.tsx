import { AdminLayout } from "@/components/layout/admin-layout"

export const dynamic = 'force-dynamic'

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Logiport",
    default: "Hệ thống Quản lý Cảng | Logiport",
  },
  description: "Hệ thống quản lý cảng container hiện đại.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
