"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoStream } from "@/components/ui/video-stream"
import { Plus, CheckCircle, XCircle } from "lucide-react"
import { useState } from "react"

const gateData = [
  { id: 1, plate: "XE-001", driver: "Nguyễn A", container: "CNT-001", checkInTime: "08:15", status: "Đã vào", action: "Check-out" },
  { id: 2, plate: "XE-002", driver: "Trần B", container: "CNT-002", checkInTime: "08:30", status: "Đã vào", action: "Check-out" },
  { id: 3, plate: "XE-003", driver: "Lê C", container: "CNT-003", checkInTime: "09:00", status: "Đã vào", action: "Check-out" },
]

export default function GatePage() {
  const [showCheckIn, setShowCheckIn] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý cổng</h1>
          <p className="text-slate-600">Quản lý check-in/check-out xe</p>
        </div>
        <Button onClick={() => setShowCheckIn(!showCheckIn)} className="gap-2">
          <Plus className="h-4 w-4" />
          Check-in
        </Button>
      </div>

      {/* Video Streaming Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Camera Cổng 1</CardTitle>
            <CardDescription>Entrance Gate A</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <VideoStream title="Cổng A - Vào" cameraId="GATE-001" />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Camera Cổng 2</CardTitle>
            <CardDescription>Exit Gate B</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <VideoStream title="Cổng B - Ra" cameraId="GATE-002" />
          </CardContent>
        </Card>
      </div>

      {/* Check-in Form */}
      {showCheckIn && (
        <Card>
          <CardHeader>
            <CardTitle>Check-in xe</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Biển số xe</label>
                  <Input placeholder="VN-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên tài xế</label>
                  <Input placeholder="Nguyễn A" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số booking</label>
                  <Input placeholder="BK-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mã container</label>
                  <Input placeholder="CNT-001" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Xác nhận</Button>
                <Button type="button" variant="outline" onClick={() => setShowCheckIn(false)}>Hủy</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Xe đã vào</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">24</p>
            <p className="text-xs text-slate-500">hôm nay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Xe đã ra</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">18</p>
            <p className="text-xs text-slate-500">hôm nay</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Xe đang chờ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">6</p>
            <p className="text-xs text-slate-500">tại cổng</p>
          </CardContent>
        </Card>
      </div>

      {/* Gate Log */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký cổng</CardTitle>
          <CardDescription>Lịch check-in/check-out xe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Biển số</th>
                  <th className="text-left py-3 px-4 font-medium">Tài xế</th>
                  <th className="text-left py-3 px-4 font-medium">Container</th>
                  <th className="text-left py-3 px-4 font-medium">Giờ vào</th>
                  <th className="text-left py-3 px-4 font-medium">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {gateData.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{item.plate}</td>
                    <td className="py-3 px-4">{item.driver}</td>
                    <td className="py-3 px-4">{item.container}</td>
                    <td className="py-3 px-4">{item.checkInTime}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                        <CheckCircle className="h-3 w-3" />
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">{item.action}</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
