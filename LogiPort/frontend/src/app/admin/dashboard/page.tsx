"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Truck, Container, ParkingCircle, AlertCircle } from "lucide-react"

const stats = [
  {
    title: "Xe đang chờ",
    value: "24",
    icon: Truck,
    color: "bg-blue-500",
  },
  {
    title: "Container trong bãi",
    value: "1,240",
    icon: Container,
    color: "bg-green-500",
  },
  {
    title: "Tỷ lệ sử dụng bãi",
    value: "78%",
    icon: ParkingCircle,
    color: "bg-yellow-500",
  },
  {
    title: "Cảnh báo",
    value: "5",
    icon: AlertCircle,
    color: "bg-red-500",
  },
]

const recentActivity = [
  { time: "14:30", action: "Xe XE-001 check-in", status: "Thành công" },
  { time: "14:25", action: "Container CNT-5021 lưu bãi", status: "Thành công" },
  { time: "14:20", action: "Phiếu nâng #001 hoàn thành", status: "Thành công" },
  { time: "14:15", action: "Xe XE-002 check-out", status: "Thành công" },
  { time: "14:10", action: "Cảnh báo: Bãi khu A gần đầy", status: "Cảnh báo" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-slate-600">Chào mừng bạn trở lại!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.color} rounded-lg p-2`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Các giao dịch trong hôm nay</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    activity.status === "Thành công"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {activity.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Thống kê nhanh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Xe check-in hôm nay</p>
              <p className="text-2xl font-bold">42</p>
              <p className="text-xs text-slate-500">↑ 12% từ hôm qua</p>
            </div>
            <div className="h-px bg-slate-200" />
            <div>
              <p className="text-sm text-slate-600">Thời gian chờ trung bình</p>
              <p className="text-2xl font-bold">14 phút</p>
              <p className="text-xs text-slate-500">↓ 8% từ hôm qua</p>
            </div>
            <div className="h-px bg-slate-200" />
            <div>
              <p className="text-sm text-slate-600">Tỷ lệ hủy lịch</p>
              <p className="text-2xl font-bold">2.1%</p>
              <p className="text-xs text-slate-500">↓ 0.5% từ hôm qua</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yard Status */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái bãi</CardTitle>
          <CardDescription>Tình trạng chiếm dụng các khu bãi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Khu A", "Khu B", "Khu C", "Khu D"].map((yard) => (
              <div key={yard} className="p-4 border border-slate-200 rounded-lg">
                <p className="font-medium text-sm mb-3">{yard}</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                  <div className="bg-slate-900 h-2 rounded-full" style={{ width: "78%" }} />
                </div>
                <p className="text-xs text-slate-600">78% sử dụng</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
