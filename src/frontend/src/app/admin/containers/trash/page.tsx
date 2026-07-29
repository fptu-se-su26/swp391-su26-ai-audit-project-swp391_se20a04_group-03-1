"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Trash2, Archive, Search, Loader2, RotateCcw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/CustomSelect";
import Link from "next/link";
import { AuditCell, AuditFields } from "@/components/ui/audit-cell";
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

interface Container extends AuditFields {
  _id: string;
  number: string;
  type: string;
  status: string;
  portStatus: string;
  providerId: {
    _id: string;
    code: string;
    name: string;
  };
  createdAt: string;
}

export default function AdminTrashContainersPage() {
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [portStatusFilter, setPortStatusFilter] = useState("ALL");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchContainers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (typeFilter && typeFilter !== "ALL") params.append("type", typeFilter);
      if (statusFilter && statusFilter !== "ALL") params.append("status", statusFilter);
      if (portStatusFilter && portStatusFilter !== "ALL") params.append("portStatus", portStatusFilter);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/containers/trash?${params.toString()}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data && data.code === "success") {
        setContainers(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.totalItems || 0);
      } else {
        toast.error(data.message || "Lỗi khi lấy dữ liệu.");
      }
    } catch (err: any) {
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, typeFilter, statusFilter, portStatusFilter, currentPage]);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, typeFilter, statusFilter, portStatusFilter]);

  const handleRestore = async (id: string) => {
    const loadingToast = toast.loading("Đang khôi phục...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/containers/restore/${id}`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.message || "Đã khôi phục thành công.", { id: loadingToast });
        fetchContainers();
      } else {
        toast.error(data.message || "Không thể khôi phục.", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Lỗi kết nối.", { id: loadingToast });
    }
  };

  const handleHardDelete = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa vĩnh viễn...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/containers/hard-delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.message || "Đã xóa vĩnh viễn.", { id: loadingToast });
        fetchContainers();
      } else {
        toast.error(data.message || "Không thể xóa.", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Lỗi kết nối.", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Quản lý container
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1 uppercase tracking-wider text-[12px]">
            Quản lý container đã bị xóa
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/containers">
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2 px-6 h-12"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible border-t-4 border-t-[#f3727f]">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-3">
                <Archive className="h-6 w-6 text-[#f3727f]" />
                Thùng rác
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-[220px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <Input
                  placeholder="Tìm mã container..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px]"
                />
              </div>
              <div className="relative z-10 w-[180px]">
                <CustomSelect
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={[
                    { value: "ALL", label: "Tất cả kích thước" },
                    { value: "20ft", label: "20ft Standard" },
                    { value: "40ft", label: "40ft Standard" },
                    { value: "40ft HC", label: "40ft High Cube" },
                    { value: "45ft", label: "45ft High Cube" },
                  ]}
                />
              </div>
              <div className="relative z-10 w-[140px]">
                <CustomSelect
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: "ALL", label: "Mọi tình trạng" },
                    { value: "Hàng", label: "Có hàng" },
                    { value: "Rỗng", label: "Rỗng" },
                  ]}
                />
              </div>
              <div className="relative z-10 w-[160px]">
                <CustomSelect
                  value={portStatusFilter}
                  onChange={setPortStatusFilter}
                  options={[
                    { value: "ALL", label: "Mọi trạng thái cảng" },
                    { value: "Chưa nhập cảng", label: "Chưa nhập cảng" },
                    { value: "Đã nhập cảng", label: "Đã nhập cảng" },
                    { value: "Đang lưu bãi", label: "Đang lưu bãi" },
                    { value: "Đã xuất cảng", label: "Đã xuất cảng" },
                  ]}
                />
              </div>

              <Button
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                  setTypeFilter("ALL");
                  setStatusFilter("ALL");
                  setPortStatusFilter("ALL");
                }}
                disabled={!searchQuery && typeFilter === "ALL" && statusFilter === "ALL" && portStatusFilter === "ALL"}
                className="bg-[#eeeeee] hover:bg-[#e5e5e5] dark:bg-[#272727] dark:hover:bg-[#333333] text-[#121212] dark:text-[#ffffff] rounded-[500px] font-bold h-10 px-4 uppercase tracking-wider text-[12px] border-none"
              >
                Xóa lọc
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-[#666666] dark:text-[#999999] uppercase tracking-wider bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                <tr>
                  <th className="px-6 py-4 font-black">Số container</th>
                  <th className="px-6 py-4 font-black">Hãng tàu</th>
                  <th className="px-6 py-4 font-black">Kích thước</th>
                  <th className="px-6 py-4 font-black">Tình trạng</th>
                  <th className="px-6 py-4 font-black">Trạng thái cảng</th>
                  <th className="px-6 py-4 font-black">Nhật ký sửa đổi</th>
                  <th className="px-6 py-4 font-black text-right w-32">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="h-6 w-6 animate-spin text-[#1ed760] mx-auto mb-2" />
                      <p className="text-[#666666] font-bold uppercase tracking-wider text-[12px]">
                        Đang tải dữ liệu...
                      </p>
                    </td>
                  </tr>
                ) : containers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-[#666666] dark:text-[#999999] font-bold uppercase tracking-wider text-[12px]">
                      Thùng rác trống
                    </td>
                  </tr>
                ) : (
                  containers.map((container) => (
                    <tr
                      key={container._id}
                      className="group bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors"
                    >
                      <td className="px-6 py-4 font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
                        {container.number}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {container.providerId ? container.providerId.code : "N/A"}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3] uppercase">
                        {container.type}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wider ${
                            container.status === "Hàng"
                              ? "bg-[#1ed760]/10 text-[#1ed760]"
                              : "bg-[#e5e5e5] text-[#121212] dark:bg-[#272727] dark:text-[#ffffff]"
                          }`}
                        >
                          {container.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wider ${
                            container.portStatus === "Chưa nhập cảng"
                              ? "bg-[#e5e5e5] text-[#121212] dark:bg-[#272727] dark:text-[#ffffff]"
                              : container.portStatus === "Đang lưu bãi"
                              ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                              : "bg-[#3b82f6]/10 text-[#3b82f6]"
                          }`}
                        >
                          {container.portStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AuditCell
                          createdBy={container.createdBy}
                          updatedBy={container.updatedBy}
                          createdAt={container.createdAt}
                          updatedAt={container.updatedAt}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            title="Khôi phục"
                            onClick={() => handleRestore(container._id)}
                            className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#1ed760] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </Button>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                title="Xóa vĩnh viễn"
                                className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#f3727f] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase">
                                  Xóa vĩnh viễn
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
                                  Bạn có chắc chắn muốn xóa vĩnh viễn container{" "}
                                  <span className="text-[#f3727f] font-black uppercase">
                                    {container.number}
                                  </span>
                                  ? Hành động này không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-6 gap-3">
                                <AlertDialogCancel className="bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6">
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleHardDelete(container._id)}
                                  className="bg-[#f3727f] hover:bg-[#d95b66] text-[#ffffff] font-black uppercase tracking-wider px-6 rounded-[500px] border-none"
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

          {!loading && totalPages > 1 && containers.length > 0 && (
            <div className="py-6 border-t border-[#e5e5e5] dark:border-[#272727] bg-[#f8f8f8] dark:bg-[#121212] flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={`cursor-pointer rounded-[500px] font-bold ${currentPage === 1 ? "opacity-50 pointer-events-none" : "hover:bg-[#e5e5e5] dark:hover:bg-[#272727]"}`}
                    />
                  </PaginationItem>

                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className={`cursor-pointer rounded-[500px] font-black ${currentPage === i + 1 ? "bg-[#1ed760] text-[#121212] border-[#1ed760]" : "hover:bg-[#e5e5e5] dark:hover:bg-[#272727]"}`}
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
                      className={`cursor-pointer rounded-[500px] font-bold ${currentPage === totalPages ? "opacity-50 pointer-events-none" : "hover:bg-[#e5e5e5] dark:hover:bg-[#272727]"}`}
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
