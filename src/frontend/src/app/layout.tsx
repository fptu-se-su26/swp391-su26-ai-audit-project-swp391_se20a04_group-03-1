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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://datnotes.click"),
  title: {
    template: "%s | Logiport",
    default: "Logiport | Hệ thống quản lý cảng container thông minh",
  },
  description: "Logiport là nền tảng quản lý bãi đỗ, lịch hẹn và điều phối xe ra vào cảng container thông minh, giúp tối ưu hóa luồng vận hành logistics.",
  keywords: ["logistics", "quản lý cảng", "container", "bến bãi", "đặt lịch xe", "port management", "logiport"],
  authors: [{ name: "Logiport Team" }],
  creator: "Logiport",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
    other: {
      rel: "apple-touch-icon-precomposed",
      url: "/icon.svg",
    },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "/",
    title: "Logiport | Hệ thống quản lý cảng container thông minh",
    description: "Nền tảng quản lý bãi đỗ, lịch hẹn và điều phối xe ra vào cảng container thông minh, giúp tối ưu hóa luồng vận hành logistics.",
    siteName: "Logiport",
  },
  twitter: {
    card: "summary_large_image",
    title: "Logiport | Hệ thống quản lý cảng",
    description: "Nền tảng quản lý bãi đỗ và điều phối container thông minh.",
  },
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
      <body className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
