"use client";

import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from"@/components/ui/card";
import {
 Trash2,
 Calendar,
 Loader2,
 AlertCircle,
 CheckCircle,
 Search,
 ArrowLeft,
 RefreshCcw,
} from"lucide-react";
import { useState, useEffect, useCallback } from"react";
import Link from"next/link";
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
} from"@/components/ui/alert-dialog";
import {
 Pagination,
 PaginationContent,
 PaginationItem,
 PaginationLink,
 PaginationNext,
 PaginationPrevious,
} from"@/components/ui/pagination";

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
 status:"Pending" |"Confirmed" |"CheckedIn" |"CheckedOut" |"Cancelled";
 createdAt: string;
}

export default function CompletedAppointmentsPage() {
 const [appointments, setAppointments] = useState<Appointment[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [successMsg, setSuccessMsg] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
 const [statusFilter, setStatusFilter] = useState("Completed");
 const [startDate, setStartDate] = useState("");
 const [endDate, setEndDate] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const ITEMS_PER_PAGE = 10;

 // Debounce logic cho ô tìm kiếm
 useEffect(() => {
 const timer = setTimeout(() => {
 setDebouncedSearchQuery(searchQuery);
 }, 500);
 return () => clearTimeout(timer);
 }, [searchQuery]);

 // Tải danh sách thùng rác
 const fetchAppointments = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const params = new URLSearchParams();
 if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
 if (statusFilter && statusFilter !=="ALL") params.append("status", statusFilter);
 if (startDate) params.append("startDate", startDate);
 if (endDate) params.append("endDate", endDate);
 params.append("page", currentPage.toString());
 params.append("limit", ITEMS_PER_PAGE.toString());

 const res = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/appointments?${params.toString()}`,
 { credentials:"include" },
 );
 const data = await res.json();

 if (data && data.code ==="error") {
 throw new Error(data.message ||"Lỗi từ máy chủ backend.");
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
 setError(err.message ||"Đã xảy ra lỗi khi tải danh sách thùng rác.");
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
 }, [debouncedSearchQuery, startDate, endDate]);

 const handleDelete = async (id: string) => {
 try {
 setError(null);
 setSuccessMsg(null);
 const res = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/appointments/${id}`,
 {
 method:"DELETE",
 credentials:"include",
 },
 );

 const result = await res.json();
 if (!res.ok || result.code ==="error") {
 throw new Error(result.message ||"Lỗi khi xóa.");
 }

 setSuccessMsg("Đã chuyển vào thùng rác thành công.");
 fetchAppointments();
 } catch (err: any) {
 setError(err.message ||"Lỗi khi xóa.");
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold text-green-700">
 Lịch hẹn đã hoàn thành
 </h1>
 <p className="text-slate-600">
 Danh sách các lịch hẹn đã hoàn tất xử lý tại cổng
 </p>
 </div>
 <div className="flex items-center gap-3">
 <Link href="/admin/appointments">
 <Button variant="outline" className="gap-2 text-slate-600 hover:text-slate-900 transition-colors">
 <ArrowLeft className="h-4 w-4" />
 Quay lại danh sách
 </Button>
 </Link>
 </div>
 </div>

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

 <Card className="border border-green-200 dark:border-green-900/30 shadow-md">
 <CardHeader className="bg-green-50/50 dark:bg-green-900/10 border-b border-green-100 dark:border-green-900/20">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
 <div>
 <CardTitle className="text-green-700 dark:text-green-400">Danh sách lịch hẹn hoàn tất</CardTitle>
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
 className="pl-9 bg-white dark:bg-slate-950 w-full border-green-200 focus-visible:ring-green-500"
 />
 </div>
 <div className="flex w-full md:w-auto items-center gap-3">
 <div className="flex items-center gap-2">
 <Input
 type="date"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 className="w-full bg-white dark:bg-slate-950 border-green-200 focus-visible:ring-green-500"
 title="Từ ngày"
 />
 <span className="text-slate-500">-</span>
 <Input
 type="date"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 className="w-full bg-white dark:bg-slate-950 border-green-200 focus-visible:ring-green-500"
 title="Đến ngày"
 />
 </div>

 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 setSearchQuery("");
 setDebouncedSearchQuery("");
 setStartDate("");
 setEndDate("");
 }}
 disabled={!searchQuery && !startDate && !endDate}
 className="whitespace-nowrap border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
 >
 Xóa bộ lọc
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-12 text-slate-500">
 <Loader2 className="h-8 w-8 animate-spin text-green-600 mb-2" />
 <p>Đang tải danh sách...</p>
 </div>
 ) : appointments.length === 0 ? (
 <div className="text-center py-12 text-slate-500">
 <p>
 {searchQuery || startDate || endDate
 ?"Không tìm thấy lịch hẹn hoàn tất nào phù hợp."
 :"Không có lịch hẹn hoàn tất."}
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 dark:text-slate-400">
 <tr>
 <th className="px-4 py-3 font-medium text-left font-medium">Biển số xe</th>
 <th className="px-4 py-3 font-medium text-left font-medium">Mã Container</th>
 <th className="px-4 py-3 font-medium text-left font-medium">Tài xế</th>
 <th className="px-4 py-3 font-medium text-left font-medium">Ngày hẹn</th>
 <th className="px-4 py-3 font-medium text-left font-medium">Trạng thái</th>
 <th className="px-4 py-3 font-medium text-right font-medium">Hành động</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
 {appointments.map((apt) => (
 <tr
 key={apt._id}
 className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/50 transition-colors"
 >
 <td className="px-4 py-3 font-medium">{apt.truckPlate}</td>
 <td className="px-4 py-3 font-mono">{apt.containerNo}</td>
 <td className="px-4 py-3">{apt.driverId?.driverName || "Không xác định"}</td>
 <td className="px-4 py-3">
 {new Date(apt.scheduledDate).toLocaleDateString("vi-VN")}
 </td>
 <td className="px-4 py-3">
 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
 Đã ra cảng
 </span>
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-2">
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button variant="outline" size="sm" className="h-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700">
 <Trash2 className="h-4 w-4 mr-1" />
 Xóa
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Xóa lịch hẹn này?</AlertDialogTitle>
 <AlertDialogDescription>
 Lịch hẹn này sẽ được chuyển vào thùng rác.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Hủy</AlertDialogCancel>
 <AlertDialogAction onClick={() => handleDelete(apt._id)} className="bg-red-600 hover:bg-red-700">
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
 <div className="py-4 border-t border-red-100 dark:border-red-900/20">
 <Pagination>
 <PaginationContent>
 <PaginationItem>
 <PaginationPrevious
 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
 className={
 currentPage === 1
 ?"pointer-events-none opacity-50"
 :"cursor-pointer"
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
 ?"pointer-events-none opacity-50"
 :"cursor-pointer"
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
