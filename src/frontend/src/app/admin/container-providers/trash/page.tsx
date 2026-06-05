"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface ContainerProvider {
  _id: string;
  code: string;
  name: string;
  bic_codes: string;
  contact_email: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export default function TrashContainerProvidersPage() {
  const [providers, setContainerProviders] = useState<ContainerProvider[]>([]);
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

  const fetchContainerProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (statusFilter && statusFilter !== "ALL")
        params.append("status", statusFilter);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/container-providers/trash?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data && data.code === "error") {
        throw new Error(data.message || "Lỗi từ máy chủ backend.");
      }

      const providerArray =
        data && data.data ? data.data : Array.isArray(data) ? data : [];
      setContainerProviders(providerArray);

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
    fetchContainerProviders();
  }, [fetchContainerProviders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  const handleRestoreContainerProvider = async (id: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/container-providers/restore/${id}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi khôi phục nhà cung cấp.");
      }

      setSuccessMsg("Khôi phục nhà cung cấp thành công.");
      fetchContainerProviders();
    } catch (err: any) {
      setError(err.message || "Không thể khôi phục nhà cung cấp.");
    }
  };

  const handleHardDeleteContainerProvider = async (id: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/container-providers/hard-delete/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi xóa vĩnh viễn.");
      }

      setSuccessMsg("Đã xóa vĩnh viễn nhà cung cấp.");
      fetchContainerProviders();
    } catch (err: any) {
      setError(err.message || "Không thể xóa vĩnh viễn nhà cung cấp.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Thùng rác - Nhà cung cấp
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Các nhà cung cấp đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/container-providers">
            <Button
              variant="outline"
              className="gap-2 text-slate-600 hover:text-slate-900 transition-colors dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800 dark:hover:text-white"
            >
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
              <CardTitle className="text-red-700 dark:text-red-400">
                Danh sách nhà cung cấp đã xóa
              </CardTitle>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Tìm mã, tên nhà cung cấp, số điện thoại..."
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
                <option value="ACTIVE">Đang hoạt động</option>
                <option value="SUSPENDED">Đình chỉ</option>
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
          ) : providers.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <Trash2 className="h-12 w-12 mx-auto text-red-300 dark:text-red-900/50 mb-2" />
              <p>
                {searchQuery || statusFilter !== "ALL"
                  ? "Không tìm thấy nhà cung cấp nào phù hợp trong thùng rác."
                  : "Thùng rác trống."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium text-left font-medium">
                      Mã CT
                    </th>
                    <th className="px-4 py-3 font-medium text-left font-medium">
                      Tên nhà cung cấp
                    </th>
                    <th className="px-4 py-3 font-medium text-left font-medium">
                      Các mã BIC
                    </th>
                    <th className="px-4 py-3 font-medium text-left font-medium">
                      Email liên hệ
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
                  {providers.map((comp) => (
                    <tr
                      key={comp._id}
                      className="bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium font-mono text-slate-900 dark:text-slate-100">
                        {comp.code}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">
                        {comp.name}
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs dark:text-slate-400">
                        {Array.isArray(comp.bic_codes)
                          ? comp.bic_codes.join(", ")
                          : comp.bic_codes || "-"}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {comp.contact_email}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            comp.status === "ACTIVE"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : comp.status === "SUSPENDED"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {comp.status === "ACTIVE"
                            ? "Hoạt động"
                            : comp.status === "SUSPENDED"
                              ? "Đình chỉ"
                              : "Ngừng HĐ"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() =>
                              handleRestoreContainerProvider(comp._id)
                            }
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
                                  Hành động này không thể hoàn tác. Nhà cung cấp
                                  {""}
                                  <span className="font-semibold text-slate-900 dark:text-slate-200">
                                    {comp.name}
                                  </span>
                                  {""}
                                  sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="dark:bg-slate-800 dark:text-slate-200 dark:border-slate-800 dark:hover:bg-slate-700">
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleHardDeleteContainerProvider(comp._id)
                                  }
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
          {totalPages > 1 && providers.length > 0 && (
            <div className="py-4 border-t border-red-100 dark:border-red-900/20">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
                      }
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className={
                          currentPage === i + 1
                            ? "cursor-pointer dark:bg-slate-800 dark:text-slate-100"
                            : "cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
                        }
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
                          : "cursor-pointer dark:text-slate-300 dark:hover:bg-slate-800"
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
