"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, use } from "react";
import JustValidate from "just-validate";
import Link from "next/link";
import { AsyncDriverSelect } from "@/components/AsyncDriverSelect";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const TIME_SLOTS = [
  "05:00-06:00",
  "06:00-07:00",
  "07:00-08:00",
  "08:00-09:00",
  "09:00-10:00",
  "10:00-11:00",
  "11:00-12:00",
  "12:00-13:00",
  "13:00-14:00",
  "14:00-15:00",
  "15:00-16:00",
  "16:00-17:00",
  "17:00-18:00",
  "18:00-19:00",
  "19:00-20:00",
  "20:00-21:00",
  "21:00-22:00",
  "22:00-23:00",
  "23:00-00:00",
];

export default function EditAppointmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<{id: string, name: string} | null>(null);
  const [selectedDriverCompany, setSelectedDriverCompany] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/appointments/detail/${resolvedParams.id}`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("Không thể tải thông tin lịch hẹn");
        const result = await res.json();
        if (result.code === "error") throw new Error(result.message);

        if (result.data.scheduledDate) {
          result.data.scheduledDate = new Date(result.data.scheduledDate)
            .toISOString()
            .split("T")[0];
        }
        setAppointment(result.data);
        if (result.data.driverId) {
            setSelectedDriverId(result.data.driverId._id || "");
            setSelectedDriver({
                id: result.data.driverId._id || "", 
                name: `[${result.data.driverId.driverId}] ${result.data.driverId.driverName} - ${result.data.driverId.driverPhone || ''}`
            });
            if (result.data.driverId.companyId) {
                setSelectedDriverCompany(result.data.driverId.companyId.companyName);
            } else {
                setSelectedDriverCompany("Không thuộc công ty nào");
            }
        }
      } catch (err: any) {
        toast.error(err.message || "Lỗi khi tải thông tin lịch hẹn.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [resolvedParams.id]);

  useEffect(() => {
    if (loading || !formRef.current) return;

    const validator = new JustValidate(formRef.current, {
      errorFieldCssClass: "border-[#f3727f] focus:ring-[#f3727f] focus:border-[#f3727f]",
      errorLabelCssClass: "text-[#f3727f] text-[12px] font-bold uppercase tracking-wider mt-1 block",
    });

    validatorRef.current = validator;

    validator
      .addField("#truckPlate", [
        { rule: "required", errorMessage: "Bắt buộc." },
        {
          rule: "customRegexp",
          value: /^([0-9]{2})([A-Z]{1})([0-9]{5})$/,
          errorMessage: "Định dạng sai (VD: 15C12345).",
        },
      ])
      .addField("#containerNo", [
        { rule: "required", errorMessage: "Bắt buộc." },
        {
          rule: "customRegexp",
          value: /^[A-Z]{4}[0-9]{7}$/i,
          errorMessage: "Sai chuẩn ISO (VD: MSCU1234567).",
        },
      ])
      .addField("#scheduledDate", [
        { rule: "required", errorMessage: "Bắt buộc." },
      ])
      .addField("#timeSlot", [
        { rule: "required", errorMessage: "Bắt buộc." },
      ])
      .addField("#status", [
        { rule: "required", errorMessage: "Bắt buộc." },
      ])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const driverIdStr = formData.get("driverId")?.toString().trim();
        if (!driverIdStr) {
            toast.error("Vui lòng chọn tài xế.");
            return;
        }
        const payload = {
          id: formData.get("id")?.toString(),
          truckPlate: formData.get("truckPlate")?.toString().trim().toUpperCase(),
          driverId: formData.get("driverId")?.toString().trim(),
          containerNo: formData.get("containerNo")?.toString().trim().toUpperCase(),
          scheduledDate: formData.get("scheduledDate")?.toString(),
          timeSlot: formData.get("timeSlot")?.toString(),
          status: formData.get("status")?.toString(),
        };

        const loadingToast = toast.loading("Đang cập nhật lịch hẹn...");
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/appointments/edit`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );

          const result = await res.json();
          if (!res.ok || result.code === "error") {
            throw new Error(result.message || "Lỗi khi cập nhật lịch hẹn.");
          }

          toast.success("Cập nhật lịch hẹn thành công!", { id: loadingToast });
          setTimeout(() => router.push("/admin/appointments"), 1000);
        } catch (err: any) {
          toast.error(err.message || "Không thể lưu lịch hẹn vào hệ thống.", { id: loadingToast });
        }
      });

    return () => {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
    };
  }, [loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#666666] dark:text-[#b3b3b3]">
        <Loader2 className="h-10 w-10 animate-spin text-[#1ed760] mb-4" />
        <p className="font-bold uppercase tracking-wider text-[12px]">Đang tải thông tin lịch hẹn...</p>
      </div>
    );
  }

  if (!appointment) {
    return null; // Error handled by toast
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Chỉnh sửa lịch hẹn
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] mt-2 text-[16px]">
            Cập nhật thông tin cho xe <span className="text-[#1ed760] font-bold">{appointment.truckPlate}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/appointments">
            <Button variant="outline" className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#121212] dark:hover:border-[#ffffff] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">Thông tin chi tiết</CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form ref={formRef} id="appointmentEditForm" className="space-y-6">
            <input type="hidden" name="id" value={appointment._id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="truckPlate" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">Biển số xe</Label>
                <Input
                  id="truckPlate"
                  name="truckPlate"
                  defaultValue={appointment.truckPlate}
                  className="uppercase bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="containerNo" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">Mã container</Label>
                <Input
                  id="containerNo"
                  name="containerNo"
                  defaultValue={appointment.containerNo}
                  className="uppercase bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="driverId" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">Tài xế (Tìm kiếm)</Label>
                <div className="bg-[#f8f8f8] dark:bg-[#121212] rounded-[8px]">
                  <AsyncDriverSelect 
                    value={selectedDriverId}
                    onChange={(id, name) => {
                        setSelectedDriverId(id);
                        setSelectedDriver({id, name});
                    }}
                    onCompanyChange={setSelectedDriverCompany}
                    selectedDriver={selectedDriver}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">Công ty</Label>
                <Input
                  readOnly
                  value={selectedDriverCompany}
                  placeholder="Sẽ tự động hiển thị khi chọn tài xế"
                  className="bg-[#eeeeee] dark:bg-[#1f1f1f] border-none text-[#666666] dark:text-[#999999] cursor-not-allowed font-bold h-12 px-4 rounded-[8px]"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="scheduledDate" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">Ngày hẹn</Label>
                <Input
                  id="scheduledDate"
                  name="scheduledDate"
                  type="date"
                  defaultValue={appointment.scheduledDate}
                  className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="timeSlot" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">Khung giờ</Label>
                <select
                  id="timeSlot"
                  name="timeSlot"
                  defaultValue={appointment.timeSlot}
                  className="w-full h-12 px-4 rounded-[8px] border border-[#e5e5e5] dark:border-[#272727] bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] font-bold focus:ring-[#1ed760] transition-colors appearance-none"
                >
                  <option value="">-- Chọn --</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="status" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">Trạng thái</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={appointment.status}
                  className="w-full h-12 px-4 rounded-[8px] border border-[#e5e5e5] dark:border-[#272727] bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] font-bold focus:ring-[#1ed760] transition-colors appearance-none"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="Pending">Chờ xử lý</option>
                  <option value="Confirmed">Đã xác nhận</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 justify-end pt-8">
              <Link href="/admin/appointments">
                <Button type="button" variant="outline" className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] rounded-[500px] font-bold uppercase tracking-wider px-8">
                  Hủy bỏ
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] px-8 rounded-[500px]"
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
