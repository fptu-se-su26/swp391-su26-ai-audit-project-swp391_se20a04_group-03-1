import { Toaster } from "react-hot-toast";

export const dynamic = 'force-dynamic'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: "bg-white dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] font-bold rounded-[500px] px-6 py-3 text-sm shadow-lg",
          style: {
            // Unset default react-hot-toast inline styles to allow className to work
            background: 'unset',
            color: 'unset',
            boxShadow: 'unset',
            borderRadius: 'unset',
            border: 'unset',
            padding: 'unset',
            maxWidth: '400px',
          },
          success: {
            iconTheme: {
              primary: '#1ed760',
              secondary: '#ffffff', // works fine in both
            },
          },
          error: {
            iconTheme: {
              primary: '#f3727f',
              secondary: '#ffffff',
            },
          }
        }}
      />
      {children}
    </>
  )
}
