"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Car,
  Box,
  User,
  Clock,
  CheckCircle,
  Image as ImageIcon,
} from "lucide-react";

export default function GateLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [log, setLog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogDetail();
  }, [id]);

  const fetchLogDetail = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scan/logs/${id}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.code === "success") {
        setLog(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>
    );
  }

  if (!log) {
    return (
      <div className="p-8 text-center text-red-500">Không tìm thấy nhật ký</div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chi tiết nhật ký cổng
          </h1>
          <p className="text-muted-foreground">ID: {log._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Car className="h-5 w-5 text-blue-500" /> Thông tin xe
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Biển số xe:</span>
              <span className="font-bold text-lg">{log.actualTruckPlate}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Box className="h-4 w-4" /> Container:
              </span>
              <span className="font-semibold">
                {log.actualContainerNo || "Không có"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <User className="h-4 w-4" /> Tài xế:
              </span>
              <span className="font-semibold">
                {log.appointmentId?.driverId?.driverName || "Không xác định"}
              </span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">Độ tin cậy OCR:</span>
              <span className="font-semibold text-green-600">
                {(log.ocrConfidence * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" /> Trạng thái & Thời
              gian
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Trạng thái:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${log.status === "in" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {log.status === "in" ? "Đang ở trong bãi" : "Đã hoàn thành"}
              </span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Thời gian check-in:</span>
              <span className="font-semibold">
                {log.checkInTime
                  ? new Date(log.checkInTime).toLocaleString("vi-VN")
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between pb-2">
              <span className="text-muted-foreground">
                Thời gian check-out:
              </span>
              <span className="font-semibold">
                {log.checkOutTime
                  ? new Date(log.checkOutTime).toLocaleString("vi-VN")
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-indigo-500" /> Ảnh chụp nhận
              diện
            </CardTitle>
            <CardDescription>
              Ảnh được AI lưu lại khi quét thành công
            </CardDescription>
          </CardHeader>
          <CardContent>
            {log.imageUrl ? (
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={log.imageUrl}
                  alt="Ảnh chụp cổng"
                  className="w-full max-h-[500px] object-contain bg-slate-900"
                />
              </div>
            ) : (
              <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-12 text-center border-dashed border-2">
                <ImageIcon className="h-12 w-12 mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500">
                  Không có ảnh chụp nào được lưu cho nhật ký này.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
