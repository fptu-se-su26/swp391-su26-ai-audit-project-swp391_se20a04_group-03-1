"use client";
import { useEffect, useState } from"react";
import { io } from"socket.io-client";
import { Button } from"@/components/ui/button";
import { Input } from"@/components/ui/input";
import {
 Card,
 CardContent,
 CardDescription,
 CardHeader,
 CardTitle,
} from"@/components/ui/card";
import { VideoStream } from"@/components/ui/video-stream";
import {
 Plus,
 CheckCircle,
 Trash2,
 Edit2,
 Loader2,
 Save,
 X,
 AlertCircle,
} from"lucide-react";

import {
 Pagination,
 PaginationContent,
 PaginationEllipsis,
 PaginationItem,
 PaginationLink,
 PaginationNext,
 PaginationPrevious,
} from"@/components/ui/pagination";
import { Search, Calendar, Eye, LogOut } from"lucide-react";

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

interface Gate {
 _id: string;
 name: string;
 cameraIp: string;
 type: string;
}

const gateData = [
 {
 id: 1,
 plate:"XE-001",
 driver:"Nguyễn A",
 container:"CNT-001",
 checkInTime:"08:15",
 status:"Đã vào",
 action:"Check-out",
 },
 {
 id: 2,
 plate:"XE-002",
 driver:"Trần B",
 container:"CNT-002",
 checkInTime:"08:30",
 status:"Đã vào",
 action:"Check-out",
 },
 {
 id: 3,
 plate:"XE-003",
 driver:"Lê C",
 container:"CNT-003",
 checkInTime:"09:00",
 status:"Đã vào",
 action:"Check-out",
 },
];

export default function GatePage() {
 const [showCheckIn, setShowCheckIn] = useState(false);
 const [gates, setGates] = useState<Gate[]>([]);
 const [loading, setLoading] = useState(true);
 const [editingGate, setEditingGate] = useState<string | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [successMsg, setSuccessMsg] = useState<string | null>(null);
 const [editForm, setEditForm] = useState({
 name:"",
 cameraIp:"",
 type:"in",
 });
 
 const [activeIn, setActiveIn] = useState(0);
 const [activeOut, setActiveOut] = useState(0);
 const [gateLogs, setGateLogs] = useState<any[]>([]);
 const [searchQuery, setSearchQuery] = useState("");
 const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
 const [statusFilter, setStatusFilter] = useState("ALL");
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

 useEffect(() => {
 setCurrentPage(1);
 }, [debouncedSearchQuery, statusFilter, startDate, endDate]);


 useEffect(() => {
 const socketUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api","") :"http://localhost:4000";
 const socket = io(socketUrl);
 
 socket.on("gate_scan_update", (data) => {
 setActiveIn(data.activeCount);
 setActiveOut(data.completedCount);
 setGateLogs((prev) => [{ ...data, id: Date.now() + Math.random() }, ...prev].slice(0, 50));
 });

 socket.on("gate_scan_error", (data) => {
 setError(`Lỗi quét biển số [${data.plate}]: ${data.message}`);
 setSuccessMsg(null);
 setTimeout(() => {
 setError(null);
 }, 10000);
 });

 socket.on("gate_scan_success", (data) => {
 setSuccessMsg(`[${data.plate}]: ${data.message}`);
 setError(null);
 setTimeout(() => {
 setSuccessMsg(null);
 }, 5000);
 });

 return () => {
 socket.disconnect();
 };
 }, []);

 useEffect(() => {
 fetchGates();
 fetchLogs();
 }, []);

 
 const fetchLogs = async () => {
 try {
 const params = new URLSearchParams();
 if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
 if (statusFilter && statusFilter !=="ALL") params.append("status", statusFilter);
 if (startDate) params.append("startDate", startDate);
 if (endDate) params.append("endDate", endDate);
 params.append("page", currentPage.toString());
 params.append("limit", ITEMS_PER_PAGE.toString());

 const apiUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api","") :"http://localhost:4000";
 const res = await fetch(`${apiUrl}/api/scan/logs/paginated?${params.toString()}`, { credentials:"include" });
 const data = await res.json();
 if (data.code ==="success") {
 if (data.stats) {
 setActiveIn(data.stats.activeCount);
 setActiveOut(data.stats.completedCount);
 }
 setGateLogs(data.data || []);
 if (data.pagination) setTotalPages(data.pagination.totalPages);
 }
 } catch (err) {
 console.error("Failed to fetch logs:", err);
 }
 };

 useEffect(() => {
 fetchLogs();
 }, [debouncedSearchQuery, statusFilter, startDate, endDate, currentPage]);

 const handleSoftDeleteLog = async (id: string) => {
 try {
 const apiUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api","") :"http://localhost:4000";
 const res = await fetch(`${apiUrl}/api/scan/logs/${id}`, { method:"DELETE", credentials:"include" });
 const data = await res.json();
 if (data.code ==="success") {
 setSuccessMsg("Đã xóa nhật ký vào thùng rác.");
 fetchLogs();
 } else {
 setError(data.message ||"Lỗi xóa nhật ký");
 }
 } catch (err) {
 console.error(err);
 }
 };

 const handleManualCheckout = async (id: string) => {
 try {
 const apiUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api","") :"http://localhost:4000";
 const res = await fetch(`${apiUrl}/api/scan/logs/${id}/checkout`, { method:"PATCH", credentials:"include" });
 const data = await res.json();
 if (data.code ==="success") {
 setSuccessMsg("Đã check-out thủ công thành công.");
 fetchLogs();
 } else {
 setError(data.message ||"Lỗi check-out thủ công");
 }
 } catch (err) {
 console.error(err);
 }
 };


 const fetchGates = async () => {
 try {
 setLoading(true);
 const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gates`, {
 credentials:"include",
 });
 const data = await res.json();
 if (data.code ==="success") {
 setGates(data.data || []);
 }
 } catch (err) {
 console.error("Failed to fetch gates:", err);
 } finally {
 setLoading(false);
 }
 };

 const handleDeleteGate = async (id: string) => {
 try {
 const res = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/gates/${id}`,
 {
 method:"DELETE",
 credentials:"include",
 },
 );
 const data = await res.json();
 if (data.code ==="success") {
 fetchGates();
 }
 } catch (err) {
 console.error("Failed to delete gate:", err);
 }
 };

 const handleEditClick = (gate: Gate) => {
 setEditingGate(gate._id);
 setError(null);
 setEditForm({
 name: gate.name,
 cameraIp: gate.cameraIp,
 type: gate.type ||"in",
 });
 };

 const handleUpdateGate = async (id: string) => {
 try {
 const res = await fetch(
 `${process.env.NEXT_PUBLIC_API_URL}/gates/${id}/info`,
 {
 method:"PATCH",
 headers: {"Content-Type":"application/json" },
 body: JSON.stringify(editForm),
 credentials:"include",
 },
 );
 const data = await res.json();
 if (data.code ==="success") {
 setEditingGate(null);
 setError(null);
 fetchGates();
 } else {
 setError(data.message ||"Có lỗi xảy ra khi cập nhật");
 }
 } catch (err: any) {
 console.error("Failed to update gate:", err);
 setError(err.message ||"Đã xảy ra lỗi khi cập nhật dữ liệu.");
 }
 };

 return (
 <div className="space-y-6">
 <div className="flex items-center justify-between flex-wrap gap-4">
 <div>
 <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
 Quản lý cổng
 </h1>
 <p className="text-muted-foreground">
 Quản lý check-in/check-out xe và hệ thống camera
 </p>
 </div>
 <div className="flex gap-2">
 <Button
 onClick={() => setShowCheckIn(!showCheckIn)}
 variant="outline"
 className="gap-2"
 >
 <Plus className="h-4 w-4" />
 Check-in thủ công
 </Button>
 <Link href="/admin/gate/create">
 <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md">
 <Plus className="h-4 w-4" />
 Tạo Camera Cổng
 </Button>
 </Link>
 <Link href="/admin/gate/trash">
 <Button variant="outline" className="gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700">
 <Trash2 className="h-4 w-4" />
 Thùng rác
 </Button>
 </Link>
 </div>
 </div>

 {error && (
 <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/10 dark:text-red-400 rounded-lg border border-red-200/50 dark:border-red-900/50 transition-all duration-300">
 <AlertCircle className="h-4 w-4 flex-shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {successMsg && (
 <div className="flex items-center gap-2 p-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/10 dark:text-green-400 rounded-lg border border-green-200/50 dark:border-green-900/50 transition-all duration-300">
 <CheckCircle className="h-4 w-4 flex-shrink-0" />
 <span>{successMsg}</span>
 </div>
 )}

 {/* Check-in Form */}
 {showCheckIn && (
 <Card className="border-blue-100 shadow-md bg-blue-50/30">
 <CardHeader>
 <CardTitle>Check-in xe</CardTitle>
 </CardHeader>
 <CardContent>
 <form className="space-y-4">
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div className="space-y-2">
 <label className="text-sm font-medium">Biển số xe</label>
 <Input placeholder="VN-001" />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium">Tên tài xế</label>
 <Input placeholder="Nguyễn A" />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium">Số booking</label>
 <Input placeholder="BK-001" />
 </div>
 <div className="space-y-2">
 <label className="text-sm font-medium">Mã container</label>
 <Input placeholder="CNT-001" />
 </div>
 </div>
 <div className="flex gap-2">
 <Button type="button" className="bg-blue-600 hover:bg-blue-700">
 Xác nhận
 </Button>
 <Button
 type="button"
 variant="outline"
 onClick={() => setShowCheckIn(false)}
 >
 Hủy
 </Button>
 </div>
 </form>
 </CardContent>
 </Card>
 )}

 {/* Video Streaming Section */}
 <div>
 <h2 className="text-xl font-bold mb-4">Hệ thống Camera Giám Sát</h2>
 {loading ? (
 <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-xl shadow-sm border border-border">
 <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
 <p>Đang tải danh sách camera cổng...</p>
 </div>
 ) : gates.length === 0 ? (
 <Card className="border-dashed border-2 shadow-none bg-muted/50">
 <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
 <p className="mb-4">Chưa có camera cổng nào được tạo.</p>
 <Link href="/admin/gate/create">
 <Button variant="outline">Tạo camera đầu tiên</Button>
 </Link>
 </CardContent>
 </Card>
 ) : (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {gates.map((gate) => (
 <Card
 key={gate._id}
 className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-slate-200"
 >
 {editingGate === gate._id ? (
 <CardHeader className="bg-muted/30 border-b border-border pb-4">
 <div className="space-y-3">
 <div>
 <label className="text-xs font-semibold text-muted-foreground mb-1 block">
 Tên Cổng
 </label>
 <Input
 value={editForm.name}
 onChange={(e) =>
 setEditForm({ ...editForm, name: e.target.value })
 }
 className="h-8 text-sm"
 />
 </div>
 <div>
 <label className="text-xs font-semibold text-muted-foreground mb-1 block">
 RTSP / IP Camera
 </label>
 <Input
 value={editForm.cameraIp}
 onChange={(e) =>
 setEditForm({
 ...editForm,
 cameraIp: e.target.value,
 })
 }
 className="h-8 text-sm"
 />
 </div>
 <div>
 <label className="text-xs font-semibold text-muted-foreground mb-1 block">
 Loại Cổng
 </label>
 <select
 value={editForm.type}
 onChange={(e) =>
 setEditForm({ ...editForm, type: e.target.value })
 }
 className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
 >
 <option value="in">Cổng Vào (IN)</option>
 <option value="out">Cổng Ra (OUT)</option>
 </select>
 </div>
 <div className="flex gap-2 pt-2">
 <Button
 size="sm"
 onClick={() => handleUpdateGate(gate._id)}
 className="bg-blue-600 hover:bg-blue-700 h-8"
 >
 <Save className="h-3.5 w-3.5 mr-1" /> Lưu
 </Button>
 <Button
 size="sm"
 variant="outline"
 onClick={() => setEditingGate(null)}
 className="h-8"
 >
 <X className="h-3.5 w-3.5 mr-1" /> Hủy
 </Button>
 </div>
 </div>
 </CardHeader>
 ) : (
 <CardHeader className="pb-3 pt-4 flex flex-row items-start justify-between border-b border-border">
 <div>
 <div className="flex items-center gap-2">
 <CardTitle className="text-lg font-bold">
 {gate.name}
 </CardTitle>
 {gate.type ==="in" ? (
 <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider border border-green-200">
 Cổng Vào
 </span>
 ) : gate.type ==="out" ? (
 <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider border border-blue-200">
 Cổng Ra
 </span>
 ) : null}
 </div>
 <CardDescription className="font-mono text-xs mt-1.5 text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block">
 {gate.cameraIp}
 </CardDescription>
 </div>
 <div className="flex gap-1">
 <Button
 variant="ghost"
 size="sm"
 onClick={() => handleEditClick(gate)}
 className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
 >
 <Edit2 className="h-4 w-4" />
 </Button>

 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button
 variant="ghost"
 size="sm"
 className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
 >
 <Trash2 className="h-4 w-4" />
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>
 Xóa camera cổng?
 </AlertDialogTitle>
 <AlertDialogDescription>
 Bạn có chắc chắn muốn xóa camera{""}
 <strong>{gate.name}</strong>? Hành động này không
 thể hoàn tác.
 </AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Hủy</AlertDialogCancel>
 <AlertDialogAction
 onClick={() => handleDeleteGate(gate._id)}
 className="bg-red-600 hover:bg-red-700"
 >
 Xóa
 </AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </div>
 </CardHeader>
 )}
 <CardContent className="p-0">
 <div className="p-2 bg-muted/50">
 <VideoStream
 title={gate.name}
 cameraId={gate._id.substring(0, 8).toUpperCase()}
 streamUrl={`http://localhost:5001/video_feed?rtsp_url=${encodeURIComponent(gate.cameraIp)}`}
 />
 </div>
 </CardContent>
 </Card>
 ))}
 </div>
 )}
 </div>

 {/* Active Vehicles */}
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
 <Card className="shadow-sm border-l-4 border-l-green-500">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
 Xe đã vào
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-end gap-2">
 <p className="text-4xl font-bold">{activeIn}</p>
 <p className="text-sm text-muted-foreground mb-1">hiện tại</p>
 </div>
 </CardContent>
 </Card>
 <Card className="shadow-sm border-l-4 border-l-blue-500">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
 Xe đã ra
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-end gap-2">
 <p className="text-4xl font-bold">{activeOut}</p>
 <p className="text-sm text-muted-foreground mb-1">hôm nay</p>
 </div>
 </CardContent>
 </Card>
 <Card className="shadow-sm border-l-4 border-l-amber-500">
 <CardHeader className="pb-2">
 <CardTitle className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
 Xe đang chờ
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="flex items-end gap-2">
 <p className="text-4xl font-bold">6</p>
 <p className="text-sm text-muted-foreground mb-1">tại cổng</p>
 </div>
 </CardContent>
 </Card>
 </div>

 {/* Gate Log */}
 <Card className="shadow-sm">
 <CardHeader className="border-b border-border bg-muted/20 flex flex-row items-center justify-between">
 <div>
 <CardTitle>Nhật ký cổng</CardTitle>
 <CardDescription>
 Lịch check-in/check-out xe trong ngày
 </CardDescription>
 </div>
 <Link href="/admin/gate/logs/trash">
 <Button variant="outline" size="sm" className="gap-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:text-red-700">
 <Trash2 className="h-4 w-4" />
 Thùng rác nhật ký
 </Button>
 </Link>
 </CardHeader>
 <CardContent className="p-4 space-y-4">
 {/* Filters */}
 <div className="flex flex-col md:flex-row gap-4">
 <div className="flex-1 relative">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
 <Input
 placeholder="Tìm theo biển số xe..."
 className="pl-9 bg-slate-50"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 />
 </div>
 <div className="flex gap-2">
 <select
 className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 >
 <option value="ALL">Tất cả trạng thái</option>
 <option value="in">Đã vào</option>
 <option value="out">Đã ra</option>
 </select>
 <div className="flex items-center border rounded-md px-2 bg-background">
 <Calendar className="h-4 w-4 text-slate-500 mr-2" />
 <input
 type="date"
 className="text-sm bg-transparent outline-none"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 />
 <span className="mx-2 text-slate-500">-</span>
 <input
 type="date"
 className="text-sm bg-transparent outline-none"
 value={endDate}
 onChange={(e) => setEndDate(e.target.value)}
 />
 </div>
 </div>
 </div>

 <div className="overflow-x-auto border rounded-md">
 <table className="w-full text-sm text-left">
 <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 dark:text-slate-400">
 <tr>
 <th className="px-4 py-3 font-medium text-left text-muted-foreground">Biển số</th>
 <th className="px-4 py-3 font-medium text-left text-muted-foreground">Tài xế</th>
 <th className="px-4 py-3 font-medium text-left text-muted-foreground">Container</th>
 <th className="px-4 py-3 font-medium text-left text-muted-foreground">Giờ lưu</th>
 <th className="px-4 py-3 font-medium text-left text-muted-foreground">Trạng thái</th>
 <th className="px-4 py-3 font-medium text-left text-muted-foreground">Hành động</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
 {gateLogs.length === 0 ? (
 <tr><td colSpan={6} className="text-center py-8 text-slate-500">Không có dữ liệu nhật ký</td></tr>
 ) : (
 gateLogs.map((item) => (
 <tr
 key={item._id}
 className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/50 transition-colors"
 >
 <td className="px-4 py-3 font-bold">{item.truckPlate}</td>
 <td className="px-4 py-3">{item.appointmentId?.driverName ||"-"}</td>
 <td className="px-4 py-3">{item.containerNo ||"-"}</td>
 <td className="px-4 py-3 font-mono">
 {new Date(item.status ==="in" ? item.checkInTime : item.checkOutTime).toLocaleString('vi-VN')}
 </td>
 <td className="px-4 py-3">
 <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'in' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
 <CheckCircle className="h-3.5 w-3.5" />
 {item.status ==="in" ?"Đã vào" :"Đã ra"}
 </span>
 </td>
 <td className="px-4 py-3 flex items-center ga">
 <Link href={`/admin/gate/logs/${item._id}`}>
 <Button variant="outline" size="sm" className="h-8 text-xs font-semibold hover:bg-blue-50 hover:text-blue-600">
 <Eye className="h-3.5 w-3.5 mr-1" /> Chi tiết
 </Button>
 </Link>
 {item.status ==="in" && (
 <Button 
 variant="outline" 
 size="sm" 
 onClick={() => handleManualCheckout(item._id)}
 className="h-8 text-xs font-semibold hover:bg-orange-50 hover:text-orange-600 border-orange-200 text-orange-500"
 >
 <LogOut className="h-3.5 w-3.5 mr-1" /> Checkout
 </Button>
 )}
 <AlertDialog>
 <AlertDialogTrigger asChild>
 <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
 <Trash2 className="h-4 w-4" />
 </Button>
 </AlertDialogTrigger>
 <AlertDialogContent>
 <AlertDialogHeader>
 <AlertDialogTitle>Chuyển vào thùng rác?</AlertDialogTitle>
 <AlertDialogDescription>Nhật ký của xe {item.truckPlate} sẽ được chuyển vào thùng rác.</AlertDialogDescription>
 </AlertDialogHeader>
 <AlertDialogFooter>
 <AlertDialogCancel>Hủy</AlertDialogCancel>
 <AlertDialogAction onClick={() => handleSoftDeleteLog(item._id)} className="bg-red-600">Xóa</AlertDialogAction>
 </AlertDialogFooter>
 </AlertDialogContent>
 </AlertDialog>
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>

 {totalPages > 1 && (
 <Pagination className="mt-6">
 <PaginationContent>
 <PaginationItem>
 <PaginationPrevious 
 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
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
 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
