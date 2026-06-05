"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Container, ParkingCircle, AlertCircle, ArrowUpRight, Clock, Box } from "lucide-react"

const stats = [
  {
    title: "Xe đang chờ",
    value: "24",
    icon: Truck,
    color: "bg-[#1ed760] text-[#121212]",
  },
  {
    title: "Container trong bãi",
    value: "1,240",
    icon: Container,
    color: "bg-[#00D4FF] text-[#121212]",
  },
  {
    title: "Tỷ lệ sử dụng bãi",
    value: "78%",
    icon: ParkingCircle,
    color: "bg-[#f59e0b] text-[#121212]",
  },
  {
    title: "Cảnh báo an ninh",
    value: "5",
    icon: AlertCircle,
    color: "bg-[#f3727f] text-[#121212]",
  },
]

const recentActivity = [
  { time: "14:30", action: "Xe XE-001 check-in thành công tại Cổng 1", status: "Thành công" },
  { time: "14:25", action: "Container CNT-5021 lưu bãi khu A", status: "Thành công" },
  { time: "14:20", action: "Phiếu nâng #001 hoàn thành", status: "Thành công" },
  { time: "14:15", action: "Xe XE-002 check-out", status: "Thành công" },
  { time: "14:10", action: "Cảnh báo: Bãi khu A gần đạt sức chứa tối đa", status: "Cảnh báo" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight">Tổng Quan Trạng Thái</h1>
        <p className="text-[#666666] dark:text-[#b3b3b3] mt-2 text-[16px]">Cập nhật theo thời gian thực (Real-time). Chào mừng bạn trở lại!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] hover:border-[#1ed760] transition-colors duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#b3b3b3]">{stat.title}</CardTitle>
                <div className={`${stat.color} rounded-[500px] p-2.5 shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-[#121212] dark:text-[#ffffff]">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="xl:col-span-2 bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#121212] dark:text-[#ffffff]">Hoạt Động Mới Nhất</CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#b3b3b3]">Các luồng giao dịch qua cổng trong hôm nay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between py-4 border-b border-[#e5e5e5] dark:border-[#272727] last:border-0 group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-[500px] bg-[#f8f8f8] dark:bg-[#121212] flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-[#999999] dark:text-[#666666]" />
                    </div>
                    <div>
                      <p className="font-bold text-[14px] text-[#121212] dark:text-[#ffffff] group-hover:text-[#1ed760] transition-colors">{activity.action}</p>
                      <p className="text-[12px] text-[#666666] dark:text-[#999999] mt-1">{activity.time}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] px-3 py-1 font-bold uppercase tracking-wider rounded-[500px] ${
                    activity.status === "Thành công"
                      ? "bg-[#1ed760]/10 text-[#1db954]"
                      : "bg-[#f3727f]/10 text-[#f3727f]"
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727]">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#121212] dark:text-[#ffffff]">Hiệu Suất</CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#b3b3b3]">Chỉ số điều hành thực tế</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-[#f8f8f8] dark:bg-[#121212] p-5 rounded-[12px]">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">Xe vào bãi (Hôm nay)</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-3xl font-black text-[#121212] dark:text-[#ffffff]">42<span className="text-lg text-[#666666] dark:text-[#666666]"> lượt</span></p>
                <div className="flex items-center gap-1 text-[#1ed760] text-sm font-bold bg-[#1ed760]/10 px-2 py-1 rounded-[500px]">
                  <ArrowUpRight className="h-3 w-3" /> 12%
                </div>
              </div>
            </div>

            <div className="bg-[#f8f8f8] dark:bg-[#121212] p-5 rounded-[12px]">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">Thời gian chờ trung bình</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-3xl font-black text-[#121212] dark:text-[#ffffff]">14<span className="text-lg text-[#666666] dark:text-[#666666]"> phút</span></p>
                <div className="flex items-center gap-1 text-[#1ed760] text-sm font-bold bg-[#1ed760]/10 px-2 py-1 rounded-[500px]">
                  <ArrowUpRight className="h-3 w-3 rotate-90" /> 8%
                </div>
              </div>
            </div>

            <div className="bg-[#f8f8f8] dark:bg-[#121212] p-5 rounded-[12px]">
              <p className="text-[12px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">Tỷ lệ hủy chuyến</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-3xl font-black text-[#121212] dark:text-[#ffffff]">2.1%</p>
                <div className="flex items-center gap-1 text-[#1ed760] text-sm font-bold bg-[#1ed760]/10 px-2 py-1 rounded-[500px]">
                  <ArrowUpRight className="h-3 w-3 rotate-90" /> 0.5%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yard Status */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727]">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-[#121212] dark:text-[#ffffff]">Bản Đồ Phân Bổ Bãi</CardTitle>
          <CardDescription className="text-[#666666] dark:text-[#b3b3b3]">Mức độ lấp đầy container từng phân khu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Khu A (Nhập)", usage: 85, color: "bg-[#f3727f]" },
              { name: "Khu B (Xuất)", usage: 45, color: "bg-[#1ed760]" },
              { name: "Khu C (Chờ)", usage: 60, color: "bg-[#00D4FF]" },
              { name: "Khu D (Lưu trữ dài)", usage: 92, color: "bg-[#f59e0b]" }
            ].map((yard) => (
              <div key={yard.name} className="p-5 bg-[#f8f8f8] dark:bg-[#121212] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-[500px] bg-[#ffffff] dark:bg-[#181818] flex items-center justify-center shadow-sm">
                    <Box className="h-4 w-4 text-[#121212] dark:text-[#ffffff]" />
                  </div>
                  <p className="font-bold text-[14px] text-[#121212] dark:text-[#ffffff]">{yard.name}</p>
                </div>
                
                <div className="w-full bg-[#e5e5e5] dark:bg-[#272727] rounded-[500px] h-3 mb-3 overflow-hidden">
                  <div className={`${yard.color} h-full rounded-[500px] transition-all duration-1000 ease-out`} style={{ width: `${yard.usage}%` }} />
                </div>
                <div className="flex justify-between items-center text-[12px] font-bold">
                  <span className="text-[#666666] dark:text-[#999999]">Sức chứa</span>
                  <span className={yard.usage > 80 ? "text-[#f3727f]" : "text-[#121212] dark:text-[#ffffff]"}>{yard.usage}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
