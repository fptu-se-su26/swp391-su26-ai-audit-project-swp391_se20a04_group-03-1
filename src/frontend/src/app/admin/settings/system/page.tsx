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
import {
  SlidersHorizontal,
  Loader2,
  Save,
  Info,
  AlertTriangle,
  CalendarClock,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Can } from "@/lib/permissions";

/**
 * Cấu hình tham số vận hành.
 *
 * Hiện có một tham số: sức chứa tối đa mỗi khung giờ — trước đây gõ cứng
 * `MAX_CAPACITY_PER_SLOT = 20` trong cả hai controller lịch hẹn (admin và
 * doanh nghiệp), muốn đổi phải sửa code rồi deploy lại.
 */

const API = process.env.NEXT_PUBLIC_API_URL;

interface SystemSettingData {
  maxCapacityPerSlot: number;
  updatedAt: string | null;
  updatedByName: string | null;
  limits: { min: number; max: number };
  defaults: { maxCapacityPerSlot: number };
  busiestSlot: { date: string; timeSlot: string; count: number } | null;
}

export default function SystemSettingPage() {
  const [data, setData] = useState<SystemSettingData | null>(null);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/settings/system`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        setData(json.data);
        setValue(String(json.data.maxCapacityPerSlot));
        setError(null);
      } else {
        setError(json.message || "Không thể tải cấu hình.");
      }
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const t = toast.loading("Đang lưu cấu hình...");
    try {
      const res = await fetch(`${API}/settings/system`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ maxCapacityPerSlot: Number(value) }),
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message || "Đã lưu cấu hình.", { id: t });
        load();
      } else {
        toast.error(json.message || "Không thể lưu cấu hình.", { id: t });
      }
    } catch {
      toast.error("Lỗi kết nối.", { id: t });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760] mb-4" />
        <p className="text-[#666666] font-bold uppercase tracking-wider text-[12px]">
          Đang tải cấu hình...
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="h-10 w-10 text-[#f3727f]" />
        <p className="text-[#121212] dark:text-[#ffffff] font-bold">{error}</p>
        <Button
          onClick={load}
          className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-wider px-6"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const numeric = Number(value);
  const changed = numeric !== data.maxCapacityPerSlot;
  const outOfRange =
    !Number.isInteger(numeric) ||
    numeric < data.limits.min ||
    numeric > data.limits.max;
  // Hạ hạn mức xuống dưới mức thực tế đã từng phục vụ sẽ chặn những lịch hẹn mà
  // cảng vốn vẫn xử lý được — cảnh báo trước khi lưu.
  const belowBusiest =
    data.busiestSlot !== null &&
    Number.isFinite(numeric) &&
    numeric < data.busiestSlot.count;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-2 text-[12px] font-black uppercase tracking-wider text-[#666666] dark:text-[#b3b3b3] hover:text-[#121212] dark:hover:text-[#ffffff] transition-colors mb-3"
        >
          <ArrowLeft className="h-4 w-4" /> Cài đặt hệ thống
        </Link>
        <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
          Cấu hình vận hành
        </h1>
        <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
          Các tham số điều tiết luồng đặt lịch và ra vào cảng.
        </p>
      </div>

      <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-[#1ed760]/10 rounded-[500px] flex items-center justify-center shrink-0">
              <SlidersHorizontal className="h-6 w-6 text-[#1db954]" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
                Sức chứa mỗi khung giờ
              </CardTitle>
              <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[12px] uppercase tracking-[1px] mt-1">
                Số lịch hẹn tối đa được duyệt cho một khung giờ trong một ngày
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={save} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <Label
                  htmlFor="maxCapacity"
                  className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                >
                  Số xe tối đa / khung giờ
                </Label>
                <Input
                  id="maxCapacity"
                  type="number"
                  inputMode="numeric"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  min={data.limits.min}
                  max={data.limits.max}
                  step={1}
                  className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-black text-[20px] h-14 px-4 rounded-[8px] focus-visible:ring-1 focus-visible:ring-[#1ed760] transition-all"
                />
                <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3]">
                  Cho phép từ {data.limits.min} đến {data.limits.max}. Mặc định
                  ban đầu: {data.defaults.maxCapacityPerSlot}.
                </p>
              </div>

              <div className="space-y-3 pt-1">
                {data.busiestSlot ? (
                  <div className="flex items-start gap-3 p-4 rounded-[12px] bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727]">
                    <CalendarClock className="h-4 w-4 text-[#666666] dark:text-[#b3b3b3] shrink-0 mt-0.5" />
                    <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3]">
                      Khung giờ đông nhất 30 ngày qua:{" "}
                      <span className="text-[#121212] dark:text-[#ffffff]">
                        {data.busiestSlot.count} xe
                      </span>{" "}
                      lúc {data.busiestSlot.timeSlot} ngày{" "}
                      {new Date(data.busiestSlot.date).toLocaleDateString("vi-VN")}.
                    </p>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-[12px] bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727]">
                    <CalendarClock className="h-4 w-4 text-[#666666] dark:text-[#b3b3b3] shrink-0 mt-0.5" />
                    <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3]">
                      Chưa có lịch hẹn nào trong 30 ngày qua để làm mốc tham chiếu.
                    </p>
                  </div>
                )}

                {(data.updatedAt || data.updatedByName) && (
                  <p className="text-[12px] font-bold text-[#999999] dark:text-[#666666]">
                    Sửa lần cuối
                    {data.updatedByName ? ` bởi ${data.updatedByName}` : ""}
                    {data.updatedAt
                      ? ` — ${new Date(data.updatedAt).toLocaleString("vi-VN")}`
                      : ""}
                  </p>
                )}
              </div>
            </div>

            {belowBusiest && (
              <div className="flex items-start gap-3 p-4 rounded-[12px] bg-[#f59e0b]/10 border border-[#f59e0b]/30">
                <AlertTriangle className="h-4 w-4 text-[#f59e0b] shrink-0 mt-0.5" />
                <p className="text-[13px] font-bold text-[#121212] dark:text-[#ffffff]">
                  Giá trị này thấp hơn lượng xe cảng đã từng phục vụ trong một
                  khung giờ ({data.busiestSlot?.count} xe). Đặt như vậy sẽ chặn
                  bớt lịch hẹn mà thực tế vẫn xử lý được.
                </p>
              </div>
            )}

            <div className="flex items-start gap-3 p-4 rounded-[12px] bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727]">
              <Info className="h-4 w-4 text-[#666666] dark:text-[#b3b3b3] shrink-0 mt-0.5" />
              <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3]">
                Hạn mức áp dụng ngay cho các lượt đặt lịch tiếp theo, ở cả trang
                admin lẫn cổng doanh nghiệp. Lịch hẹn đã tạo trước đó không bị
                ảnh hưởng — hạ hạn mức không xóa lịch hẹn đang có.
              </p>
            </div>

            <Can resource="settings.system" action="update">
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={saving || !changed || outOfRange}
                  className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-8 h-12 gap-2 border-none shadow-lg shadow-[#1ed760]/20 disabled:opacity-40 disabled:shadow-none"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Lưu cấu hình
                </Button>
              </div>
            </Can>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
