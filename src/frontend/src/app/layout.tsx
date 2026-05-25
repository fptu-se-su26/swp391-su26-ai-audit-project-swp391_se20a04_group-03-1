import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Container Port Management",
  description: "Hệ thống quản lý cảng container thông minh",
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Hide Next.js dev badge in bottom-left (if present)
              (function(){
                try{
                  window.addEventListener('load', function(){
                    var all = document.querySelectorAll('body *');
                    all.forEach(function(el){
                      try{
                        var s = window.getComputedStyle(el);
                        if((s.position === 'fixed' || s.position === 'sticky') && (s.left === '0px' || s.left === '8px' || s.left === '4px') && (s.bottom === '0px' || s.bottom === '8px')){
                          var txt = (el.textContent||'').trim();
                          if(txt && /next\.js|nextjs|vercel/i.test(txt)){
                            el.style.display = 'none';
                          }
                        }
                      }catch(e){}
                    });
                  });
                }catch(e){}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-slate-50/50 dark:bg-[#0f172a] text-slate-900 dark:text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
