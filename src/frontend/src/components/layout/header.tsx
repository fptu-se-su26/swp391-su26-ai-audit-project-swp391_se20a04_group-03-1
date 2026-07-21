"use client";

import { Menu, LogOut, Sun, Moon, Ship, UserCog, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { NotificationBell } from "@/components/layout/notification-bell";
import { useAdminProfile, initialsOf } from "@/lib/use-admin-profile";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { profile, loading } = useAdminProfile();

  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.classList.contains("dark") ? "dark" : "light");
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

  // Đóng menu tài khoản khi bấm ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  const handleLogout = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
      method: "GET",
      credentials: "include",
    });
    router.push("/admin/login");
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
            href="/admin/dashboard"
            className="font-bold text-2xl tracking-tight text-[#121212] dark:text-[#ffffff] flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <span className="text-[#1ed760]">
              <Ship className="h-8 w-8" />
            </span>
            LogiPort
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Rotating Sun/Moon Theme Toggle */}
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

          <NotificationBell />

          {/* Tài khoản: avatar chữ + tên, mở menu sang trang hồ sơ */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label="Menu tài khoản"
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1.5 bg-[#f8f8f8] dark:bg-[#121212] hover:bg-[#e5e5e5] dark:hover:bg-[#272727] rounded-[500px] transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
            >
              <span className="h-8 w-8 rounded-[500px] bg-[#1ed760] text-[#121212] flex items-center justify-center font-black text-[13px] shrink-0">
                {initialsOf(profile?.fullName)}
              </span>
              <span className="hidden sm:flex flex-col items-start leading-tight max-w-[150px]">
                <span className="font-bold text-[13px] text-[#121212] dark:text-[#ffffff] truncate w-full">
                  {loading ? "Đang tải..." : profile?.fullName || "Quản trị viên"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#b3b3b3] truncate w-full">
                  {profile?.roleName || profile?.roleCode || "—"}
                </span>
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[#666666] dark:text-[#b3b3b3] transition-transform duration-200 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-[260px] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727] bg-[#ffffff] dark:bg-[#181818] shadow-xl z-50 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e5e5e5] dark:border-[#272727]">
                  <p className="font-black text-[14px] text-[#121212] dark:text-[#ffffff] truncate">
                    {profile?.fullName || "Quản trị viên"}
                  </p>
                  <p className="text-[12px] text-[#666666] dark:text-[#b3b3b3] truncate mt-0.5">
                    {profile?.email || "—"}
                  </p>
                  {profile?.gateName && (
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#1db954] mt-1.5">
                      Cổng {profile.gateName}
                    </p>
                  )}
                </div>

                <Link
                  href="/admin/settings/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors"
                >
                  <UserCog className="h-4 w-4 text-[#666666] dark:text-[#b3b3b3]" />
                  Tài khoản của tôi
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-5 py-3.5 text-[13px] font-bold text-[#f3727f] hover:bg-[#f3727f]/10 transition-colors cursor-pointer border-t border-[#e5e5e5] dark:border-[#272727]"
                >
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
