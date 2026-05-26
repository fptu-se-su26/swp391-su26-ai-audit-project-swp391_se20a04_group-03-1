"use client";

import { Menu, LogOut, User, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Initialize theme from document element class or localStorage
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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    router.push(url);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 dark:border-slate-800 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1e293b] text-slate-600 dark:text-slate-300"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Link
            href="/admin/dashboard"
            className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            🚢 LogiPort
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {/* Rotating Sun/Moon Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-[#1e293b] rounded-xl text-slate-600 dark:text-slate-300 relative overflow-hidden transition-all duration-300 active:scale-95 cursor-pointer"
            aria-label="Toggle light/dark mode"
          >
            <div className="relative h-5 w-5">
              <Sun
                className={`h-5 w-5 absolute inset-0 transition-all duration-500 transform ${
                  theme === "dark"
                    ? "rotate-90 scale-0 opacity-0"
                    : "rotate-0 scale-100 opacity-100"
                } text-amber-500`}
              />
              <Moon
                className={`h-5 w-5 absolute inset-0 transition-all duration-500 transform ${
                  theme === "dark"
                    ? "rotate-0 scale-100 opacity-100"
                    : "-rotate-90 scale-0 opacity-0"
                } text-sky-400`}
              />
            </div>
          </button>

          <button className="p-2 hover:bg-slate-100 dark:hover:bg-[#1e293b] rounded-xl text-slate-600 dark:text-slate-300 cursor-pointer">
            <User className="h-5 w-5" />
          </button>

          <Button
            onClick={() => handleLogout("/admin/login")}
            variant="ghost"
            size="sm"
            className="gap-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b] hover:text-slate-900 dark:hover:text-white cursor-pointer font-semibold"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
