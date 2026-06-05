"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Footer } from "@/components/layout/footer"

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isAuthPage = pathname?.includes("/admin/login") || 
                     pathname?.includes("/admin/register") || 
                     pathname?.includes("/admin/forgot-password") || 
                     pathname?.includes("/admin/reset-password")

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen flex-col bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] transition-colors duration-300">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="p-6 flex-1">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
