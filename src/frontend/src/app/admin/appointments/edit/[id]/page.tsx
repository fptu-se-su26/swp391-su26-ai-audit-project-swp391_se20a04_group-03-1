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
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, use } from "react";
import JustValidate from "just-validate";
import Link from "next/link";
import { AsyncDriverSelect } from "@/components/AsyncDriverSelect";
import { useRouter } from "next/navigation";

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
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<{id: string, name: string} | null>(null);
  const [selectedDriverCompany, setSelectedDriverCompany] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  // Fetch data
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

        // Format date for input type="date"
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [resolvedParams.id]);

  // Setup validation
  useEffect(() => {
    if (loading || !formRef.current) return;

    // Them truong status vao
    const validator = new JustValidate(formRef.current, {
      errorFieldCssClass:
        "border-red-500 focus:ring-red-500 focus:border-red-500",
      errorLabelCssClass: "text-red-500 text-xs mt-1 block font-medium",
    });

    validatorRef.current = validator;

    validator
      .addField("#truckPlate", [
        { rule: "required", errorMessage: "Biển số xe là bắt buộc." },
        {
          rule: "customRegexp",
          value: /^([0-9]{2})([A-Z]{1})([0-9]{5})$/,
          errorMessage: "Định dạng biển số không đúng (VD: 15C12345).",
        },
      ])
      
      .addField("#containerNo", [
        { rule: "required", errorMessage: "Mã container là bắt buộc." },
        {
          rule: "customRegexp",
          value: /^[A-Z]{4}[0-9]{7}$/i,
          errorMessage: "Mã container không đúng chuẩn ISO 6346.",
        },
      ])
      .addField("#scheduledDate", [
        { rule: "required", errorMessage: "Ngày hẹn là bắt buộc." },
      ])
      .addField("#timeSlot", [
        { rule: "required", errorMessage: "Khung giờ là bắt buộc." },
      ])
      .addField("#status", [
        { rule: "required", errorMessage: "Trạng thái là bắt buộc." },
      ])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const driverIdStr = formData.get("driverId")?.toString().trim();
        if (!driverIdStr) {
            setError("Vui lòng chọn tài xế.");
            return;
        }
        const payload = {
          id: formData.get("id")?.toString(),
          truckPlate: formData
            .get("truckPlate")
            ?.toString()
            .trim()
            .toUpperCase(),
          driverId: formData.get("driverId")?.toString().trim(),
          containerNo: formData
            .get("containerNo")
            ?.toString()
            .trim()
            .toUpperCase(),
          scheduledDate: formData.get("scheduledDate")?.toString(),
          timeSlot: formData.get("timeSlot")?.toString(),
          status: formData.get("status")?.toString(),
        };

        try {
          setError(null);
          setSuccessMsg(null);
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

          setSuccessMsg("Cập nhật lịch hẹn thành công!");
          setTimeout(() => router.push("/admin/appointments"), 1500);
        } catch (err: any) {
          setError(err.message || "Không thể lưu lịch hẹn vào hệ thống.");
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
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
        <p>Đang tải thông tin lịch hẹn...</p>
      </div>
    );
  }

  if (!appointment && error) {
    return <div className="p-4 text-red-700 bg-red-50 rounded-lg">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/appointments">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chỉnh sửa lịch hẹn
          </h1>
          <p className="text-slate-600">
            Cập nhật thông tin cho lịch hẹn biển số {appointment.truckPlate}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200/50">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200/50">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <Card className="border border-slate-200 shadow-lg">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle>Thông tin chi tiết</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form ref={formRef} id="appointmentEditForm" className="space-y-6">
            <input type="hidden" name="id" value={appointment._id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="truckPlate">Biển số xe</Label>
                <Input
                  id="truckPlate"
                  name="truckPlate"
                  defaultValue={appointment.truckPlate}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="containerNo">Mã container</Label>
                <Input
                  id="containerNo"
                  name="containerNo"
                  defaultValue={appointment.containerNo}
                  className="uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driverId">Chọn tài xế</Label>
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
              <div className="space-y-2">
                <Label>Công ty</Label>
                <Input
                  readOnly
                  value={selectedDriverCompany}
                  placeholder="Sẽ tự động hiển thị khi chọn tài xế"
                  className="bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Ngày hẹn vào</Label>
                <Input
                  id="scheduledDate"
                  name="scheduledDate"
                  type="date"
                  defaultValue={appointment.scheduledDate}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeSlot">Khung giờ đỗ</Label>
                <select
                  id="timeSlot"
                  name="timeSlot"
                  defaultValue={appointment.timeSlot}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-slate-300"
                >
                  <option value="">-- Chọn khung giờ --</option>
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={appointment.status}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-slate-300"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="Pending">Chờ xử lý</option>
                  <option value="Confirmed">Đã xác nhận</option>
                  <option value="Cancelled">Đã hủy</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
              <Link href="/admin/appointments">
                <Button type="button" variant="outline">
                  Hủy bỏ
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
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
