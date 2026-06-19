"use client";

import { Menu, LogOut, User, Sun, Moon, Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ProviderHeaderProps {
  onMenuClick?: () => void;
}

export function ProviderHeader({ onMenuClick }: ProviderHeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  const router = useRouter();
  const handleLogout = async (url: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/provider/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      window.location.href = url;
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      window.location.href = url;
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e5e5e5] dark:border-[#272727] bg-[#ffffff]/90 dark:bg-[#181818]/90 backdrop-blur-md transition-colors duration-300">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-[500px] hover:bg-[#f0f0f0] dark:hover:bg-[#272727] text-[#121212] dark:text-[#ffffff] transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link
            href="/client/provider/dashboard"
            className="font-bold text-2xl tracking-tight text-[#121212] dark:text-[#ffffff] flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-[#1ed760]">
              <Ship className="h-8 w-8" />
            </span>
            LogiPort
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="p-2.5 bg-[#f8f8f8] dark:bg-[#121212] hover:bg-[#e5e5e5] dark:hover:bg-[#272727] rounded-[500px] text-[#121212] dark:text-[#ffffff] relative overflow-hidden transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
            aria-label="Toggle light/dark mode"
          >
            <div className="relative h-5 w-5">
              <Sun
                className={`h-5 w-5 absolute inset-0 transition-all duration-500 transform ${
                  theme === "dark"
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                } text-[#121212]`}
              />
              <Moon
                className={`h-5 w-5 absolute inset-0 transition-all duration-500 transform ${
                  theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                } text-[#ffffff]`}
              />
            </div>
          </button>

          <button className="p-2.5 bg-[#f8f8f8] dark:bg-[#121212] hover:bg-[#e5e5e5] dark:hover:bg-[#272727] rounded-[500px] text-[#121212] dark:text-[#ffffff] transition-all duration-300 active:scale-95 cursor-pointer shadow-sm">
            <User className="h-5 w-5" />
          </button>

          <Button
            onClick={() => handleLogout("/client/provider/login")}
            className="gap-2 rounded-[500px] bg-[#121212] dark:bg-[#ffffff] text-[#ffffff] dark:text-[#121212] hover:bg-[#1ed760] dark:hover:bg-[#1ed760] hover:text-[#121212] cursor-pointer font-black uppercase tracking-wider px-6 shadow-sm transition-colors duration-300"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  );
}
