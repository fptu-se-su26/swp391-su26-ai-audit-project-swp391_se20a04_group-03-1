"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  CalendarCheck, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  UserSquare2
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function CompanyDashboardPage() {
  // Mock data for company dashboard
  const [stats, setStats] = useState({
    totalDrivers: 15,
    pendingAppointments: 4,
    inProgressTrips: 2,
    completedTrips: 45
  });

  const [recentAppointments, setRecentAppointments] = useState([
    {
      id: "APT-1029",
      type: "Lấy container",
      driver: "Nguyễn Văn A",
      truckPlate: "51C-123.45",
      time: "08:00 - 15/06/2026",
      status: "Đang chờ duyệt"
    },
    {
      id: "APT-1030",
      type: "Trả container",
      driver: "Trần Thị B",
      truckPlate: "51C-678.90",
      time: "10:30 - 15/06/2026",
      status: "Đã duyệt"
    },
    {
      id: "APT-1028",
      type: "Lấy container",
      driver: "Lê Văn C",
      truckPlate: "29H-444.55",
      time: "14:00 - 14/06/2026",
      status: "Hoàn thành"
    }
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Tổng quan Doanh nghiệp
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-2">
            Theo dõi hoạt động đội xe và các lịch hẹn vận chuyển.
          </p>
        </div>
        <Link href="/client/company/appointments/create">
          <Button className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 py-6 gap-2 border-none transition-all duration-200 shadow-lg shadow-[#1ed760]/20">
            <Plus className="h-5 w-5" />
            Tạo lịch hẹn mới
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-[#666666] dark:text-[#999999] uppercase tracking-[2px]">
                  Lịch hẹn chờ duyệt
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
                  {stats.pendingAppointments}
                </p>
              </div>
              <div className="h-12 w-12 rounded-[500px] bg-[#f59e0b]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Clock className="h-6 w-6 text-[#f59e0b]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-[#666666] dark:text-[#999999] uppercase tracking-[2px]">
                  Chuyến đang chạy
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
                  {stats.inProgressTrips}
                </p>
              </div>
              <div className="h-12 w-12 rounded-[500px] bg-[#3b82f6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Truck className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-[#666666] dark:text-[#999999] uppercase tracking-[2px]">
                  Đã hoàn thành
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
                  {stats.completedTrips}
                </p>
              </div>
              <div className="h-12 w-12 rounded-[500px] bg-[#1ed760]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-6 w-6 text-[#1ed760]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-[#666666] dark:text-[#999999] uppercase tracking-[2px]">
                  Quản lý Tài xế
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
                  {stats.totalDrivers}
                </p>
              </div>
              <div className="h-12 w-12 rounded-[500px] bg-[#a855f7]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserSquare2 className="h-6 w-6 text-[#a855f7]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px] flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Lịch hẹn gần đây
            </CardTitle>
          </div>
          <Link href="/client/company/appointments">
            <Button variant="ghost" className="text-[#666666] hover:text-[#121212] dark:text-[#b3b3b3] dark:hover:text-[#ffffff] font-bold uppercase tracking-wider text-[12px] gap-2">
              Xem tất cả <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                <tr>
                  <th className="px-6 py-4 font-black">Mã Lịch Hẹn</th>
                  <th className="px-6 py-4 font-black">Loại</th>
                  <th className="px-6 py-4 font-black">Tài xế / Biển số</th>
                  <th className="px-6 py-4 font-black">Thời gian dự kiến</th>
                  <th className="px-6 py-4 font-black">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                {recentAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                      {apt.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {apt.type === "Lấy container" ? (
                          <ArrowRight className="h-4 w-4 text-[#3b82f6]" />
                        ) : (
                          <ArrowRight className="h-4 w-4 text-[#1ed760] rotate-180" />
                        )}
                        {apt.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-[#121212] dark:text-[#ffffff]">
                          {apt.driver}
                        </span>
                        <span className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3]">
                          {apt.truckPlate}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                      {apt.time}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center justify-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border ${
                          apt.status === "Đã duyệt"
                            ? "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20"
                            : apt.status === "Hoàn thành"
                            ? "bg-[#1ed760]/10 text-[#1ed760] border-[#1ed760]/20"
                            : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
