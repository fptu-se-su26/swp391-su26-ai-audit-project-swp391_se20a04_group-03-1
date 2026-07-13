"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search, ArrowLeft, RefreshCcw, Trash2, Loader2 } from "lucide-react";
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
import Link from "next/link";
import toast from "react-hot-toast";
import { RequirePermission } from "@/lib/permissions";

const API = process.env.NEXT_PUBLIC_API_URL;

function RolesTrashInner() {
  const [roles, setRoles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRoles = async (page = 1) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(debounced && { search: debounced }),
      });
      const res = await fetch(`${API}/settings/roles/trash?${qs}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        setRoles(data.data);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      toast.error("Không thể tải danh sách thùng rác");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    fetchRoles(currentPage);
  }, [currentPage, debounced]);

  const handleRestore = async (id: string) => {
    const loadingToast = toast.loading("Đang khôi phục...");
    try {
      const res = await fetch(`${API}/settings/roles/${id}/restore`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.message, { id: loadingToast });
        fetchRoles(currentPage);
      } else {
        toast.error(data.message, { id: loadingToast });
      }
    } catch {
      toast.error("Không thể khôi phục vai trò", { id: loadingToast });
    }
  };

  const handleHardDelete = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa vĩnh viễn...");
    try {
      const res = await fetch(`${API}/settings/roles/${id}/hard-delete`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.message, { id: loadingToast });
        if (roles.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
        else fetchRoles(currentPage);
      } else {
        toast.error(data.message, { id: loadingToast });
      }
    } catch {
      toast.error("Không thể xóa vĩnh viễn", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings/roles">
          <Button variant="outline" size="icon" className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-full transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-[#f3727f] tracking-tight uppercase">
            Thùng rác Vai trò
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] mt-2 text-[16px]">
            Khôi phục hoặc xóa vĩnh viễn các vai trò đã xóa.
          </p>
        </div>
      </div>

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Danh sách đã xóa
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
              <Input
                placeholder="Tìm mã, tên vai trò..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-[#ffffff] dark:bg-[#181818] border border-[#d6dbde] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:ring-0 focus-visible:border-[#1ed760] transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                <tr>
                  <th className="px-6 py-4 font-black">Mã vai trò</th>
                  <th className="px-6 py-4 font-black">Tên</th>
                  <th className="px-6 py-4 font-black">Ngày xóa</th>
                  <th className="px-6 py-4 font-black text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center">
                      <Loader2 className="h-10 w-10 animate-spin text-[#f3727f] mx-auto" />
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-20 text-center">
                      <Trash2 className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4 mx-auto" />
                      <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px]">
                        Thùng rác trống.
                      </p>
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role._id} className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group">
                      <td className="px-6 py-4 font-black text-[#121212] dark:text-[#ffffff] tracking-wider">
                        {role.roleCode}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                        {role.roleName}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#f59e0b]">
                        {role.deletedAt ? new Date(role.deletedAt).toLocaleString("vi-VN") : "-"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button onClick={() => handleRestore(role._id)} className="bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors">
                            <RefreshCcw className="h-3 w-3 mr-1" />
                            Khôi phục
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button className="bg-[#f3727f]/10 hover:bg-[#f3727f] hover:text-[#121212] text-[#f3727f] rounded-[500px] h-8 w-8 p-0 border-none transition-colors" title="Xóa vĩnh viễn">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase">
                                  Xóa vĩnh viễn
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
                                  Xóa vĩnh viễn vai trò <span className="text-[#f3727f]">{role.roleName}</span>? Hành động không thể hoàn tác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="mt-6 gap-3">
                                <AlertDialogCancel className="bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6">
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleHardDelete(role._id)} className="bg-[#f3727f] hover:bg-[#e05b68] text-[#121212] rounded-[500px] font-black uppercase tracking-wider px-6 border-none">
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e5e5] dark:border-[#272727]">
              <div className="text-sm font-bold text-[#666666] dark:text-[#b3b3b3]">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-[500px] font-bold uppercase tracking-wider text-[11px] h-8 px-4">Trước</Button>
                <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-[500px] font-bold uppercase tracking-wider text-[11px] h-8 px-4">Sau</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function RolesTrashPage() {
  return (
    <RequirePermission resource="settings.roles" action="delete">
      <RolesTrashInner />
    </RequirePermission>
  );
}
