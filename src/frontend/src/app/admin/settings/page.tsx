"use client";

import Link from "next/link";
import { Users, ShieldCheck, Settings as SettingsIcon, Bell, Database } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const settingOptions = [
    {
      title: "Quản lý Tài khoản Admin",
      description: "Thêm mới, xét duyệt và phân quyền cho các tài khoản quản trị hệ thống.",
      icon: <Users className="h-6 w-6 text-[#00754A]" />,
      href: "/admin/settings/admins",
      color: "bg-[#00754A]/10",
    },
    {
      title: "Cấu hình Bảo mật",
      description: "Thiết lập xác thực 2 bước, quản lý phiên đăng nhập và chính sách mật khẩu.",
      icon: <ShieldCheck className="h-6 w-6 text-[#00754A]" />,
      href: "/admin/settings/security",
      color: "bg-[#00754A]/10",
    },
    {
      title: "Cài đặt Chung",
      description: "Thay đổi thông tin website, múi giờ, ngôn ngữ và các tùy chọn hiển thị.",
      icon: <SettingsIcon className="h-6 w-6 text-[#00754A]" />,
      href: "/admin/settings/general",
      color: "bg-[#00754A]/10",
    },
    {
      title: "Thông báo & Cảnh báo",
      description: "Tùy chỉnh các kênh nhận thông báo (Email, Zalo, SMS) cho các sự kiện.",
      icon: <Bell className="h-6 w-6 text-[#00754A]" />,
      href: "/admin/settings/notifications",
      color: "bg-[#00754A]/10",
    },
    {
      title: "Sao lưu Dữ liệu",
      description: "Thiết lập sao lưu dữ liệu định kỳ và phục hồi hệ thống khi có sự cố.",
      icon: <Database className="h-6 w-6 text-[#00754A]" />,
      href: "/admin/settings/backup",
      color: "bg-[#00754A]/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 bg-[#f8f8f8] dark:bg-[#121212] min-h-screen transition-colors duration-300">
      {/* Header Band */}
      <div className="bg-[#1E3932] dark:bg-[#181818] dark:border dark:border-[#272727] rounded-xl p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-semibold tracking-[-0.01em] mb-2">Cài đặt Hệ thống</h1>
          <p className="text-white/70 max-w-2xl text-[16px] leading-relaxed">
            Trung tâm điều khiển và cấu hình toàn bộ hoạt động của nền tảng Logiport. Quản lý phân quyền, bảo mật và thiết lập chuyên sâu.
          </p>
        </div>
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#006241] to-transparent opacity-50 hidden md:block"></div>
        <SettingsIcon className="absolute -right-8 -top-8 h-48 w-48 text-white opacity-5 hidden md:block" />
      </div>

      {/* Menu Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {settingOptions.map((option, idx) => (
          <Link href={option.href} key={idx} className="group outline-none">
            <Card className="h-full border-none dark:border dark:border-[#272727] shadow-[0_0_0.5px_rgba(0,0,0,0.14),_0_1px_1px_rgba(0,0,0,0.24)] hover:shadow-[0_0_6px_rgba(0,0,0,0.24),_0_8px_12px_rgba(0,0,0,0.14)] transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-[#181818] rounded-[12px] overflow-hidden cursor-pointer">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${option.color} dark:bg-[#1ed760]/10 transition-colors duration-300 group-hover:bg-[#1ed760] group-hover:text-[#121212]`}>
                    {/* Switch icon color on hover using css class trick or just let it inherit if we manipulated SVG, but for simplicity we rely on React */}
                    <div className="group-hover:text-[#121212] transition-colors duration-300 [&>svg]:group-hover:text-[#121212]">
                      {option.icon}
                    </div>
                  </div>
                  <h3 className="text-[19px] font-semibold text-[#121212] dark:text-[#ffffff] group-hover:text-[#1db954] dark:group-hover:text-[#1ed760] transition-colors duration-200 tracking-[-0.01em]">
                    {option.title}
                  </h3>
                </div>
                <p className="text-[14px] text-black/60 dark:text-[#b3b3b3] leading-relaxed mt-auto tracking-[-0.01em]">
                  {option.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
