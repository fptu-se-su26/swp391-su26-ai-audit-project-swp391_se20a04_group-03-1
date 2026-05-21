import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-sky-50/20 to-indigo-50/30 dark:from-[#0b132b] dark:via-[#1c2541] dark:to-[#3a506b] px-4 relative overflow-hidden">
      {/* Decorative Grid for high-end look */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="text-center max-w-2xl relative z-10 animate-fade-in px-4">
        <h1 className="text-7xl font-bold mb-6 transition-transform hover:scale-105 duration-300 select-none">
          🚢
        </h1>
        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
          LogiPort - Port Management System
        </h2>
        <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 mb-8 font-medium leading-relaxed">
          Hệ thống quản lý cảng container thông minh & hiện đại
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/admin/dashboard">
            <Button
              size="lg"
              className="bg-sky-600 hover:bg-sky-700 text-white dark:bg-sky-500 dark:hover:bg-sky-600 dark:text-slate-950 font-extrabold px-8 rounded-xl shadow-lg shadow-sky-600/20 dark:shadow-sky-500/10 cursor-pointer transition-all duration-200 active:scale-95"
            >
              Đi tới Dashboard
            </Button>
          </Link>
          <Link href="/admin/login">
            <Button
              size="lg"
              variant="outline"
              className="border-slate-300 text-slate-700 hover:bg-slate-100/50 dark:border-white/10 dark:text-white dark:hover:bg-white/5 font-bold px-8 rounded-xl cursor-pointer transition-all duration-200 active:scale-95"
            >
              Đăng nhập
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
