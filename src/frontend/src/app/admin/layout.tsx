import { AdminLayout } from "@/components/layout/admin-layout"

export const dynamic = 'force-dynamic'

export const metadata = {
  title: "Container Port Management - Admin",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>
}
