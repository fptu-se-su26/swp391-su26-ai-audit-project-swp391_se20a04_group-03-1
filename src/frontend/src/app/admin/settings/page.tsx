"use client";

import Link from "next/link";
import { Users, ShieldCheck, Settings as SettingsIcon, Bell, Database, Building2, KeyRound } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePermissions } from "@/lib/permissions";

export default function SettingsPage() {
  const { can } = usePermissions();
  const settingOptions = [
    {
      title: "Vai trò & Phân quyền",
      description: "Tạo vai trò, gán quyền truy cập từng trang và thao tác CRUD cho quản trị viên.",
      icon: <KeyRound className="h-6 w-6" />,
      href: "/admin/settings/roles",
      resource: "settings.roles",
    },
    {
      title: "Loại hình Doanh nghiệp",
      description: "Cấu hình các vai trò (roles) để client lựa chọn phân loại khi đăng ký tài khoản.",
      icon: <Building2 className="h-6 w-6" />,
      href: "/admin/settings/client-roles",
      resource: "settings.client-roles",
    },
    {
      title: "Quản lý Tài khoản",
      description: "Thêm mới, xét duyệt và phân quyền cho các tài khoản quản trị hệ thống.",
      icon: <Users className="h-6 w-6" />,
      href: "/admin/settings/admins",
      resource: "settings.admins",
    },
    {
      title: "Cấu hình Bảo mật",
      description: "Thiết lập xác thực 2 bước, quản lý phiên đăng nhập và chính sách mật khẩu.",
      icon: <ShieldCheck className="h-6 w-6" />,
      href: "/admin/settings/security",
    },
    {
      title: "Cài đặt Chung",
      description: "Thay đổi thông tin website, múi giờ, ngôn ngữ và các tùy chọn hiển thị.",
      icon: <SettingsIcon className="h-6 w-6" />,
      href: "/admin/settings/general",
    },
    {
      title: "Thông báo & Cảnh báo",
      description: "Tùy chỉnh các kênh nhận thông báo (Email, Zalo, SMS) cho các sự kiện.",
      icon: <Bell className="h-6 w-6" />,
      href: "/admin/settings/notifications",
    },
    {
      title: "Sao lưu Dữ liệu",
      description: "Thiết lập sao lưu dữ liệu định kỳ và phục hồi hệ thống khi có sự cố.",
      icon: <Database className="h-6 w-6" />,
      href: "/admin/settings/backup",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Cài đặt Hệ thống
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Trung tâm điều khiển và cấu hình toàn bộ hoạt động của nền tảng Logiport.
          </p>
        </div>
      </div>

      {/* Menu Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-2">
        {settingOptions
          .filter((option) => !option.resource || can(option.resource, "view"))
          .map((option, idx) => (
          <Link href={option.href} key={idx} className="group outline-none">
            <Card className="h-full bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors rounded-[16px] overflow-hidden cursor-pointer">
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full bg-[#f8f8f8] dark:bg-[#272727] text-[#666666] dark:text-[#b3b3b3] transition-colors duration-300 group-hover:bg-[#1ed760] group-hover:text-[#121212]`}>
                    <div className="transition-colors duration-300">
                      {option.icon}
                    </div>
                  </div>
                  <h3 className="text-[19px] font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider transition-colors duration-200">
                    {option.title}
                  </h3>
                </div>
                <p className="text-[14px] font-bold text-[#666666] dark:text-[#b3b3b3] leading-relaxed mt-auto">
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
