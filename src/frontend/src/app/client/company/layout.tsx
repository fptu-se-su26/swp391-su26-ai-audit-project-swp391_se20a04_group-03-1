import { CompanyLayout } from "@/components/layout/company-layout"

export const dynamic = 'force-dynamic'

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Doanh nghiệp - Logiport",
    default: "Hệ thống Doanh nghiệp | Logiport",
  },
  description: "Cổng thông tin dành cho Doanh nghiệp Vận tải.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <CompanyLayout>{children}</CompanyLayout>
}
