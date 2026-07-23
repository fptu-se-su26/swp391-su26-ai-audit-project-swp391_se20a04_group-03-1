"use client";

import Link from "next/link";
import { Users, Building2, KeyRound, UserCog } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { usePermissions } from "@/lib/permissions";

export default function SettingsPage() {
  const { can } = usePermissions();

  // Chỉ liệt kê những mục ĐÃ CÓ trang thật và chạy được. Trước đây trang này còn
  // 4 thẻ trỏ tới /security, /general, /notifications, /backup — đều là link chết
  // (404) vì không có màn hình lẫn API phía sau, nên đã gỡ bỏ. Cấu hình bảo mật
  // cá nhân (đổi mật khẩu, phiên đăng nhập) đã nằm trong "Tài khoản của tôi".
  const settingOptions = [
    {
      title: "Tài khoản của tôi",
      description:
        "Xem thông tin cá nhân, đổi mật khẩu và đăng xuất khỏi mọi thiết bị.",
      icon: <UserCog className="h-6 w-6" />,
      href: "/admin/settings/profile",
      // Không gắn resource: mọi admin đều được xem hồ sơ của chính mình.
    },
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
