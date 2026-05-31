"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Trash2,
  Building2,
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

interface Company {
  _id: string;
  companyCode: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  status: "Active" | "Inactive" | "Suspended";
  createdAt: string;
}

export default function TrashCompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/trash?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data && data.code === "error") {
        throw new Error(data.message || "Lỗi từ máy chủ backend.");
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
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách thùng rác.");
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

  const handleRestoreCompany = async (id: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/restore/${id}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi khôi phục công ty.");
      }

      setSuccessMsg("Khôi phục công ty thành công.");
      fetchCompanies();
    } catch (err: any) {
      setError(err.message || "Không thể khôi phục công ty.");
    }
  };

  const handleHardDeleteCompany = async (id: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/hard-delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi xóa vĩnh viễn.");
      }

      setSuccessMsg("Đã xóa vĩnh viễn công ty.");
      fetchCompanies();
    } catch (err: any) {
      setError(err.message || "Không thể xóa vĩnh viễn công ty.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Thùng rác - Công ty
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Các công ty đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/companies">
            <Button variant="outline" className="gap-2 text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
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

      <Card className="border border-red-200 shadow-md dark:border-red-900/30">
        <CardHeader className="bg-red-50/50 border-b border-red-100 dark:bg-red-900/10 dark:border-red-900/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <CardTitle className="text-red-700 dark:text-red-400">Danh sách công ty đã xóa</CardTitle>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Tìm mã, tên công ty, số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-white w-full border-red-200 focus-visible:ring-red-500 dark:bg-slate-950 dark:border-red-900/50 dark:text-slate-100 dark:placeholder:text-slate-600"
              />
            </div>
            <div className="flex w-full md:w-auto items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full md:w-40 rounded-md border border-red-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-slate-950 dark:border-red-900/50 dark:text-slate-100 dark:focus-visible:ring-red-400"
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
                disabled={!searchQuery && statusFilter === "ALL"}
                className="whitespace-nowrap border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-red-600 dark:text-red-500 mb-2" />
              <p>Đang tải danh sách thùng rác...</p>
            </div>
          ) : companies.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Trash2 className="h-12 w-12 mx-auto text-red-300 dark:text-red-900/50 mb-2" />
              <p>
                {searchQuery || statusFilter !== "ALL"
                  ? "Không tìm thấy công ty nào phù hợp trong thùng rác."
                  : "Thùng rác trống."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-red-50/70 text-slate-500 dark:bg-red-900/30 dark:text-slate-400 dark:border-red-900/20">
                    <th className="text-left py-3 px-4 font-medium">Mã CT</th>
                    <th className="text-left py-3 px-4 font-medium">Tên công ty</th>
                    <th className="text-left py-3 px-4 font-medium">Người liên hệ</th>
                    <th className="text-left py-3 px-4 font-medium">Điện thoại</th>
                    <th className="text-left py-3 px-4 font-medium">Trạng thái</th>
                    <th className="text-right py-3 px-4 font-medium">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((comp) => (
                    <tr
                      key={comp._id}
                      className="border-b hover:bg-red-50/50 transition-colors dark:hover:bg-red-900/20 dark:border-red-900/20"
                    >
                      <td className="py-4 px-4 font-medium font-mono text-slate-900 dark:text-slate-100">
                        {comp.companyCode}
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {comp.companyName}
                      </td>
                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        {comp.contactPerson}
                      </td>
                      <td className="py-4 px-4 text-slate-500 font-mono text-xs dark:text-slate-400">
                        {comp.contactPhone}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            comp.status === "Active"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : comp.status === "Suspended"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {comp.status === "Active"
                            ? "Hoạt động"
                            : comp.status === "Suspended"
                              ? "Đình chỉ"
                              : "Ngừng HĐ"}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => handleRestoreCompany(comp._id)}
                            variant="outline"
                            size="sm"
                            className="text-xs text-blue-600 hover:bg-blue-50 border-blue-200/50 dark:border-blue-900/50 dark:text-blue-500 dark:hover:bg-blue-950/50"
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
                                className="text-xs text-red-600 hover:bg-red-50 border-red-200/50 dark:border-red-900/50 dark:text-red-500 dark:hover:bg-red-950/50"
                                title="Xóa vĩnh viễn"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="dark:bg-slate-900 dark:border-slate-800">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="dark:text-slate-100">
                                  Xác nhận xóa vĩnh viễn?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="dark:text-slate-400">
                                  Hành động này không thể hoàn tác. Công ty{" "}
                                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {comp.companyName}
                                  </span>{" "}
                                  sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700">Hủy</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleHardDeleteCompany(comp._id)}
                                  className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
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
          {totalPages > 1 && companies.length > 0 && (
            <div className="py-4 border-t border-red-100 dark:border-red-900/20">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className={currentPage === i + 1 ? "cursor-pointer dark:bg-slate-800 dark:text-slate-100" : "cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"}
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
