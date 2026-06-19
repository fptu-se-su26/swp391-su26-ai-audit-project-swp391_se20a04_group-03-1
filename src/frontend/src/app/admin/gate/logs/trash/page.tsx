"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Trash2, Search, Loader2, History } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import toast from "react-hot-toast";

export default function GateLogsTrashPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scan/logs/trash/list?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.code === "success") {
        setLogs(data.data || []);
        if (data.pagination) setTotalPages(data.pagination.totalPages);
      } else {
        throw new Error(data.message || "Không thể tải danh sách thùng rác");
      }
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải danh sách");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    const loadingToast = toast.loading("Đang khôi phục...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scan/logs/${id}/restore`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã khôi phục nhật ký thành công", { id: loadingToast });
        fetchTrashLogs();
      } else {
        throw new Error(data.message || "Lỗi khôi phục nhật ký");
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleHardDelete = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa vĩnh viễn...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scan/logs/${id}/force`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã xóa vĩnh viễn nhật ký thành công", { id: loadingToast });
        fetchTrashLogs();
      } else {
        throw new Error(data.message || "Lỗi xóa vĩnh viễn");
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#f3727f] tracking-tight uppercase">
            Thùng rác - Nhật ký cổng
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] mt-2 text-[16px]">
            Khôi phục hoặc xóa vĩnh viễn nhật ký xe ra vào đã xóa
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/gate">
            <Button variant="outline" className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#121212] dark:hover:border-[#ffffff] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại hệ thống
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible border-t-4 border-t-[#f3727f]">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-2">
                <History className="w-6 h-6 text-[#f3727f]" /> Danh sách nhật ký đã xóa
              </CardTitle>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
              <Input
                placeholder="Tìm biển số..."
                className="pl-11 bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                <tr>
                  <th className="px-6 py-4 font-black">Biển số</th>
                  <th className="px-6 py-4 font-black">Container</th>
                  <th className="px-6 py-4 font-black">Giờ vào/ra</th>
                  <th className="px-6 py-4 font-black text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-20">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-[#f3727f] mb-4" />
                        <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">Đang tải dữ liệu...</p>
                      </div>
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-20 text-[#666666] dark:text-[#999999] font-bold text-[14px]">
                      Thùng rác trống
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log._id} className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group">
                      <td className="px-6 py-4 font-black text-[#121212] dark:text-[#ffffff]">{log.actualTruckPlate}</td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">{log.actualContainerNo || "-"}</td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {new Date(log.checkInTime || log.checkOutTime).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => handleRestore(log._id)}
                            className="bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors"
                            title="Khôi phục"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Khôi phục
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="bg-[#f3727f]/10 hover:bg-[#f3727f] hover:text-[#121212] text-[#f3727f] rounded-[500px] h-8 w-8 p-0 border-none transition-colors" title="Xóa vĩnh viễn">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff]">Xóa vĩnh viễn?</AlertDialogTitle>
                                <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                                  Nhật ký của xe <strong className="text-[#121212] dark:text-[#ffffff]">{log.actualTruckPlate}</strong> sẽ bị xóa vĩnh viễn khỏi hệ thống.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider">Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleHardDelete(log._id)}
                                  className="bg-[#f3727f] hover:bg-[#d85663] text-white rounded-[500px] font-black uppercase tracking-wider border-none"
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

          {totalPages > 1 && logs.length > 0 && (
            <div className="p-4 border-t border-[#e5e5e5] dark:border-[#272727] flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={`rounded-[500px] font-bold ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727]"}`}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className={`rounded-[500px] font-bold cursor-pointer ${currentPage === i + 1 ? "bg-[#1ed760] text-[#121212] border-none hover:bg-[#1db954]" : "text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727]"}`}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={`rounded-[500px] font-bold ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727]"}`}
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
