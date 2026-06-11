"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ArrowLeft, Loader2, RefreshCcw, Search, Trash2, UserX } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
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

interface AdminUser {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  deletedAt: string;
}

export default function AdminsTrashPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const fetchTrashAdmins = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/admins/trash?page=${currentPage}&limit=10`;
      if (debouncedSearchQuery) url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      
      if (data.code === "success") {
        setAdmins(data.data);
        setTotalPages(data.totalPages || 1);
      } else {
        setAdmins([]);
      }
    } catch (err) {
      console.error(err);
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashAdmins();
  }, [currentPage, debouncedSearchQuery]);

  const handleRestore = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/${id}/restore`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Khôi phục thành công");
        if (admins.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
        else fetchTrashAdmins();
      } else {
        toast.error(data.message || "Khôi phục thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    }
  };

  const handlePermanentDelete = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admins/${id}/force`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Xóa vĩnh viễn thành công");
        if (admins.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
        else fetchTrashAdmins();
      } else {
        toast.error(data.message || "Xóa thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 bg-[#f8f8f8] dark:bg-[#121212] min-h-screen transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#181818] p-6 rounded-xl shadow-[0_0_0.5px_rgba(0,0,0,0.14),_0_1px_1px_rgba(0,0,0,0.24)] dark:border dark:border-[#272727]">
        <div className="flex items-center gap-4">
          <Link href="/admin/settings/admins" passHref>
            <Button
              variant="outline"
              className="bg-[#eeeeee] hover:bg-[#e5e5e5] dark:bg-[#272727] dark:hover:bg-[#333333] text-[#121212] dark:text-[#ffffff] rounded-[500px] font-bold px-4 border-none transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" /> Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">Thùng rác Admin</h1>
            <p className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">Khôi phục hoặc xóa vĩnh viễn tài khoản quản trị</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible">
        <CardContent className="p-4 sm:p-6">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
            <Input
              type="text"
              placeholder="Tìm kiếm tài khoản đã xóa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-[#ffffff] dark:bg-[#181818] border border-[#d6dbde] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:ring-0 focus-visible:border-[#1ed760] dark:focus-visible:border-[#1ed760] hover:border-[#1ed760] transition-colors w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
              <tr>
                <th className="px-6 py-4 font-black">Tài khoản</th>
                <th className="px-6 py-4 font-black">Thông tin</th>
                <th className="px-6 py-4 font-black">Ngày xóa</th>
                <th className="px-6 py-4 font-black text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#1ed760]" />
                    <p className="mt-2 font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">Đang tải thùng rác...</p>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-[#b3b3b3]">
                    <UserX className="h-16 w-16 mx-auto text-[#e5e5e5] dark:text-[#272727] mb-4" />
                    <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px]">Thùng rác trống.</p>
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr
                    key={admin._id}
                    className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#f8f8f8] dark:bg-[#272727] flex items-center justify-center text-[#666666] dark:text-[#b3b3b3] font-black uppercase">
                          {admin.username.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-bold text-[#666666] dark:text-[#b3b3b3] line-through">{admin.username}</p>
                          <span className="inline-flex items-center justify-center px-2 py-0.5 mt-1 rounded-[500px] text-[10px] font-black uppercase tracking-wider border bg-[#e5e5e5] text-[#666666] border-[#cccccc] dark:bg-[#272727] dark:text-[#999999] dark:border-[#333333]">
                            {admin.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#666666] dark:text-[#b3b3b3]">{admin.fullName}</p>
                      <p className="text-[12px] font-bold text-[#999999] dark:text-[#666666]">{admin.email}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#999999] dark:text-[#666666] text-[12px]">
                      {admin.deletedAt ? new Date(admin.deletedAt).toLocaleDateString("vi-VN") : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          onClick={() => handleRestore(admin._id)}
                          className="bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors"
                          title="Khôi phục"
                        >
                          <RefreshCcw className="h-3 w-3 mr-1.5" /> Khôi phục
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#f3727f] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff]">Xóa vĩnh viễn?</AlertDialogTitle>
                              <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                                Hành động này không thể hoàn tác. Tài khoản <span className="text-[#121212] dark:text-[#ffffff]">{admin.username}</span> sẽ bị xóa hoàn toàn khỏi hệ thống dữ liệu.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider">Hủy</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handlePermanentDelete(admin._id)}
                                className="bg-[#f3727f] hover:bg-[#d85663] text-white rounded-[500px] font-black uppercase tracking-wider transition-colors"
                              >
                                Xóa vĩnh viễn
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
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="border-t border-gray-100 dark:border-[#272727] p-4 bg-white dark:bg-[#181818] flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage((p) => p - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50 text-[#121212] dark:text-[#ffffff]" : "text-[#121212] dark:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-[#272727]"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(i + 1);
                      }}
                      className={currentPage === i + 1 ? "bg-[#1ed760] text-[#121212] hover:bg-[#1db954]" : "text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727]"}
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
                      if (currentPage < totalPages) setCurrentPage((p) => p + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50 text-[#121212] dark:text-[#ffffff]" : "text-[#121212] dark:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-[#272727]"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}
