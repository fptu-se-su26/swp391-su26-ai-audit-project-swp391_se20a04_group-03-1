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
  driverName: string;
  driverPhone: string;
  containerNo: string;
  scheduledDate: string;
  timeSlot: string;
  status: "Pending" | "Confirmed" | "CheckedIn" | "CheckedOut" | "Cancelled";
  createdAt: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  // Debounce logic cho ô tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Tải danh sách lịch hẹn từ backend
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();

      // Nếu backend trả về code: "error"
      if (data && data.code === "error") {
        throw new Error(data.message || "Lỗi từ máy chủ backend.");
      }

      // Lấy mảng dữ liệu từ trường data hoặc trực tiếp
      const appointmentArray =
        data && data.data ? data.data : Array.isArray(data) ? data : [];
      setAppointments(appointmentArray);
      
      // Lấy thông tin phân trang từ backend
      if (data && data.pagination) {
        setTotalPages(data.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách lịch hẹn.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, startDate, endDate, currentPage]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Đặt lại trang 1 khi thay đổi bộ lọc
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, startDate, endDate]);

  // Khởi tạo JustValidate khi Form được mở
  useEffect(() => {
    if (!showForm || !formRef.current) {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
      return;
    }

    const validator = new JustValidate(formRef.current, {
      errorFieldCssClass:
        "border-red-500 focus:ring-red-500 focus:border-red-500",
      errorLabelCssClass: "text-red-500 text-xs mt-1 block font-medium",
    });

    validatorRef.current = validator;

    validator
      .addField("#truckPlate", [
        {
          rule: "required",
          errorMessage: "Biển số xe là bắt buộc.",
        },
        {
          rule: "customRegexp",
          //regex value phải đúng định dạng 15C12345
          value: /^([0-9]{2})([A-Z]{1})([0-9]{5})$/,
          errorMessage: "Định dạng biển số không đúng (VD: 15C12345).",
        },
      ])
      .addField("#driverName", [
        {
          rule: "required",
          errorMessage: "Tên tài xế là bắt buộc.",
        },
        {
          rule: "minLength",
          value: 3,
          errorMessage: "Tên tài xế phải từ 3 ký tự trở lên.",
        },
      ])
      .addField("#driverPhone", [
        {
          rule: "required",
          errorMessage: "Số điện thoại tài xế là bắt buộc.",
        },
        {
          rule: "customRegexp",
          value: /^(0[3|5|7|8|9])[0-9]{8}$/,
          errorMessage: "Số điện thoại không đúng định dạng Việt Nam.",
        },
      ])
      .addField("#containerNo", [
        {
          rule: "required",
          errorMessage: "Mã container là bắt buộc.",
        },
        {
          rule: "customRegexp",
          value: /^[A-Z]{4}[0-9]{7}$/i,
          errorMessage:
            "Mã container không đúng chuẩn ISO 6346 (VD: MSCU1234567).",
        },
      ])
      .addField("#scheduledDate", [
        {
          rule: "required",
          errorMessage: "Ngày hẹn là bắt buộc.",
        },
      ])
      .addField("#timeSlot", [
        {
          rule: "required",
          errorMessage: "Khung giờ là bắt buộc.",
        },
      ])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const payload = {
          truckPlate: formData
            .get("truckPlate")
            ?.toString()
            .trim()
            .toUpperCase(),
          driverName: formData.get("driverName")?.toString().trim(),
          driverPhone: formData.get("driverPhone")?.toString().trim(),
          containerNo: formData
            .get("containerNo")
            ?.toString()
            .trim()
            .toUpperCase(),
          scheduledDate: formData.get("scheduledDate")?.toString(),
          timeSlot: formData.get("timeSlot")?.toString(),
        };

        try {
          setError(null);
          setSuccessMsg(null);
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/appointments/create`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );

          const result = await res.json();
          if (!res.ok || result.code === "error") {
            throw new Error(result.message || "Lỗi khi đăng ký lịch hẹn.");
          }

          setSuccessMsg("Đăng ký lịch hẹn thành công!");
          setShowForm(false);
          fetchAppointments();
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
  }, [showForm]);

  // Cập nhật trạng thái duyệt / hủy lịch hẹn
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/appointments/status/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
          credentials: "include",
        },
      );

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi cập nhật trạng thái.");
      }

      setSuccessMsg(
        `Đã cập nhật trạng thái lịch hẹn sang: ${newStatus === "Confirmed" ? "Đã duyệt" : "Đã hủy"}`,
      );
      fetchAppointments();
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật trạng thái.");
    }
  };

  // Xóa lịch hẹn
  const handleDeleteAppointment = async (id: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
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

      setSuccessMsg("Xóa lịch hẹn thành công.");
      fetchAppointments();
    } catch (err: any) {
      setError(err.message || "Không thể xóa lịch hẹn.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Đặt lịch xe
          </h1>
          <p className="text-slate-600">
            Quản lý và đặt lịch hẹn xe container vào cảng thông minh
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/appointments/completed">
            <Button variant="outline" className="gap-2 border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors">
              <CheckCircle className="h-4 w-4" />
              Đã hoàn thành
            </Button>
          </Link>
          <Link href="/admin/appointments/trash">
            <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors">
              <Trash2 className="h-4 w-4" />
              Thùng rác
            </Button>
          </Link>
          <Button
            onClick={() => {
              setShowForm(!showForm);
              setError(null);
              setSuccessMsg(null);
            }}
            className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Đăng ký lịch hẹn
          </Button>
        </div>
      </div>

      {/* Thông báo Alert */}
      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-900/10 dark:text-red-400 border border-red-200/50">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-4 text-sm text-green-700 bg-green-50 rounded-lg dark:bg-green-900/10 dark:text-green-400 border border-green-200/50">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form Tạo Lịch Hẹn */}
      {showForm && (
        <Card className="border border-slate-200 dark:border-slate-800 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80">
            <CardTitle>Đăng ký lịch hẹn mới</CardTitle>
            <CardDescription>
              Nhập đầy đủ thông tin phương tiện. JustValidate sẽ tự động kiểm
              tra định dạng dữ liệu.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form ref={formRef} id="appointmentForm" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="truckPlate">Biển số xe</Label>
                  <Input
                    id="truckPlate"
                    name="truckPlate"
                    placeholder="Ví dụ: 15C-12345"
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="containerNo">Mã container</Label>
                  <Input
                    id="containerNo"
                    name="containerNo"
                    placeholder="Ví dụ: MSCU1234567"
                    className="uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverName">Tên tài xế</Label>
                  <Input
                    id="driverName"
                    name="driverName"
                    placeholder="Tên đầy đủ của tài xế"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driverPhone">Số điện thoại</Label>
                  <Input
                    id="driverPhone"
                    name="driverPhone"
                    placeholder="Ví dụ: 0987654321"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Ngày hẹn vào</Label>
                  <Input
                    id="scheduledDate"
                    name="scheduledDate"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeSlot">Khung giờ đỗ</Label>
                  <select
                    id="timeSlot"
                    name="timeSlot"
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                  >
                    <option value="">-- Chọn khung giờ --</option>
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800/80 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Hủy bỏ
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Đăng ký lịch
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Bảng Dữ Liệu Lịch Hẹn */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-md">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <CardTitle>Danh sách lịch hẹn xe</CardTitle>
              <CardDescription>
                Tất cả danh sách đặt chỗ vào cảng đang hoạt động.
              </CardDescription>
            </div>
          </div>

          {/* Vùng Tìm kiếm và Lọc */}
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm biển số, tài xế, container..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white dark:bg-slate-950 w-full"
              />
            </div>
            <div className="flex w-full md:w-auto items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full md:w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:focus-visible:ring-slate-300"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Confirmed">Đã duyệt</option>
                <option value="CheckedIn">Đã vào cảng</option>
                <option value="CheckedOut">Đã ra cảng</option>
                <option value="Cancelled">Đã hủy</option>
              </select>

              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950"
                  title="Từ ngày"
                />
                <span className="text-slate-500">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950"
                  title="Đến ngày"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                  setStatusFilter("ALL");
                  setStartDate("");
                  setEndDate("");
                }}
                disabled={!searchQuery && statusFilter === "ALL" && !startDate && !endDate}
                className="whitespace-nowrap"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p>Đang tải danh sách lịch hẹn...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Calendar className="h-12 w-12 mx-auto text-slate-300 mb-2" />
              <p>
                {searchQuery
                  ? "Không tìm thấy lịch hẹn nào phù hợp."
                  : "Chưa có lịch hẹn nào được đăng ký."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-slate-50/70 dark:bg-slate-900/30 text-slate-500">
                    <th className="text-left py-3 px-4 font-medium">
                      Biển số xe
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Mã Container
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Tài xế</th>
                    <th className="text-left py-3 px-4 font-medium">
                      Số điện thoại
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Ngày hẹn
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Khung giờ
                    </th>
                    <th className="text-left py-3 px-4 font-medium">
                      Trạng thái
                    </th>
                    <th className="text-right py-3 px-4 font-medium">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((apt) => (
                    <tr
                      key={apt._id}
                      className="border-b hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-4 px-4 font-medium text-slate-900 dark:text-slate-100">
                        {apt.truckPlate}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">
                        {apt.containerNo}
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        {apt.driverName}
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-mono text-xs">
                        {apt.driverPhone}
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        {apt.scheduledDate
                          ? new Date(apt.scheduledDate).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                              },
                            )
                          : "-"}
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {apt.timeSlot}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            apt.status === "Confirmed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : apt.status === "CheckedIn"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                                : apt.status === "CheckedOut"
                                  ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                                  : apt.status === "Cancelled"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }`}
                        >
                          {apt.status === "Confirmed"
                            ? "Đã duyệt"
                            : apt.status === "CheckedIn"
                              ? "Đã vào"
                              : apt.status === "CheckedOut"
                                ? "Đã ra"
                                : apt.status === "Cancelled"
                                  ? "Đã hủy"
                                  : "Chờ duyệt"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {apt.status === "Pending" && (
                            <Button
                              onClick={() =>
                                handleUpdateStatus(apt._id, "Confirmed")
                              }
                              variant="outline"
                              size="sm"
                              className="text-xs text-green-600 hover:bg-green-50 border-green-200/50"
                            >
                              Duyệt
                            </Button>
                          )}
                          {apt.status !== "Cancelled" &&
                            apt.status !== "CheckedOut" && (
                              <Button
                                onClick={() =>
                                  handleUpdateStatus(apt._id, "Cancelled")
                                }
                                variant="outline"
                                size="sm"
                                className="text-xs text-red-600 hover:bg-red-50 border-red-200/50"
                              >
                                Hủy lịch
                              </Button>
                            )}
                          <Link href={`/admin/appointments/edit/${apt._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                                title="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Xác nhận xóa lịch hẹn?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Hành động này không thể hoàn tác. Lịch hẹn của
                                  xe{" "}
                                  <span className="font-semibold">
                                    {apt.truckPlate}
                                  </span>{" "}
                                  sẽ bị xóa vĩnh viễn.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteAppointment(apt._id)
                                  }
                                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                >
                                  Xác nhận xóa
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
            <div className="py-4 border-t border-slate-100 dark:border-slate-800">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
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
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
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
