"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, Filter } from "lucide-react"

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Báo cáo</h1>
          <p className="text-slate-600">Xem và tải báo cáo quản lý cảng</p>
        </div>
        <Button className="gap-2">
          <Download className="h-4 w-4" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Filter Options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">Từ ngày</label>
              <input type="date" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm mt-1" defaultValue="2026-05-01" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Đến ngày</label>
              <input type="date" className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm mt-1" defaultValue="2026-05-19" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Loại báo cáo</label>
              <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm mt-1">
                <option>Tất cả</option>
                <option>Xe vào/ra</option>
                <option>Container</option>
                <option>Phiếu nâng/hạ</option>
                <option>Doanh thu</option>
              </select>
            </div>
            <Button className="gap-2">
              <Filter className="h-4 w-4" />
              Lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { title: "Báo cáo xe vào/ra", icon: "🚚", desc: "Số liệu xe check-in/out theo ngày", date: "Hôm nay" },
          { title: "Báo cáo bãi", icon: "📦", desc: "Tình trạng chiếm dụng bãi", date: "Hôm nay" },
          { title: "Báo cáo container", icon: "📊", desc: "Số lượng container theo loại", date: "Hôm nay" },
          { title: "Báo cáo hiệu suất", icon: "⚡", desc: "Hiệu suất xử lý theo khung giờ", date: "Tuần này" },
          { title: "Báo cáo doanh thu", icon: "💰", desc: "Doanh thu từ phí lưu trú", date: "Tháng này" },
          { title: "Báo cáo cảnh báo", icon: "⚠️", desc: "Các sự cố và cảnh báo", date: "Tháng này" },
        ].map((report, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{report.icon}</span>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-base mt-2">{report.title}</CardTitle>
              <CardDescription>{report.desc}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-500">Cập nhật: {report.date}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Chỉ số chính (KPIs)</CardTitle>
          <CardDescription>Các chỉ số quản lý chính hôm nay</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-2">Tổng xe check-in</p>
              <p className="text-3xl font-bold text-blue-600">42</p>
              <p className="text-xs text-slate-500 mt-1">↑ 12% từ hôm qua</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Thời gian chờ TB</p>
              <p className="text-3xl font-bold text-green-600">14 phút</p>
              <p className="text-xs text-slate-500 mt-1">↓ 8% từ hôm qua</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Tỷ lệ sử dụng bãi</p>
              <p className="text-3xl font-bold text-yellow-600">78%</p>
              <p className="text-xs text-slate-500 mt-1">Tăng 5%</p>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-2">Phiếu nâng/hạ</p>
              <p className="text-3xl font-bold text-purple-600">128</p>
              <p className="text-xs text-slate-500 mt-1">Hôm nay</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Lượng xe theo giờ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-around gap-1">
              {[5, 8, 12, 15, 18, 14, 12, 10, 8, 6, 4, 3].map((count, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${(count / 20) * 200}px` }}
                  />
                  <span className="text-xs text-slate-600">{idx}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Phân bố container</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "20ft Hàng", value: 45, color: "bg-blue-500" },
                { label: "40ft Hàng", value: 30, color: "bg-purple-500" },
                { label: "20ft Rỗng", value: 15, color: "bg-cyan-500" },
                { label: "40ft Rỗng", value: 10, color: "bg-indigo-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-semibold">{item.value}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
