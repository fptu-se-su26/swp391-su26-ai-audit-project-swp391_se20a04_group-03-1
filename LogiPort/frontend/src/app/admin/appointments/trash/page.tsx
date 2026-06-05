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
 status:"Pending" |"Confirmed" |"CheckedIn" |"CheckedOut" |"Cancelled" |"Completed";
 createdAt: string;
}

export default function TrashAppointmentsPage() {
 const [appointments, setAppointments] = useState<Appointment[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [successMsg, setSuccessMsg] = useState<string | null>(null);
 const [searchQuery, setSearchQuery] = useState("");
 const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
 const [statusFilter, setStatusFilter] = useState("ALL");
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
 `${process.env.NEXT_PUBLIC_API_URL}/appointments/trash?${params.toString()}`,
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
 }, [debouncedSearchQuery, statusFilter, startDate, endDate]);

 // Khôi phục lịch hẹn
 const handleRestoreAppointment = async (id: string) => {
 try {
 setError(null);
 setSuccessMsg(null);
 const res = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/appointments/restore/${id}`,
 {
 method:"PATCH",
 credentials:"include",
 },
 );

 const result = await res.json();
 if (!res.ok || result.code ==="error") {
 throw new Error(result.message ||"Lỗi khi khôi phục lịch hẹn.");
 }

 setSuccessMsg("Khôi phục lịch hẹn thành công.");
 fetchAppointments();
 } catch (err: any) {
 setError(err.message ||"Không thể khôi phục lịch hẹn.");
 }
 };

 // Xóa vĩnh viễn
 const handleHardDeleteAppointment = async (id: string) => {
 try {
 setError(null);
 setSuccessMsg(null);
 const res = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/appointments/hard-delete/${id}`,
 {
 method:"DELETE",
 credentials:"include",
 },
 );

 const result = await res.json();
 if (!res.ok || result.code ==="error") {
 throw new Error(result.message ||"Lỗi khi xóa vĩnh viễn.");
 }

 setSuccessMsg("Đã xóa vĩnh viễn lịch hẹn.");
 fetchAppointments();
 } catch (err: any) {
 setError(err.message ||"Không thể xóa vĩnh viễn lịch hẹn.");
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
 Thùng rác
 </h1>
 <p className="text-slate-600">
 Các lịch hẹn đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.
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

 <Card className="border border-red-200 dark:border-red-900/30 shadow-md">
 <CardHeader className="bg-red-50/50 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
 <div>
 <CardTitle className="text-red-700 dark:text-red-400">Danh sách lịch hẹn đã xóa</CardTitle>
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
 className="pl-9 bg-white dark:bg-slate-950 w-full border-red-200 focus-visible:ring-red-500"
 />
 </div>
 <div className="flex w-full md:w-auto items-center gap-3">
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="flex h-10 w-full md:w-40 rounded-md border border-red-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:border-red-800 dark:bg-slate-950 dark:focus-visible:ring-red-300"
 >
 <option value="ALL">Tất cả trạng thái</option>
 <option value="Pending">Chờ duyệt</option>
 <option value="Confirmed">Đã duyệt</option>
 <option value="CheckedIn">Đã vào cảng</option>
 <option value="CheckedOut">Đã ra cảng</option>
 <option value="Completed">Hoàn thành</option>
 <option value="Cancelled">Đã hủy</option>
 </select>

 <div className="flex items-center gap-2">
 <Input
 type="date"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 className="w-full bg-white dark:bg-slate-950 border-red-200 focus-visible:ring-red-500"
 title="Từ ngày"
 />
 <span className="text-slate-500">-</span>
 <Input
 type="date"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 className="w-full bg-white dark:bg-slate-950 border-red-200 focus-visible:ring-red-500"
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
 disabled={!searchQuery && statusFilter ==="ALL" && !startDate && !endDate}
 className="whitespace-nowrap border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
 >
 Xóa bộ lọc
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-12 text-slate-500">
 <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-2" />
 <p>Đang tải danh sách thùng rác...</p>
 </div>
 ) : appointments.length === 0 ? (
 <div className="text-center py-12 text-slate-500">
 <Trash2 className="h-12 w-12 mx-auto text-red-300 mb-2" />
 <p>
 {searchQuery || statusFilter !=="ALL" || startDate || endDate
 ?"Không tìm thấy lịch hẹn nào phù hợp trong thùng rác."
 :"Thùng rác trống."}
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 dark:text-slate-400">
 <tr>
 <th className="px-4 py-3 font-medium text-left font-medium">
 Biển số xe
 </th>
 <th className="px-4 py-3 font-medium text-left font-medium">
 Mã Container
 </th>
 <th className="px-4 py-3 font-medium text-left font-medium">Tài xế</th>
 <th className="px-4 py-3 font-medium text-left font-medium">
 Số điện thoại
 </th>
 <th className="px-4 py-3 font-medium text-left font-medium">
 Ngày hẹn
 </th>
 <th className="px-4 py-3 font-medium text-left font-medium">
 Khung giờ
 </th>
 <th className="px-4 py-3 font-medium text-left font-medium">
 Trạng thái
 </th>
 <th className="px-4 py-3 font-medium text-right font-medium">
 Hành động
 </th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
 {appointments.map((apt) => (
 <tr
 key={apt._id}
 className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/50 transition-colors"
 >
 <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
 {apt.truckPlate}
 </td>
 <td className="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300">
 {apt.containerNo}
 </td>
 <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
 {apt.driverId?.driverName || "Không xác định"}
 </td>
 <td className="px-4 py-3 text-slate-500 font-mono text-xs">
 {apt.driverId?.driverPhone || "-"}
 </td>
 <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
 {apt.scheduledDate
 ? new Date(apt.scheduledDate).toLocaleDateString("vi-VN",
 {
 year:"numeric",
 month:"2-digit",
 day:"2-digit",
 },
 )
 :"-"}
 </td>
 <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
 <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
 {apt.timeSlot}
 </span>
 </td>
 <td className="px-4 py-3">
 <span
 className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
 apt.status ==="Confirmed"
 ?"bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
 : apt.status ==="CheckedIn"
 ?"bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
 : apt.status ==="CheckedOut"
 ?"bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
 : apt.status ==="Completed"
 ?"bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400"
 : apt.status ==="Cancelled"
 ?"bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
 :"bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
 }`}
 >
 {apt.status ==="Confirmed"
 ?"Đã duyệt"
 : apt.status ==="CheckedIn"
 ?"Đã vào"
 : apt.status ==="CheckedOut"
 ?"Đã ra"
 : apt.status ==="Completed"
 ?"Hoàn thành"
 : apt.status ==="Cancelled"
 ?"Đã hủy"
 :"Chờ duyệt"}
 </span>
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-2">
 <Button
 onClick={() => handleRestoreAppointment(apt._id)}
 variant="outline"
 size="sm"
 className="text-xs text-blue-600 hover:bg-blue-50 border-blue-200/50"
 title="Khôi phục"
 >
 <RefreshCcw className="h-4 w-4 mr-1" />
 Khôi phục
 </Button>
 
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button
 variant="outline"
 size="sm"
 className="text-xs text-red-600 hover:bg-red-50 border-red-200/50"
 title="Xóa vĩnh viễn"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>
 Xác nhận xóa vĩnh viễn?
 </AlertDialogTitle>
 <AlertDialogDescription>
 Hành động này không thể hoàn tác. Lịch hẹn của
 xe{""}
 <span className="font-semibold text-slate-900 dark:text-slate-100">
 {apt.truckPlate}
 </span>{""}
 sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Hủy</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => handleHardDeleteAppointment(apt._id)}
 className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
 >
 Xóa vĩnh viễn
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
