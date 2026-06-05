"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit2, Trash2, Calendar } from "lucide-react";
import { useState } from "react";

const appointmentData = [
  {
    id: 1,
    plate: "XE-001",
    company: "Công ty A",
    date: "2026-05-20",
    time: "08:00-09:00",
    status: "Đã duyệt",
  },
  {
    id: 2,
    plate: "XE-002",
    company: "Công ty B",
    date: "2026-05-20",
    time: "09:00-10:00",
    status: "Chờ duyệt",
  },
  {
    id: 3,
    plate: "XE-003",
    company: "Công ty C",
    date: "2026-05-20",
    time: "10:00-11:00",
    status: "Đã duyệt",
  },
  {
    id: 4,
    plate: "XE-004",
    company: "Công ty A",
    date: "2026-05-21",
    time: "08:00-09:00",
    status: "Đã duyệt",
  },
];

export default function AppointmentsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Đặt lịch xe</h1>
          <p className="text-slate-600">Quản lý lịch hẹn xe vào cảng</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Tạo lịch hẹn
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Tạo lịch hẹn mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Biển số xe</Label>
                  <Input placeholder="VN-001" />
                </div>
                <div className="space-y-2">
                  <Label>Công ty vận tải</Label>
                  <Input placeholder="Công ty ABC" />
                </div>
                <div className="space-y-2">
                  <Label>Ngày hẹn</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Khung giờ</Label>
                  <Input placeholder="08:00-09:00" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Lưu</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch hẹn</CardTitle>
          <CardDescription>Tất cả lịch hẹn của xe vào cảng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Biển số</th>
                  <th className="text-left py-3 px-4 font-medium">Công ty</th>
                  <th className="text-left py-3 px-4 font-medium">Ngày</th>
                  <th className="text-left py-3 px-4 font-medium">Giờ</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {appointmentData.map((apt) => (
                  <tr
                    key={apt.id}
                    className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3 px-4">{apt.plate}</td>
                    <td className="py-3 px-4">{apt.company}</td>
                    <td className="py-3 px-4">{apt.date}</td>
                    <td className="py-3 px-4">{apt.time}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          apt.status === "Đã duyệt"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
