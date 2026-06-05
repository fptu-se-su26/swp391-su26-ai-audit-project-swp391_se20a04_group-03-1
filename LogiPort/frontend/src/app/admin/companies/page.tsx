"use client";

import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import { Label } from"@/components/ui/label";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from"@/components/ui/card";
import {
 Plus,
 Trash2,
 Building2,
 Loader2,
 AlertCircle,
 CheckCircle,
 Pencil,
 Search,
} from"lucide-react";
import { useState, useEffect, useRef, useCallback } from"react";
import JustValidate from"just-validate";
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

interface Company {
 _id: string;
 companyCode: string;
 companyName: string;
 contactPerson: string;
 contactPhone: string;
 email: string;
 status:"Active" |"Inactive" |"Suspended";
 createdAt: string;
}

export default function CompaniesPage() {
 const [companies, setCompanies] = useState<Company[]>([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const [successMsg, setSuccessMsg] = useState<string | null>(null);
 const [showForm, setShowForm] = useState(false);
 const [searchQuery, setSearchQuery] = useState("");
 const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
 const [statusFilter, setStatusFilter] = useState("ALL");
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

 // Tải danh sách công ty từ backend
 const fetchCompanies = useCallback(async () => {
 setLoading(true);
 setError(null);
 try {
 const params = new URLSearchParams();
 if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
 if (statusFilter && statusFilter !=="ALL") params.append("status", statusFilter);
 params.append("page", currentPage.toString());
 params.append("limit", ITEMS_PER_PAGE.toString());

 const res = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/companies/?${params.toString()}`,
 { credentials:"include" },
 );
 const data = await res.json();

 if (data && data.code ==="error") {
 throw new Error(data.message ||"Lỗi từ máy chủ backend.");
 }

 const companyArray =
 data && data.data ? data.data : Array.isArray(data) ? data : [];
 setCompanies(companyArray);
 
 if (data && data.pagination) {
 setTotalPages(data.pagination.totalPages);
 } else {
 setTotalPages(1);
 }
 } catch (err: any) {
 setError(err.message ||"Đã xảy ra lỗi khi tải danh sách công ty.");
 } finally {
 setLoading(false);
 }
 }, [debouncedSearchQuery, statusFilter, currentPage]);

 useEffect(() => {
 fetchCompanies();
 }, [fetchCompanies]);

 useEffect(() => {
 setCurrentPage(1);
 }, [debouncedSearchQuery, statusFilter]);

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
 errorFieldCssClass:"border-red-500 focus:ring-red-500 focus:border-red-500",
 errorLabelCssClass:"text-red-500 text-xs mt-1 block font-medium",
 });

 validatorRef.current = validator;

 validator
 .addField("#companyCode", [
 {
 rule:"required",
 errorMessage:"Mã công ty là bắt buộc.",
 },
 {
 rule:"customRegexp",
 value: /^[A-Z0-9-]{3,20}$/,
 errorMessage:"Mã công ty chỉ gồm chữ in hoa, số và dấu gạch ngang (3-20 ký tự).",
 },
 ])
 .addField("#companyName", [
 {
 rule:"required",
 errorMessage:"Tên công ty là bắt buộc.",
 },
 {
 rule:"minLength",
 value: 3,
 errorMessage:"Tên công ty phải từ 3 ký tự trở lên.",
 },
 ])
 .addField("#contactPerson", [
 {
 rule:"required",
 errorMessage:"Tên người liên hệ là bắt buộc.",
 },
 ])
 .addField("#contactPhone", [
 {
 rule:"required",
 errorMessage:"Số điện thoại là bắt buộc.",
 },
 {
 rule:"customRegexp",
 value: /^(0[3|5|7|8|9])[0-9]{8}$/,
 errorMessage:"Số điện thoại không đúng định dạng Việt Nam.",
 },
 ])
 .addField("#email", [
 {
 rule:"required",
 errorMessage:"Email là bắt buộc.",
 },
 {
 rule:"email",
 errorMessage:"Email không hợp lệ.",
 },
 ])
 .onSuccess(async (event: any) => {
 event.preventDefault();
 const formData = new FormData(formRef.current!);
 const payload = {
 companyCode: formData
 .get("companyCode")
 ?.toString()
 .trim()
 .toUpperCase(),
 companyName: formData.get("companyName")?.toString().trim(),
 contactPerson: formData.get("contactPerson")?.toString().trim(),
 contactPhone: formData.get("contactPhone")?.toString().trim(),
 email: formData.get("email")?.toString().trim().toLowerCase(),
 };

 try {
 setError(null);
 setSuccessMsg(null);
 const res = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/companies/create`,
 {
 method:"POST",
 headers: {"Content-Type":"application/json",
 },
 body: JSON.stringify(payload),
 credentials:"include",
 },
 );

 const result = await res.json();
 if (!res.ok || result.code ==="error") {
 throw new Error(result.message ||"Lỗi khi thêm công ty.");
 }

 setSuccessMsg("Thêm công ty thành công!");
 setShowForm(false);
 fetchCompanies();
 } catch (err: any) {
 setError(err.message ||"Không thể lưu thông tin công ty.");
 }
 });

 return () => {
 if (validatorRef.current) {
 validatorRef.current.destroy();
 validatorRef.current = null;
 }
 };
 }, [showForm]);

 // Cập nhật trạng thái
 const handleUpdateStatus = async (id: string, newStatus: string) => {
 try {
 setError(null);
 setSuccessMsg(null);
 const res = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/companies/status/${id}`,
 {
 method:"PATCH",
 headers: {"Content-Type":"application/json",
 },
 body: JSON.stringify({ newStatus: newStatus }),
 credentials:"include",
 },
 );

 const result = await res.json();
 if (!res.ok || result.code ==="error") {
 throw new Error(result.message ||"Lỗi khi cập nhật trạng thái.");
 }

 setSuccessMsg(
 `Đã cập nhật trạng thái công ty sang: ${newStatus ==="Active" ?"Đang hoạt động" :"Đình chỉ"}`,
 );
 fetchCompanies();
 } catch (err: any) {
 setError(err.message ||"Không thể cập nhật trạng thái.");
 }
 };

 // Xóa (Soft Delete)
 const handleDeleteCompany = async (id: string) => {
 try {
 setError(null);
 setSuccessMsg(null);
 const res = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/companies/delete/${id}`,
 {
 method:"PATCH",
 credentials:"include",
 },
 );

 const result = await res.json();
 if (!res.ok || result.code ==="error") {
 throw new Error(result.message ||"Lỗi khi đưa vào thùng rác.");
 }

 setSuccessMsg("Đã chuyển công ty vào thùng rác.");
 fetchCompanies();
 } catch (err: any) {
 setError(err.message ||"Không thể xóa công ty.");
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
 Quản lý công ty
 </h1>
 <p className="text-slate-600 dark:text-slate-400">
 Quản lý danh sách các công ty vận tải và đối tác
 </p>
 </div>
 <div className="flex items-center gap-3">
 <Link href="/admin/companies/trash">
 <Button variant="outline" className="gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-900/50 dark:text-red-500 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition-colors">
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
 className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-200 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600"
 >
 <Plus className="h-4 w-4" />
 Thêm công ty
 </Button>
 </div>
 </div>

 {error && (
 <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-900/10 dark:text-red-400 border border-red-200/50 dark:border-red-900/30">
 <AlertCircle className="h-4 w-4 flex-shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {successMsg && (
 <div className="flex items-center gap-2 p-4 text-sm text-green-700 bg-green-50 rounded-lg dark:bg-green-900/10 dark:text-green-400 border border-green-200/50 dark:border-green-900/30">
 <CheckCircle className="h-4 w-4 flex-shrink-0" />
 <span>{successMsg}</span>
 </div>
 )}

 {showForm && (
 <Card className="border border-slate-200 dark:border-slate-800 shadow-lg animate-in fade-in slide-in-from-top-4 duration-200">
 <CardHeader className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80">
 <CardTitle className="text-slate-900 dark:text-white">Thêm công ty mới</CardTitle>
 <CardDescription className="text-slate-500 dark:text-slate-400">
 Điền thông tin chi tiết của công ty đối tác.
 </CardDescription>
 </CardHeader>
 <CardContent className="pt-6">
 <form ref={formRef} id="companyForm" className="space-y-6">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div className="space-y-2">
 <Label htmlFor="companyCode" className="text-slate-900 dark:text-slate-300">Mã công ty</Label>
 <Input
 id="companyCode"
 name="companyCode"
 placeholder="VD: TRANS-01"
 className="uppercase bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="companyName" className="text-slate-900 dark:text-slate-300">Tên công ty</Label>
 <Input
 id="companyName"
 name="companyName"
 placeholder="CÔNG TY TNHH ABC"
 className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="contactPerson" className="text-slate-900 dark:text-slate-300">Người đại diện / Liên hệ</Label>
 <Input
 id="contactPerson"
 name="contactPerson"
 placeholder="Nguyễn Văn A"
 className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
 />
 </div>
 <div className="space-y-2">
 <Label htmlFor="contactPhone" className="text-slate-900 dark:text-slate-300">Số điện thoại</Label>
 <Input
 id="contactPhone"
 name="contactPhone"
 placeholder="VD: 0987654321"
 className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
 />
 </div>
 <div className="space-y-2 md:col-span-2">
 <Label htmlFor="email" className="text-slate-900 dark:text-slate-300">Email liên hệ</Label>
 <Input
 id="email"
 name="email"
 type="email"
 placeholder="contact@company.com"
 className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
 />
 </div>
 </div>
 <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800/80 pt-4">
 <Button
 type="button"
 variant="outline"
 onClick={() => setShowForm(false)}
 className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
 >
 Hủy bỏ
 </Button>
 <Button
 type="submit"
 className="bg-blue-600 hover:bg-blue-700 text-white font-medium dark:bg-blue-600 dark:hover:bg-blue-700"
 >
 Lưu công ty
 </Button>
 </div>
 </form>
 </CardContent>
 </Card>
 )}

 <Card className="border border-slate-200 dark:border-slate-800 shadow-md">
 <CardHeader className="bg-slate-50/50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80">
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
 <div>
 <CardTitle className="text-slate-900 dark:text-white">Danh sách đối tác</CardTitle>
 <CardDescription className="text-slate-500 dark:text-slate-400">
 Tất cả các công ty vận tải đang hợp tác với cảng.
 </CardDescription>
 </div>
 </div>

 <div className="flex flex-col md:flex-row items-center gap-3">
 <div className="relative w-full md:w-96">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
 <Input
 placeholder="Tìm mã, tên công ty, số điện thoại..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="pl-9 bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600 w-full"
 />
 </div>
 <div className="flex w-full md:w-auto items-center gap-3">
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className="flex h-10 w-full md:w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:ring-slate-300"
 >
 <option value="ALL">Tất cả trạng thái</option>
 <option value="Active">Đang hoạt động</option>
 <option value="Suspended">Đình chỉ</option>
 <option value="Inactive">Ngừng hoạt động</option>
 </select>

 <Button
 variant="outline"
 size="sm"
 onClick={() => {
 setSearchQuery("");
 setDebouncedSearchQuery("");
 setStatusFilter("ALL");
 }}
 disabled={!searchQuery && statusFilter ==="ALL"}
 className="whitespace-nowrap dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
 >
 Xóa bộ lọc
 </Button>
 </div>
 </div>
 </CardHeader>
 <CardContent className="p-0">
 {loading ? (
 <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
 <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500 mb-2" />
 <p>Đang tải danh sách công ty...</p>
 </div>
 ) : companies.length === 0 ? (
 <div className="text-center py-12 text-slate-500 dark:text-slate-400">
 <Building2 className="h-12 w-12 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
 <p>
 {searchQuery || statusFilter !=="ALL"
 ?"Không tìm thấy công ty nào phù hợp."
 :"Chưa có công ty nào trong hệ thống."}
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 dark:text-slate-400">
 <tr>
 <th className="px-4 py-3 font-medium text-left font-medium">Mã CT</th>
 <th className="px-4 py-3 font-medium text-left font-medium">Tên công ty</th>
 <th className="px-4 py-3 font-medium text-left font-medium">Người liên hệ</th>
 <th className="px-4 py-3 font-medium text-left font-medium">Điện thoại</th>
 <th className="px-4 py-3 font-medium text-left font-medium">Email</th>
 <th className="px-4 py-3 font-medium text-left font-medium">Ngày tạo</th>
 <th className="px-4 py-3 font-medium text-left font-medium">Trạng thái</th>
 <th className="px-4 py-3 font-medium text-right font-medium">Hành động</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
 {companies.map((comp) => (
 <tr
 key={comp._id}
 className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/50 transition-colors"
 >
 <td className="px-4 py-3 font-mono font-medium text-slate-900 dark:text-slate-100">
 {comp.companyCode}
 </td>
 <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
 {comp.companyName}
 </td>
 <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
 {comp.contactPerson}
 </td>
 <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-mono text-xs">
 {comp.contactPhone}
 </td>
 <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
 {comp.email}
 </td>
 <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
 {comp.createdAt
 ? new Date(comp.createdAt).toLocaleDateString("vi-VN")
 :"-"}
 </td>
 <td className="px-4 py-3">
 <span
 className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
 comp.status ==="Active"
 ?"bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
 : comp.status ==="Suspended"
 ?"bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
 :"bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
 }`}
 >
 {comp.status ==="Active"
 ?"Hoạt động"
 : comp.status ==="Suspended"
 ?"Đình chỉ"
 :"Ngừng HĐ"}
 </span>
 </td>
 <td className="px-4 py-3 text-right">
 <div className="flex items-center justify-end gap-2">
 {comp.status ==="Suspended" && (
 <Button
 onClick={() => handleUpdateStatus(comp._id,"Active")}
 variant="outline"
 size="sm"
 className="text-xs text-green-600 hover:bg-green-50 border-green-200/50 dark:border-green-900/50 dark:text-green-500 dark:hover:bg-green-950/50"
 >
 Kích hoạt
 </Button>
 )}
 {comp.status ==="Active" && (
 <Button
 onClick={() => handleUpdateStatus(comp._id,"Suspended")}
 variant="outline"
 size="sm"
 className="text-xs text-orange-600 hover:bg-orange-50 border-orange-200/50 dark:border-orange-900/50 dark:text-orange-500 dark:hover:bg-orange-950/50"
 >
 Đình chỉ
 </Button>
 )}
 <Link href={`/admin/companies/edit/${comp._id}`}>
 <Button
 variant="ghost"
 size="sm"
 className="text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-blue-950/50"
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
 className="text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-slate-400 dark:hover:text-red-400 dark:hover:bg-red-950/50"
 title="Xóa"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
 <AlertDialogHeader>
 <AlertDialogTitle className="dark:text-slate-100">Xóa công ty này?</AlertDialogTitle>
 <AlertDialogDescription className="dark:text-slate-400">
 Công ty{""}
 <span className="font-semibold dark:text-slate-200">{comp.companyName}</span>{""}
 sẽ được đưa vào thùng rác.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-700">Hủy</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => handleDeleteCompany(comp._id)}
 className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
 >
 Đồng ý
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
 {totalPages > 1 && companies.length > 0 && (
 <div className="py-4 border-t border-slate-100 dark:border-slate-800/80">
 <Pagination>
 <PaginationContent>
 <PaginationItem>
 <PaginationPrevious
 onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
 className={currentPage === 1 ?"pointer-events-none opacity-50" :"cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"}
 />
 </PaginationItem>
 {[...Array(totalPages)].map((_, i) => (
 <PaginationItem key={i + 1}>
 <PaginationLink
 onClick={() => setCurrentPage(i + 1)}
 isActive={currentPage === i + 1}
 className={currentPage === i + 1 ?"cursor-pointer dark:bg-slate-800 dark:text-slate-100" :"cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"}
 >
 {i + 1}
 </PaginationLink>
 </PaginationItem>
 ))}
 <PaginationItem>
 <PaginationNext
 onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
 className={currentPage === totalPages ?"pointer-events-none opacity-50" :"cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"}
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
