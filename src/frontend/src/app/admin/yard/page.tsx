"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoStream } from "@/components/ui/video-stream";
import { Plus, MapPin } from "lucide-react";
import { useState } from "react";

const yardSlots = [
  {
    id: 1,
    block: "A",
    bay: "01",
    row: "1",
    tier: "1",
    status: "Trống",
    plate: null,
  },
  {
    id: 2,
    block: "A",
    bay: "01",
    row: "1",
    tier: "2",
    status: "Sử dụng",
    plate: "XE-001",
  },
  {
    id: 3,
    block: "A",
    bay: "01",
    row: "2",
    tier: "1",
    status: "Trống",
    plate: null,
  },
  {
    id: 4,
    block: "A",
    bay: "01",
    row: "2",
    tier: "2",
    status: "Sử dụng",
    plate: "XE-002",
  },
  {
    id: 5,
    block: "A",
    bay: "02",
    row: "1",
    tier: "1",
    status: "Trống",
    plate: null,
  },
  {
    id: 6,
    block: "A",
    bay: "02",
    row: "1",
    tier: "2",
    status: "Sử dụng",
    plate: "XE-003",
  },
];

export default function YardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quản lý bãi</h1>
          <p className="text-slate-600">
            Quản lý vị trí đỗ xe và trạng thái bãi
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Thêm vị trí
        </Button>
      </div>

      {/* Video Streaming Section */}
      <div className="w-full h-full">
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Camera Cổng 1</CardTitle>
            <CardDescription>Entrance Gate A</CardDescription>
          </CardHeader>
          <CardContent className="p-2">
            <VideoStream title="Sân A" cameraId="YARD-001" />
          </CardContent>
        </Card>
      </div>

      {/* Yard Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Tổng vị trí</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">480</p>
            <p className="text-xs text-slate-500">ô đỗ</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Đang sử dụng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">374</p>
            <p className="text-xs text-slate-500">78% chiếm dụng</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Trống</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-blue-600">106</p>
            <p className="text-xs text-slate-500">22% còn trống</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Bảo trì</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-orange-600">0</p>
            <p className="text-xs text-slate-500">ô đỗ</p>
          </CardContent>
        </Card>
      </div>

      {/* Yard Map */}
      <Card>
        <CardHeader>
          <CardTitle>Bản đồ bãi</CardTitle>
          <CardDescription>Trạng thái sử dụng từng vị trí</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {yardSlots.map((slot) => (
              <div
                key={slot.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                  slot.status === "Trống"
                    ? "border-slate-300 bg-slate-50 hover:border-slate-400"
                    : "border-green-400 bg-green-50 hover:border-green-500"
                }`}
              >
                <p className="text-xs font-medium text-slate-600">
                  {slot.block}-{slot.bay}-{slot.row}-{slot.tier}
                </p>
                {slot.plate && (
                  <p className="text-sm font-bold text-green-700 mt-1">
                    {slot.plate}
                  </p>
                )}
                <p className="text-xs text-slate-500 mt-1">
                  {slot.status === "Trống" ? "🟢" : "🔴"} {slot.status}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Yard Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Các khu bãi</CardTitle>
          <CardDescription>Thông tin chi tiết từng khu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Khu A", "Khu B", "Khu C", "Khu D"].map((zone) => (
              <div
                key={zone}
                className="p-4 border border-slate-200 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-slate-600" />
                  <p className="font-semibold">{zone}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tổng ô</span>
                    <span className="font-medium">120</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Đang sử dụng</span>
                    <span className="font-medium">94</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Trống</span>
                    <span className="font-medium">26</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-slate-900 h-2 rounded-full"
                        style={{ width: "78%" }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">78% sử dụng</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
