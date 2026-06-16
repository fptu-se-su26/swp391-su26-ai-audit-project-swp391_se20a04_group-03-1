"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { CompanyHeader } from "@/components/layout/company-header"
import { CompanySidebar } from "@/components/layout/company-sidebar"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "react-hot-toast"

export function CompanyLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const isAuthPage = pathname?.includes("/client/company/login") || 
                     pathname?.includes("/client/company/register")

  // Sync toast theme variables based on document.documentElement class
  useEffect(() => {
    const updateToastTheme = () => {
      const root = document.documentElement;
      if (root.classList.contains('dark')) {
        root.style.setProperty('--toast-bg', '#181818');
        root.style.setProperty('--toast-color', '#ffffff');
        root.style.setProperty('--toast-border', '#272727');
      } else {
        root.style.setProperty('--toast-bg', '#ffffff');
        root.style.setProperty('--toast-color', '#121212');
        root.style.setProperty('--toast-border', '#e5e5e5');
      }
    };
    
    updateToastTheme();
    
    // Create an observer to watch for class changes on html tag
    const observer = new MutationObserver(updateToastTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen flex-col bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] transition-colors duration-300">
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--toast-bg, #181818)',
            color: 'var(--toast-color, #ffffff)',
            borderRadius: '500px',
            border: '1px solid var(--toast-border, #272727)',
            fontSize: '12px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            padding: '12px 24px',
          },
          success: {
            iconTheme: {
              primary: '#1ed760',
              secondary: 'var(--toast-bg, #181818)',
            },
          },
          error: {
            iconTheme: {
              primary: '#f3727f',
              secondary: 'var(--toast-bg, #181818)',
            },
          },
        }}
      />
      <CompanyHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1 overflow-hidden">
        <CompanySidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto flex flex-col">
          <div className="p-6 flex-1">{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  )
}
