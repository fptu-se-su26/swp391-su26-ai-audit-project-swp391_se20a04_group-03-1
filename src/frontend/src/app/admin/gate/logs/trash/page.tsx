"use client";

import { useEffect, useState } from"react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { ArrowLeft, RotateCcw, Trash2, Search, AlertCircle, CheckCircle } from"lucide-react";
import Link from"next/link";
import { Input } from"@/components/ui/input";
import {
 Pagination,
 PaginationContent,
 PaginationItem,
 PaginationLink,
 PaginationNext,
 PaginationPrevious,
} from"@/components/ui/pagination";
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

export default function GateLogsTrashPage() {
 const [logs, setLogs] = useState<any[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [success, setSuccess] = useState<string | null>(null);

 const [searchQuery, setSearchQuery] = useState("");
 const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
 const [currentPage, setCurrentPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);
 const ITEMS_PER_PAGE = 10;

 useEffect(() => {
 const timer = setTimeout(() => {
 setDebouncedSearchQuery(searchQuery);
 }, 500);
 return () => clearTimeout(timer);
 }, [searchQuery]);

 useEffect(() => {
 setCurrentPage(1);
 }, [debouncedSearchQuery]);

 useEffect(() => {
 fetchTrashLogs();
 }, [debouncedSearchQuery, currentPage]);

 const fetchTrashLogs = async () => {
 try {
 setLoading(true);
 const params = new URLSearchParams();
 if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
 params.append("page", currentPage.toString());
 params.append("limit", ITEMS_PER_PAGE.toString());

 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scan/logs/trash/list?${params.toString()}`, { credentials:"include" });
 const data = await res.json();
 if (data.code ==="success") {
 setLogs(data.data || []);
 if (data.pagination) setTotalPages(data.pagination.totalPages);
 } else {
 setError(data.message ||"Không thể tải danh sách thùng rác");
 }
 } catch (err) {
 console.error(err);
 setError("Đã xảy ra lỗi khi tải danh sách");
 } finally {
 setLoading(false);
 }
 };

 const handleRestore = async (id: string) => {
 try {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scan/logs/${id}/restore`, {
 method:"PATCH",
 credentials:"include",
 });
 const data = await res.json();
 if (data.code ==="success") {
 setSuccess("Đã khôi phục nhật ký thành công");
 fetchTrashLogs();
 } else {
 setError(data.message ||"Lỗi khôi phục nhật ký");
 }
 } catch (err) {
 console.error(err);
 }
 };

 const handleHardDelete = async (id: string) => {
 try {
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scan/logs/${id}/force`, {
 method:"DELETE",
 credentials:"include",
 });
 const data = await res.json();
 if (data.code ==="success") {
 setSuccess("Đã xóa vĩnh viễn nhật ký thành công");
 fetchTrashLogs();
 } else {
 setError(data.message ||"Lỗi xóa vĩnh viễn");
 }
 } catch (err) {
 console.error(err);
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center gap-4">
 <Link href="/admin/gate">
 <Button variant="outline" size="icon">
 <ArrowLeft className="h-4 w-4" />
 </Button>
 </Link>
 <div>
 <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Thùng rác Nhật ký</h1>
 <p className="text-muted-foreground">Khôi phục hoặc xóa vĩnh viễn nhật ký xe ra vào</p>
 </div>
 </div>

 {error && (
 <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-900/10 dark:text-red-400 border border-red-200/50">
 <AlertCircle className="h-4 w-4" />
 <span>{error}</span>
 </div>
 )}

 {success && (
 <div className="flex items-center gap-2 p-4 text-sm text-green-700 bg-green-50 rounded-lg dark:bg-green-900/10 dark:text-green-400 border border-green-200/50">
 <CheckCircle className="h-4 w-4" />
 <span>{success}</span>
 </div>
 )}

 <Card>
 <CardHeader>
 <CardTitle>Danh sách đã xóa</CardTitle>
 <CardDescription>Các nhật ký đã bị xóa (có thể khôi phục)</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="relative max-w-sm">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
 <Input
 placeholder="Tìm theo biển số..."
 className="pl-9"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>

 <div className="border rounded-md">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 dark:text-slate-400">
 <tr>
 <th className="px-4 py-3 font-medium text-left text-muted-foreground">Biển số</th>
 <th className="px-4 py-3 font-medium text-left text-muted-foreground">Container</th>
 <th className="px-4 py-3 font-medium text-left text-muted-foreground">Giờ vào</th>
 <th className="px-4 py-3 font-medium text-right font-semibold text-muted-foreground">Hành động</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
 {loading ? (
 <tr>
 <td colSpan={4} className="text-center py-8 text-slate-500">Đang tải...</td>
 </tr>
 ) : logs.length === 0 ? (
 <tr>
 <td colSpan={4} className="text-center py-8 text-slate-500">Thùng rác trống</td>
 </tr>
 ) : (
 logs.map((log) => (
 <tr key={log._id} className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/50 transition-colors">
 <td className="px-4 py-3 font-bold">{log.truckPlate}</td>
 <td className="px-4 py-3">{log.containerNo ||"-"}</td>
 <td className="px-4 py-3">
 {new Date(log.checkInTime).toLocaleString("vi-VN")}
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-2">
 <Button
 variant="outline"
 size="sm"
 className="text-green-600 hover:text-green-700 hover:bg-green-50"
 onClick={() => handleRestore(log._id)}
 >
 <RotateCcw className="h-4 w-4 mr-1" /> Khôi phục
 </Button>

 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button
 variant="outline"
 size="sm"
 className="text-red-600 hover:text-red-700 hover:bg-red-50"
 >
 <Trash2 className="h-4 w-4 mr-1" /> Xóa vĩnh viễn
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Xóa vĩnh viễn?</AlertDialogTitle>
 <AlertDialogDescription>
 Nhật ký của xe {log.truckPlate} sẽ bị xóa vĩnh viễn khỏi hệ thống.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Hủy</AlertDialogCancel>
 <AlertDialogAction
 className="bg-red-600"
 onClick={() => handleHardDelete(log._id)}
 >
 Xóa
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {totalPages > 1 && (
 <Pagination className="mt-4">
 <PaginationContent>
 <PaginationItem>
 <PaginationPrevious
 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
 className={currentPage === 1 ?"pointer-events-none opacity-50" :"cursor-pointer"}
 />
 </PaginationItem>
 {[...Array(totalPages)].map((_, i) => (
 <PaginationItem key={i}>
 <PaginationLink
 onClick={() => setCurrentPage(i + 1)}
 isActive={currentPage === i + 1}
 className="cursor-pointer"
 >
 {i + 1}
 </PaginationLink>
 </PaginationItem>
 ))}
 <PaginationItem>
 <PaginationNext
 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
 className={currentPage === totalPages ?"pointer-events-none opacity-50" :"cursor-pointer"}
 />
 </PaginationItem>
 </PaginationContent>
 </Pagination>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
