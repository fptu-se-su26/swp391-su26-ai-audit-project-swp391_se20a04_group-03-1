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
import { Plus, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";

const sealData = [
  {
    id: 1,
    sealNo: "SEAL-001",
    container: "CNT-001",
    status: "Bình thường",
    tempC: 22,
    humidity: 65,
    lastUpdate: "2026-05-19 14:30",
    condition: "Tốt",
  },
  {
    id: 2,
    sealNo: "SEAL-002",
    container: "CNT-002",
    status: "Bình thường",
    tempC: 23,
    humidity: 68,
    lastUpdate: "2026-05-19 14:25",
    condition: "Tốt",
  },
  {
    id: 3,
    sealNo: "SEAL-003",
    container: "CNT-003",
    status: "Cảnh báo",
    tempC: 28,
    humidity: 75,
    lastUpdate: "2026-05-19 14:20",
    condition: "Cao",
  },
  {
    id: 4,
    sealNo: "SEAL-004",
    container: "CNT-004",
    status: "Bình thường",
    tempC: 21,
    humidity: 62,
    lastUpdate: "2026-05-19 14:15",
    condition: "Tốt",
  },
];

export default function SealPage() {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Giám sát niêm phong</h1>
          <p className="text-slate-600">Theo dõi IoT sensors trên container</p>
        </div>
        <Button className="gap-2 hover:bg-blue-500">
          <Plus className="h-4 w-4" />
          Gắn niêm phong
        </Button>
      </div>

      {/* Alert Banner */}
      {showAlert && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">
              Cảnh báo nhiệt độ cao
            </h3>
            <p className="text-sm text-yellow-800">
              Container CNT-003 có nhiệt độ vượt ngưỡng (28°C). Vui lòng kiểm
              tra.
            </p>
          </div>
          <button
            onClick={() => setShowAlert(false)}
            className="ml-auto text-yellow-600 hover:text-yellow-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng niêm phong</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">1,240</p>
            <p className="text-xs text-slate-500">đang hoạt động</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bình thường</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">1,210</p>
            <p className="text-xs text-slate-500">97.6%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Cảnh báo</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">30</p>
            <p className="text-xs text-slate-500">2.4%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Lỗi kết nối</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">0</p>
            <p className="text-xs text-slate-500">0%</p>
          </CardContent>
        </Card>
      </div>

      {/* Monitoring Table */}
      <Card>
        <CardHeader>
          <CardTitle>Trạng thái niêm phong</CardTitle>
          <CardDescription>Dữ liệu IoT từ các container</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">
                    Niêm phong
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Container</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Nhiệt độ</th>
                  <th className="text-left py-3 px-4 font-medium">Độ ẩm</th>
                  <th className="text-left py-3 px-4 font-medium">
                    Cập nhật lần cuối
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {sealData.map((seal) => (
                  <tr
                    key={seal.id}
                    className="border-b hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3 px-4 font-medium">{seal.sealNo}</td>
                    <td className="py-3 px-4">{seal.container}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                          seal.status === "Bình thường"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {seal.status === "Bình thường" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {seal.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{seal.tempC}°C</td>
                    <td className="py-3 px-4">{seal.humidity}%</td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {seal.lastUpdate}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm">
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nhiệt độ trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-around gap-2">
              {[22, 23, 21, 24, 22, 23, 21].map((temp, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(temp / 25) * 200}px` }}
                  />
                  <span className="text-xs text-slate-600">{idx}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Độ ẩm trung bình</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-around gap-2">
              {[65, 68, 62, 70, 65, 67, 63].map((humidity, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-cyan-500 rounded-t"
                    style={{ height: `${(humidity / 100) * 200}px` }}
                  />
                  <span className="text-xs text-slate-600">{idx}h</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
