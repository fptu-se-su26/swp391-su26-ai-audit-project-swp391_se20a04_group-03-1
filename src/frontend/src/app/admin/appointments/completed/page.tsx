"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Trash2,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  Search,
  ArrowLeft,
  RefreshCcw,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import toast from "react-hot-toast";

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
  scheduledDate: string;
  timeSlot: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Completed" | "CheckedOut";
  createdAt: string;
}

export default function CompletedAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("Completed");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
        `${process.env.NEXT_PUBLIC_API_URL}/appointments?${params.toString()}`,
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
      toast.error(err.message || "Đã xảy ra lỗi khi tải danh sách.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, startDate, endDate, currentPage]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, startDate, endDate]);

  const handleDelete = async (id: string) => {
    const loadingToast = toast.loading("Đang chuyển vào thùng rác...");
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
        throw new Error(result.message || "Lỗi khi xóa.");
      }

      toast.success("Đã chuyển vào thùng rác thành công.", { id: loadingToast });
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa.", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#1ed760] tracking-tight uppercase">
            Lịch hẹn hoàn thành
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] mt-2 text-[16px]">
            Danh sách các lịch hẹn đã hoàn tất xử lý tại cổng
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

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden border-t-4 border-t-[#1ed760]">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-3">Danh sách hoàn tất</CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <Input
                  placeholder="Tìm biển số, container..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] rounded-[500px] h-10 px-4 hover:border-[#00754A] dark:hover:border-[#00754A] transition-colors focus-within:border-[#00754A] dark:focus-within:border-[#00754A]">
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
                  setStartDate("");
                  setEndDate("");
                }}
                disabled={!searchQuery && !startDate && !endDate}
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
              <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">Đang tải dữ liệu...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4" />
              <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px]">
                {searchQuery || startDate || endDate
                  ? "Không có lịch hẹn hoàn tất nào khớp bộ lọc."
                  : "Chưa có lịch hẹn nào hoàn tất."}
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
                    <th className="px-6 py-4 font-black">Ngày hẹn</th>
                    <th className="px-6 py-4 font-black">Trạng thái</th>
                    <th className="px-6 py-4 font-black text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                  {appointments.map((apt) => (
                    <tr key={apt._id} className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-black text-[16px] text-[#121212] dark:text-[#ffffff] bg-[#eeeeee] dark:bg-[#272727] px-3 py-1 rounded-[4px]">{apt.truckPlate}</span>
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
                        <p className="font-bold text-[#121212] dark:text-[#ffffff]">{apt.driverId?.driverName || "Chưa xác định"}</p>
                        <p className="text-[#666666] dark:text-[#b3b3b3] font-mono text-[12px] mt-1">{apt.driverId?.driverPhone || "-"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#121212] dark:text-[#ffffff]">
                          {apt.scheduledDate ? new Date(apt.scheduledDate).toLocaleDateString("vi-VN") : "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider bg-[#b3b3b3]/10 text-[#666666] dark:text-[#b3b3b3]">
                          {apt.status === "Completed" ? "Hoàn Thành" : "Đã Ra Cảng"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="bg-[#f8f8f8] dark:bg-[#272727] hover:bg-[#f3727f] hover:text-[#121212] text-[#f3727f] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors">
                                <Trash2 className="h-3 w-3 mr-2" /> Xóa
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase">Xóa lịch hẹn?</AlertDialogTitle>
                                <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
                                  Lịch hẹn <span className="text-[#1ed760]">{apt.truckPlate}</span> sẽ được chuyển vào thùng rác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-6 gap-3">
                                <AlertDialogCancel className="bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6">Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(apt._id)}
                                  className="bg-[#f3727f] hover:bg-[#e05b68] text-[#121212] rounded-[500px] font-black uppercase tracking-wider px-6 border-none"
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
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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
