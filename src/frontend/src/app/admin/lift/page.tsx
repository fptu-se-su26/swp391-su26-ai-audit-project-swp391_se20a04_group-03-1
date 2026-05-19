"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, CheckCircle, Clock } from "lucide-react"
import { useState } from "react"

const liftRecords = [
  { id: 1, ticketNo: "LF-001", container: "CNT-001", type: "Nâng", equipment: "Kran 01", startTime: "08:15", endTime: "08:25", status: "Hoàn thành", operator: "Công nhân A" },
  { id: 2, ticketNo: "LF-002", container: "CNT-002", type: "Hạ", equipment: "Kran 02", startTime: "08:30", endTime: "08:40", status: "Hoàn thành", operator: "Công nhân B" },
  { id: 3, ticketNo: "LF-003", container: "CNT-003", type: "Nâng", equipment: "Kran 01", startTime: "09:00", endTime: null, status: "Đang xử lý", operator: "Công nhân C" },
  { id: 4, ticketNo: "LF-004", container: "CNT-004", type: "Hạ", equipment: "Kran 03", startTime: "09:15", endTime: null, status: "Chờ xử lý", operator: "-" },
]

export default function LiftPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Phiếu nâng/hạ container</h1>
          <p className="text-slate-600">Quản lý và theo dõi phiếu nâng/hạ container</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Tạo phiếu
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tạo phiếu nâng/hạ</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mã container</label>
                  <Input placeholder="CNT-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loại hoạt động</label>
                  <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm">
                    <option>Nâng</option>
                    <option>Hạ</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thiết bị</label>
                  <select className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm">
                    <option>Kran 01</option>
                    <option>Kran 02</option>
                    <option>Kran 03</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Công nhân</label>
                  <Input placeholder="Tên công nhân" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Tạo phiếu</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Hủy</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng phiếu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2,480</p>
            <p className="text-xs text-slate-500">tháng này</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Hoàn thành</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">2,350</p>
            <p className="text-xs text-slate-500">94.8%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Đang xử lý</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">128</p>
            <p className="text-xs text-slate-500">5.2%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Thời gian TB</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">8 phút</p>
            <p className="text-xs text-slate-500">mỗi phiếu</p>
          </CardContent>
        </Card>
      </div>

      {/* Records */}
      <Card>
        <CardHeader>
          <CardTitle>Nhật ký nâng/hạ</CardTitle>
          <CardDescription>Danh sách phiếu nâng/hạ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Phiếu</th>
                  <th className="text-left py-3 px-4 font-medium">Container</th>
                  <th className="text-left py-3 px-4 font-medium">Loại</th>
                  <th className="text-left py-3 px-4 font-medium">Thiết bị</th>
                  <th className="text-left py-3 px-4 font-medium">Giờ bắt đầu</th>
                  <th className="text-left py-3 px-4 font-medium">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-medium">Công nhân</th>
                </tr>
              </thead>
              <tbody>
                {liftRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium">{record.ticketNo}</td>
                    <td className="py-3 px-4">{record.container}</td>
                    <td className="py-3 px-4">{record.type}</td>
                    <td className="py-3 px-4">{record.equipment}</td>
                    <td className="py-3 px-4">{record.startTime}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === "Hoàn thành"
                          ? "bg-green-100 text-green-700"
                          : record.status === "Đang xử lý"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {record.status === "Hoàn thành" ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{record.operator}</td>
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
