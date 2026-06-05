"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
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
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function GateLogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const id = resolvedParams.id;
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
      } else {
        throw new Error(data.message || "Không thể tải chi tiết nhật ký");
      }
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#ffffff] dark:bg-[#181818] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727]">
        <Loader2 className="h-10 w-10 animate-spin text-[#1ed760] mb-4" />
        <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">Đang tải chi tiết...</p>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#ffffff] dark:bg-[#181818] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727]">
        <p className="font-bold text-[#f3727f] uppercase tracking-wider text-[12px]">Không tìm thấy nhật ký</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => router.back()}
          className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-full"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
            Chi tiết nhật ký cổng
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1 uppercase tracking-wider text-[12px]">
            ID: {log._id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-2">
              <Car className="h-5 w-5 text-[#3b82f6]" /> Thông tin xe
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#e5e5e5] dark:border-[#272727] pb-4">
              <span className="text-[#666666] dark:text-[#999999] font-bold text-[12px] uppercase tracking-wider">Biển số xe</span>
              <span className="font-black text-[18px] text-[#121212] dark:text-[#ffffff] bg-[#f8f8f8] dark:bg-[#272727] px-3 py-1 rounded-[4px]">{log.actualTruckPlate}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#e5e5e5] dark:border-[#272727] pb-4">
              <span className="text-[#666666] dark:text-[#999999] font-bold text-[12px] uppercase tracking-wider flex items-center gap-1">
                <Box className="h-3.5 w-3.5" /> Container
              </span>
              <span className="font-bold text-[#121212] dark:text-[#ffffff]">
                {log.actualContainerNo || "Không có"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#e5e5e5] dark:border-[#272727] pb-4">
              <span className="text-[#666666] dark:text-[#999999] font-bold text-[12px] uppercase tracking-wider flex items-center gap-1">
                <User className="h-3.5 w-3.5" /> Tài xế
              </span>
              <span className="font-bold text-[#121212] dark:text-[#ffffff]">
                {log.appointmentId?.driverId?.driverName || "Không xác định"}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-[#666666] dark:text-[#999999] font-bold text-[12px] uppercase tracking-wider">Độ tin cậy OCR</span>
              <span className="font-black text-[#1db954]">
                {(log.ocrConfidence * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-2">
              <Clock className="h-5 w-5 text-[#f59e0b]" /> Trạng thái & Thời gian
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#e5e5e5] dark:border-[#272727] pb-4">
              <span className="text-[#666666] dark:text-[#999999] font-bold text-[12px] uppercase tracking-wider">Trạng thái</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[10px] font-black uppercase tracking-wider border ${log.status === "in" ? "bg-[#1ed760]/10 text-[#1db954] border-[#1ed760]/20" : "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20"}`}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {log.status === "in" ? "Đang ở trong bãi" : "Đã hoàn thành"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-[#e5e5e5] dark:border-[#272727] pb-4">
              <span className="text-[#666666] dark:text-[#999999] font-bold text-[12px] uppercase tracking-wider">Check-in</span>
              <span className="font-bold text-[#121212] dark:text-[#ffffff]">
                {log.checkInTime
                  ? new Date(log.checkInTime).toLocaleString("vi-VN")
                  : "-"}
              </span>
            </div>
            <div className="flex justify-between items-center pb-2">
              <span className="text-[#666666] dark:text-[#999999] font-bold text-[12px] uppercase tracking-wider">Check-out</span>
              <span className="font-bold text-[#121212] dark:text-[#ffffff]">
                {log.checkOutTime
                  ? new Date(log.checkOutTime).toLocaleString("vi-VN")
                  : "-"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-[#8b5cf6]" /> Ảnh chụp nhận diện
            </CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[12px] mt-1">
              Ảnh được AI lưu lại khi quét thành công
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {log.imageUrl ? (
              <div className="relative rounded-[8px] overflow-hidden border border-[#e5e5e5] dark:border-[#272727]">
                <img
                  src={log.imageUrl}
                  alt="Ảnh chụp cổng"
                  className="w-full max-h-[600px] object-contain bg-[#121212]"
                />
              </div>
            ) : (
              <div className="bg-[#f8f8f8] dark:bg-[#121212] rounded-[8px] p-16 text-center border-dashed border-2 border-[#e5e5e5] dark:border-[#272727]">
                <ImageIcon className="h-16 w-16 mx-auto text-[#e5e5e5] dark:text-[#272727] mb-4" />
                <p className="text-[#666666] dark:text-[#b3b3b3] font-bold">
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
