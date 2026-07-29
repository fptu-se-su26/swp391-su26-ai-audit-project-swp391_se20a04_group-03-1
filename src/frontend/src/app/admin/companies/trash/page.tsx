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
import { CustomSelect } from "@/components/CustomSelect";
import toast from "react-hot-toast";
import { AuditCell, AuditFields } from "@/components/ui/audit-cell";

interface Company extends AuditFields {
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
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (statusFilter && statusFilter !== "ALL")
        params.append("status", statusFilter);
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
      toast.error(err.message || "Đã xảy ra lỗi khi tải danh sách thùng rác.");
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
    const loadingToast = toast.loading("Đang khôi phục...");
    try {
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

      toast.success("Khôi phục công ty thành công.", { id: loadingToast });
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.message || "Không thể khôi phục công ty.", { id: loadingToast });
    }
  };

  const handleHardDeleteCompany = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa vĩnh viễn...");
    try {
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

      toast.success("Đã xóa vĩnh viễn công ty.", { id: loadingToast });
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa vĩnh viễn công ty.", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#f3727f] tracking-tight uppercase">
            Thùng rác - Công ty
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] mt-2 text-[16px]">
            Các công ty đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/companies">
            <Button variant="outline" className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#121212] dark:hover:border-[#ffffff] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible border-t-4 border-t-[#f3727f]">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
                Danh sách công ty đã xóa
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <Input
                  placeholder="Tìm mã, tên công ty, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-[#ffffff] dark:bg-[#181818] border border-[#d6dbde] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:ring-0 focus-visible:border-[#f3727f] dark:focus-visible:border-[#f3727f] hover:border-[#f3727f] transition-colors"
                />
              </div>

              <div className="relative z-10 w-[200px]">
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "ALL", label: "Tất cả trạng thái" },
                    { value: "Active", label: "Đang hoạt động" },
                    { value: "Suspended", label: "Đình chỉ" },
                    { value: "Inactive", label: "Ngừng hoạt động" },
                  ]}
                  placeholder="Mọi trạng thái"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                  setStatusFilter("ALL");
                }}
                disabled={!searchQuery && statusFilter === "ALL"}
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
              <Loader2 className="h-10 w-10 animate-spin text-[#f3727f] mb-4" />
              <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Trash2 className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4" />
              <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px]">
                {searchQuery || statusFilter !== "ALL"
                  ? "Không tìm thấy công ty nào phù hợp trong thùng rác."
                  : "Thùng rác trống."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                  <tr>
                    <th className="px-6 py-4 font-black">Mã CT</th>
                    <th className="px-6 py-4 font-black">Tên công ty</th>
                    <th className="px-6 py-4 font-black">Người liên hệ</th>
                    <th className="px-6 py-4 font-black">Điện thoại</th>
                    <th className="px-6 py-4 font-black">Trạng thái</th>
                    <th className="px-6 py-4 font-black">Nhật ký sửa đổi</th>
                    <th className="px-6 py-4 font-black text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                  {companies.map((comp) => (
                    <tr
                      key={comp._id}
                      className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                        {comp.companyCode}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                        {comp.companyName}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {comp.contactPerson}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {comp.contactPhone}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border ${
                            comp.status === "Active"
                              ? "bg-[#1ed760]/10 text-[#1ed760] border-[#1ed760]/20"
                              : comp.status === "Suspended"
                              ? "bg-[#f3727f]/10 text-[#f3727f] border-[#f3727f]/20"
                              : "bg-[#e5e5e5] text-[#666666] border-[#cccccc] dark:bg-[#272727] dark:text-[#999999] dark:border-[#333333]"
                          }`}
                        >
                          {comp.status === "Active"
                            ? "Hoạt động"
                            : comp.status === "Suspended"
                            ? "Đình chỉ"
                            : "Ngừng HĐ"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AuditCell
                          createdBy={comp.createdBy}
                          updatedBy={comp.updatedBy}
                          createdAt={comp.createdAt}
                          updatedAt={comp.updatedAt}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            onClick={() => handleRestoreCompany(comp._id)}
                            className="bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors"
                            title="Khôi phục"
                          >
                            <RefreshCcw className="h-3 w-3 mr-1" />
                            Khôi phục
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                className="bg-[#f3727f]/10 hover:bg-[#f3727f] hover:text-[#121212] text-[#f3727f] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                                title="Xóa vĩnh viễn"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff]">
                                  Xác nhận xóa vĩnh viễn?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                                  Hành động này không thể hoàn tác. Công ty <span className="text-[#121212] dark:text-[#ffffff]">{comp.companyName}</span> sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider">
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleHardDeleteCompany(comp._id)}
                                  className="bg-[#f3727f] hover:bg-[#d85663] text-white rounded-[500px] font-black uppercase tracking-wider"
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
