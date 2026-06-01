"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle,
  Pencil,
  Search,
  IdCard,
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

interface Driver {
  _id: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  companyId: {
    _id: string;
    companyCode: string;
    companyName: string;
  };
  createdAt: string;
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
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

  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/drivers/?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data.code === "error") {
        throw new Error(data.message || "Lỗi từ máy chủ backend.");
      }

      setDrivers(data.data || []);
      if (data.pagination) setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách tài xế.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/drivers/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.code === "success") {
        setSuccessMsg("Chuyển tài xế vào thùng rác thành công.");
        fetchDrivers();
      } else {
        setError(data.message || "Không thể xóa tài xế.");
      }
    } catch (err: any) {
      setError("Lỗi kết nối khi xóa tài xế.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Quản lý Tài Xế
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Danh sách tất cả tài xế và công ty trực thuộc
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/drivers/trash">
            <Button
              variant="outline"
              className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Thùng rác
            </Button>
          </Link>
          <Link href="/admin/drivers/create">
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Thêm Tài Xế
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-red-700 bg-red-100 rounded-lg dark:bg-red-900/30 dark:text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 p-4 text-emerald-700 bg-emerald-100 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle className="w-5 h-5" />
          <p>{successMsg}</p>
        </div>
      )}

      <Card className="border-slate-200 shadow-sm dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800/60">
          <CardTitle className="text-lg flex items-center gap-2">
            <IdCard className="w-5 h-5 text-blue-500" /> Danh sách Tài Xế
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm tên, mã CCCD..."
                className="pl-9 border-slate-200 dark:border-slate-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Mã CC/GPLX</th>
                    <th className="px-4 py-3 font-medium">Họ Tên</th>
                    <th className="px-4 py-3 font-medium">Điện Thoại</th>
                    <th className="px-4 py-3 font-medium">Công Ty</th>
                    <th className="px-4 py-3 font-medium text-right">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                          <span>Đang tải dữ liệu...</span>
                        </div>
                      </td>
                    </tr>
                  ) : drivers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-slate-500"
                      >
                        Không tìm thấy tài xế nào
                      </td>
                    </tr>
                  ) : (
                    drivers.map((driver) => (
                      <tr
                        key={driver._id}
                        className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                          {driver.driverId}
                        </td>
                        <td className="px-4 py-3">{driver.driverName}</td>
                        <td className="px-4 py-3">
                          {driver.driverPhone || "-"}
                        </td>
                        <td className="px-4 py-3">
                          {driver.companyId ? (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                              {driver.companyId.companyName}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/admin/drivers/edit/${driver._id}`}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xác nhận xóa tài xế?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Bạn có chắc chắn muốn xóa tài xế{" "}
                                    <b>{driver.driverName}</b>? Dữ liệu sẽ được
                                    chuyển vào thùng rác.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(driver._id)}
                                    className="bg-red-600 hover:bg-red-700"
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
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) setCurrentPage((p) => p - 1);
                        }}
                        className={
                          currentPage <= 1
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                          isActive={currentPage === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages)
                            setCurrentPage((p) => p + 1);
                        }}
                        className={
                          currentPage >= totalPages
                            ? "pointer-events-none opacity-50"
                            : ""
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
