"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { useState } from "react";

const containers = [
  {
    id: 1,
    number: "CNT-001",
    type: "20ft",
    status: "Hàng",
    location: "A-01-1-1",
    inDate: "2026-05-15",
    outDate: null,
    fee: 0,
  },
  {
    id: 2,
    number: "CNT-002",
    type: "40ft",
    status: "Rỗng",
    location: "A-01-1-2",
    inDate: "2026-05-16",
    outDate: null,
    fee: 0,
  },
  {
    id: 3,
    number: "CNT-003",
    type: "20ft",
    status: "Hàng",
    location: "B-02-2-1",
    inDate: "2026-05-14",
    outDate: null,
    fee: 0,
  },
  {
    id: 4,
    number: "CNT-004",
    type: "40ft",
    status: "Rỗng",
    location: "C-03-1-2",
    inDate: "2026-05-12",
    outDate: "2026-05-18",
    fee: 450000,
  },
];

export default function ContainersPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý container</h1>
          <p className="text-slate-600">
            Quản lý thông tin container trong bãi
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gap-2 hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Thêm container
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Thêm container mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số container</label>
                  <Input placeholder="CNT-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Loại</label>
                  <select className="w-full rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950/20 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 transition-all">
                    <option>20ft</option>
                    <option>40ft</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Trạng thái</label>
                  <select className="w-full rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-950/20 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/70 transition-all">
                    <option>Hàng</option>
                    <option>Rỗng</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Vị trí</label>
                  <Input placeholder="A-01-1-1" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ngày vào</label>
                  <Input type="date" />
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng container</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,240</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Đang lưu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">1,180</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">20ft</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">620</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">40ft</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-purple-600">620</p>
          </CardContent>
        </Card>
      </div>

      {/* Container List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách container</CardTitle>
          <CardDescription>Tất cả container trong bãi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">
                    Số container
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Loại</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Vị trí</th>
                  <th className="text-left py-3 px-4 font-medium">Ngày vào</th>
                  <th className="text-left py-3 px-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((container) => (
                  <tr
                    key={container.id}
                    className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3 px-4 font-medium">
                      {container.number}
                    </td>
                    <td className="py-3 px-4">{container.type}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          container.status === "Hàng"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {container.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{container.location}</td>
                    <td className="py-3 px-4">{container.inDate}</td>
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
