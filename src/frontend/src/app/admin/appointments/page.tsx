"use client";

import { Button } from "@/components/ui/button";
import { AsyncDriverSelect } from "@/components/AsyncDriverSelect";
import { CustomSelect } from "@/components/CustomSelect";
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
  Plus,
  Trash2,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Pencil,
  Search,
  Filter,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import JustValidate from "just-validate";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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

interface Appointment {
  _id: string;
  appointmentId: string;
  truckPlate: string;
  driverId?: {
    _id: string;
    driverName: string;
    driverPhone: string;
    companyId?: { companyName: string };
  };
  containerNo: string;
  purpose: "Lấy container" | "Trả container";
  scheduledDate: string;
  timeSlot: string;
  status:
    | "Pending"
    | "Confirmed"
    | "CheckedIn"
    | "CheckedOut"
    | "Cancelled"
    | "Completed";
  createdAt: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [selectedDriver, setSelectedDriver] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedDriverCompany, setSelectedDriverCompany] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("");
  const ITEMS_PER_PAGE = 10;

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (statusFilter && statusFilter !== "ALL")
        params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data && data.code === "error") {
        throw new Error(data.message || "Lỗi từ máy chủ backend.");
      }

      const appointmentArray =
        data && data.data ? data.data : Array.isArray(data) ? data : [];
      setAppointments(appointmentArray);

      if (data && data.pagination) {
        setTotalPages(data.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải danh sách lịch hẹn.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, startDate, endDate, currentPage]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, startDate, endDate]);

  // JustValidate
  useEffect(() => {
    if (!showForm || !formRef.current) {
      setSelectedDriverId("");
      setSelectedDriver(null);
      setSelectedDriverCompany("");
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
      return;
    }

    const validator = new JustValidate(formRef.current, {
      errorFieldCssClass:
        "border-[#f3727f] focus:ring-[#f3727f] focus:border-[#f3727f]",
      errorLabelCssClass:
        "text-[#f3727f] text-[12px] font-bold uppercase tracking-wider mt-1 block",
    });

    validatorRef.current = validator;

    validator
      .addField("#truckPlate", [
        { rule: "required", errorMessage: "Bắt buộc." },
        {
          rule: "customRegexp",
          value: /^[0-9]{2}[A-Z][A-Z0-9]?[0-9]{4,5}$/,
          errorMessage: "Định dạng sai (VD: 15C12345, 29H112345).",
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
      .addField("#timeSlot", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .addField("#purpose", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const driverIdStr = formData.get("driverId")?.toString().trim();
        if (!driverIdStr) {
          toast.error("Vui lòng chọn tài xế.");
          return;
        }
        const payload = {
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
          purpose: selectedPurpose,
          scheduledDate: formData.get("scheduledDate")?.toString(),
          timeSlot: selectedTimeSlot,
        };

        const loadingToast = toast.loading("Đang đăng ký lịch hẹn...");
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/appointments/create`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );

          const result = await res.json();
          if (!res.ok || result.code === "error") {
            throw new Error(result.message || "Lỗi khi đăng ký lịch hẹn.");
          }

          toast.success("Đăng ký lịch hẹn thành công!", { id: loadingToast });
          setShowForm(false);
          fetchAppointments();
        } catch (err: any) {
          toast.error(err.message || "Không thể lưu lịch hẹn vào hệ thống.", {
            id: loadingToast,
          });
        }
      });

    return () => {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
    };
  }, [showForm, fetchAppointments, selectedTimeSlot, selectedPurpose]);

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const loadingToast = toast.loading("Đang cập nhật trạng thái...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/status/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
          credentials: "include",
        },
      );

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi cập nhật trạng thái.");
      }

      toast.success(
        `Đã cập nhật trạng thái lịch hẹn sang: ${newStatus === "Confirmed" ? "Đã duyệt" : "Đã hủy"}`,
        { id: loadingToast },
      );
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật trạng thái.", {
        id: loadingToast,
      });
    }
  };

  // Delete
  const handleDeleteAppointment = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa lịch hẹn...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/delete/${id}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi xóa lịch hẹn.");
      }

      toast.success("Xóa lịch hẹn thành công.", { id: loadingToast });
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa lịch hẹn.", {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Đặt lịch xe
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] mt-2 text-[16px]">
            Quản lý và xét duyệt yêu cầu xe container vào cảng thông minh
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/appointments/completed">
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#1ed760] dark:hover:border-[#1ed760] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <CheckCircle className="h-4 w-4 text-[#1ed760]" />
              Hoàn thành
            </Button>
          </Link>
          <Link href="/admin/appointments/trash">
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#f3727f] dark:hover:border-[#f3727f] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <Trash2 className="h-4 w-4 text-[#f3727f]" />
              Thùng rác
            </Button>
          </Link>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 gap-2 border-none transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Đăng ký
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-200 overflow-visible">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Đăng ký lịch hẹn mới
            </CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
              Vui lòng nhập thông tin chính xác. Mã container chuẩn ISO 6346.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form ref={formRef} id="appointmentForm" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="truckPlate"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Biển số xe
                  </Label>
                  <Input
                    id="truckPlate"
                    name="truckPlate"
                    placeholder="VD: 15C12345"
                    className="uppercase bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="containerNo"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Mã container
                  </Label>
                  <Input
                    id="containerNo"
                    name="containerNo"
                    placeholder="VD: MSCU1234567"
                    className="uppercase bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="driverId"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Tài xế (Tìm kiếm)
                  </Label>
                  <div className="bg-[#f8f8f8] dark:bg-[#121212] rounded-[8px]">
                    <AsyncDriverSelect
                      value={selectedDriverId}
                      onChange={(id, name) => {
                        setSelectedDriverId(id);
                        setSelectedDriver({ id, name });
                      }}
                      onCompanyChange={setSelectedDriverCompany}
                      selectedDriver={selectedDriver}
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Công ty vận tải
                  </Label>
                  <Input
                    readOnly
                    value={selectedDriverCompany}
                    placeholder="Tự động điền theo tài xế"
                    className="bg-[#eeeeee] dark:bg-[#1f1f1f] border-none text-[#666666] dark:text-[#999999] cursor-not-allowed font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="scheduledDate"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Ngày hẹn
                  </Label>
                  <Input
                    id="scheduledDate"
                    name="scheduledDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    onClick={(e) => (e.target as any).showPicker?.()}
                    className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] dark:[color-scheme:dark] cursor-pointer"
                  />
                </div>
                <div className="space-y-3 relative">
                  <Label
                    htmlFor="timeSlot"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Khung giờ
                  </Label>
                  <div className="relative">
                    <CustomSelect
                      id="timeSlot"
                      name="timeSlot"
                      value={selectedTimeSlot}
                      onChange={setSelectedTimeSlot}
                      options={TIME_SLOTS.map((slot) => ({
                        value: slot,
                        label: slot,
                      }))}
                      placeholder="-- Chọn --"
                    />
                  </div>
                </div>
                <div className="space-y-3 relative md:col-span-2">
                  <Label
                    htmlFor="purpose"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Mục đích
                  </Label>
                  <div className="relative w-1/2">
                    <CustomSelect
                      id="purpose"
                      name="purpose"
                      value={selectedPurpose}
                      onChange={setSelectedPurpose}
                      options={[
                        { value: "Lấy container", label: "Lấy container" },
                        { value: "Trả container", label: "Trả container" },
                      ]}
                      placeholder="-- Chọn mục đích --"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 justify-end pt-8">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] rounded-[500px] font-bold uppercase tracking-wider px-8"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] px-8 rounded-[500px]"
                >
                  Đăng ký
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
                Danh sách đăng ký
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <Input
                  placeholder="Tìm biển số, container..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px]"
                />
              </div>
              <div className="relative z-10 w-[200px]">
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "ALL", label: "Mọi trạng thái" },
                    { value: "Pending", label: "Chờ duyệt" },
                    { value: "Confirmed", label: "Đã duyệt" },
                    { value: "Cancelled", label: "Đã hủy" },
                  ]}
                  placeholder="Mọi trạng thái"
                />
              </div>

              <div className="flex items-center gap-2 bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[500px] h-10 px-4 hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors focus-within:border-[#1ed760] focus-within:ring-1 focus-within:ring-[#1ed760]">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="bg-transparent text-[14px] font-bold text-[#121212] dark:text-[#ffffff] focus:outline-none dark:[color-scheme:dark] cursor-pointer"
                />
                <span className="text-[#999999]">-</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  onClick={(e) => (e.target as any).showPicker?.()}
                  className="bg-transparent text-[14px] font-bold text-[#121212] dark:text-[#ffffff] focus:outline-none dark:[color-scheme:dark] cursor-pointer"
                />
              </div>

              <Button
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                  setStatusFilter("ALL");
                  setStartDate("");
                  setEndDate("");
                }}
                disabled={
                  !searchQuery &&
                  statusFilter === "ALL" &&
                  !startDate &&
                  !endDate
                }
                className="bg-[#eeeeee] hover:bg-[#e5e5e5] dark:bg-[#272727] dark:hover:bg-[#333333] text-[#121212] dark:text-[#ffffff] rounded-[500px] font-bold h-10 px-4 uppercase tracking-wider text-[12px] border-none"
              >
                Xóa lọc
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-[#1ed760] mb-4" />
              <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4" />
              <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px]">
                {searchQuery
                  ? "Không có lịch hẹn khớp bộ lọc."
                  : "Hệ thống chưa có lịch hẹn nào."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                  <tr>
                    <th className="px-6 py-4 font-black">Biển số</th>
                    <th className="px-6 py-4 font-black">Container / Mục đích</th>
                    <th className="px-6 py-4 font-black">Tài xế / SĐT</th>
                    <th className="px-6 py-4 font-black">Ngày hẹn & Giờ</th>
                    <th className="px-6 py-4 font-black">Trạng thái</th>
                    <th className="px-6 py-4 font-black text-right">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                  {appointments.map((apt) => (
                    <tr
                      key={apt._id}
                      className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <span className="font-black text-[16px] text-[#121212] dark:text-[#ffffff] bg-[#eeeeee] dark:bg-[#272727] px-3 py-1 rounded-[4px]">
                          {apt.truckPlate}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-mono font-bold text-[#121212] dark:text-[#ffffff] text-[14px]">
                          {apt.containerNo}
                        </p>
                        <p className={`text-[11px] font-black uppercase tracking-wider inline-block px-2 py-0.5 rounded-[4px] mt-1 ${
                          apt.purpose === "Lấy container"
                            ? "bg-[#00D4FF]/10 text-[#00D4FF]"
                            : "bg-[#f59e0b]/10 text-[#f59e0b]"
                        }`}>
                          {apt.purpose}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#121212] dark:text-[#ffffff]">
                          {apt.driverId?.driverName || "Chưa xác định"}
                        </p>
                        <p className="text-[#666666] dark:text-[#b3b3b3] font-mono text-[12px] mt-1">
                          {apt.driverId?.driverPhone || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#121212] dark:text-[#ffffff]">
                          {apt.scheduledDate
                            ? new Date(apt.scheduledDate).toLocaleDateString(
                                "vi-VN",
                              )
                            : "-"}
                        </p>
                        <p className="text-[12px] font-black text-[#1ed760] mt-1 bg-[#1ed760]/10 inline-block px-2 py-0.5 rounded-[4px] tracking-wider">
                          {apt.timeSlot}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider ${
                            apt.status === "Confirmed"
                              ? "bg-[#1ed760]/10 text-[#1db954]"
                              : apt.status === "CheckedIn"
                                ? "bg-[#00D4FF]/10 text-[#00D4FF]"
                                : apt.status === "CheckedOut"
                                  ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                                  : apt.status === "Completed"
                                    ? "bg-[#b3b3b3]/10 text-[#ffffff]"
                                    : apt.status === "Cancelled"
                                      ? "bg-[#f3727f]/10 text-[#f3727f]"
                                      : "bg-[#ffa42b]/10 text-[#ffa42b]"
                          }`}
                        >
                          {apt.status === "Confirmed"
                            ? "Đã Duyệt"
                            : apt.status === "CheckedIn"
                              ? "Vào Cảng"
                              : apt.status === "CheckedOut"
                                ? "Ra Cảng"
                                : apt.status === "Completed"
                                  ? "Hoàn Thành"
                                  : apt.status === "Cancelled"
                                    ? "Đã Hủy"
                                    : "Chờ Duyệt"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {apt.status === "Pending" && (
                            <Button
                              onClick={() =>
                                handleUpdateStatus(apt._id, "Confirmed")
                              }
                              className="bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors"
                            >
                              Duyệt
                            </Button>
                          )}
                          {apt.status !== "Cancelled" &&
                            apt.status !== "CheckedOut" &&
                            apt.status !== "Completed" && (
                              <Button
                                onClick={() =>
                                  handleUpdateStatus(apt._id, "Cancelled")
                                }
                                className="bg-[#f3727f]/10 hover:bg-[#f3727f] text-[#f3727f] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors"
                              >
                                Hủy
                              </Button>
                            )}
                          <Link href={`/admin/appointments/edit/${apt._id}`}>
                            <Button className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#1ed760] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors">
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </Link>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#f3727f] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase">
                                  Xóa Lịch Hẹn
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
                                  Xe{" "}
                                  <span className="text-[#1ed760]">
                                    {apt.truckPlate}
                                  </span>{" "}
                                  sẽ bị đưa vào thùng rác. Hành động này không
                                  thể hoàn tác trực tiếp ở đây.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-6 gap-3">
                                <AlertDialogCancel className="bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6">
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteAppointment(apt._id)
                                  }
                                  className="bg-[#f3727f] hover:bg-[#e05b68] text-[#121212] rounded-[500px] font-black uppercase tracking-wider px-6 border-none"
                                >
                                  Xác nhận Xóa
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && appointments.length > 0 && (
            <div className="py-6 border-t border-[#e5e5e5] dark:border-[#272727] bg-[#f8f8f8] dark:bg-[#121212] flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={`cursor-pointer rounded-[500px] font-bold ${currentPage === 1 ? "opacity-50 pointer-events-none" : "hover:bg-[#e5e5e5] dark:hover:bg-[#272727]"}`}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className={`cursor-pointer rounded-[500px] font-black ${currentPage === i + 1 ? "bg-[#1ed760] text-[#121212] border-[#1ed760]" : "hover:bg-[#e5e5e5] dark:hover:bg-[#272727]"}`}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={`cursor-pointer rounded-[500px] font-bold ${currentPage === totalPages ? "opacity-50 pointer-events-none" : "hover:bg-[#e5e5e5] dark:hover:bg-[#272727]"}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
