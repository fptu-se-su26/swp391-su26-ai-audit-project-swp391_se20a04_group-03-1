"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Trash2, Pencil, Search, ArrowLeft, Loader2 } from "lucide-react";
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

export default function ClientRolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [editingRole, setEditingRole] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  const [formData, setFormData] = useState({
    roleCode: "",
    roleName: "",
    description: "",
  });

  const fetchRoles = async (page = 1) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(debouncedSearchQuery && { search: debouncedSearchQuery })
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/client-roles?${queryParams}`, {
        credentials: "include"
      });
      const data = await res.json();
      if (data.code === "success") {
        setRoles(data.data);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách loại hình");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchRoles(currentPage);
  }, [currentPage, debouncedSearchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roleCode || !formData.roleName) {
      toast.error("Vui lòng nhập Mã và Tên loại hình doanh nghiệp.");
      return;
    }

    const loadingToast = toast.loading("Đang xử lý...");
    try {
      const url = editingRole 
        ? `${process.env.NEXT_PUBLIC_API_URL}/settings/client-roles/${editingRole._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/settings/client-roles`;
        
      const res = await fetch(url, {
        method: editingRole ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const data = await res.json();

      if (data.code === "success") {
        toast.success(data.message, { id: loadingToast });
        fetchRoles(currentPage);
        setShowForm(false);
        setEditingRole(null);
        setFormData({ roleCode: "", roleName: "", description: "" });
      } else {
        toast.error(data.message, { id: loadingToast });
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau", { id: loadingToast });
    }
  };

  const handleEdit = (role: any) => {
    setEditingRole(role);
    setFormData({ roleCode: role.roleCode, roleName: role.roleName, description: role.description });
    setShowForm(true);
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
      const loadingToast = toast.loading("Đang cập nhật trạng thái...");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/client-roles/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.message, { id: loadingToast });
        fetchRoles(currentPage);
      } else {
        toast.error(data.message, { id: loadingToast });
      }
    } catch (error) {
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  const handleDelete = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/client-roles/${id}/delete`, {
        method: "PATCH",
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
    } catch (error) {
      toast.error("Không thể xóa loại hình", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="outline" size="icon" className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-full transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Loại hình Doanh nghiệp
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Cấu hình các Role (vai trò) để đối tác/khách hàng lựa chọn khi đăng ký tài khoản.
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <Link href="/admin/settings/client-roles/trash">
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#f3727f] dark:hover:border-[#f3727f] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <Trash2 className="h-4 w-4 text-[#f3727f]" />
              Thùng rác
            </Button>
          </Link>
          <Button
            onClick={() => {
              setEditingRole(null);
              setFormData({ roleCode: "", roleName: "", description: "" });
              setShowForm(!showForm);
            }}
            className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 gap-2 border-none transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Thêm loại hình
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              {editingRole ? "Chỉnh sửa Loại hình" : "Thêm mới Loại hình"}
            </CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
              Tùy chỉnh thông tin phân loại doanh nghiệp.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Mã phân loại (Code)
                  </Label>
                  <Input
                    value={formData.roleCode}
                    onChange={(e) => setFormData({ ...formData, roleCode: e.target.value.toUpperCase() })}
                    placeholder="VD: TRANSPORT, SHIPPING_LINE"
                    className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Tên hiển thị
                  </Label>
                  <Input
                    value={formData.roleName}
                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                    placeholder="VD: Công ty Vận tải"
                    className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Mô tả / Ghi chú
                  </Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả chức năng của loại hình này..."
                    className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end pt-8">
                <Button
                  type="button"
                  onClick={() => { setShowForm(false); setEditingRole(null); }}
                  variant="outline"
                  className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-8"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] px-8 rounded-[500px]"
                >
                  {editingRole ? "Cập nhật" : "Lưu loại hình"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Danh sách phân loại
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
              <Input
                placeholder="Tìm mã, tên phân loại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-[#ffffff] dark:bg-[#181818] border border-[#d6dbde] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                <tr>
                  <th className="px-6 py-4 font-black">Mã (Code)</th>
                  <th className="px-6 py-4 font-black">Tên loại hình</th>
                  <th className="px-6 py-4 font-black">Mô tả</th>
                  <th className="px-6 py-4 font-black">Trạng thái</th>
                  <th className="px-6 py-4 font-black text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10">
                      <div className="flex flex-col items-center justify-center">
                        <Loader2 className="h-10 w-10 animate-spin text-[#1ed760] mb-4" />
                        <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">
                          Đang tải dữ liệu...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center font-bold text-[#666666] dark:text-[#b3b3b3]">
                      Không tìm thấy loại hình nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr
                      key={role._id}
                      className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group"
                    >
                      <td className="px-6 py-4 font-black text-[#121212] dark:text-[#ffffff] tracking-wider">
                        {role.roleCode}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                        {role.roleName}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3] max-w-[300px] truncate">
                        {role.description}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border ${
                            role.status === "Active"
                              ? "bg-[#1ed760]/10 text-[#1ed760] border-[#1ed760]/20"
                              : "bg-[#e5e5e5] text-[#666666] border-[#cccccc] dark:bg-[#272727] dark:text-[#999999] dark:border-[#333333]"
                          }`}
                        >
                          {role.status === "Active" ? "Hoạt động" : "Tạm ẩn"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {["transport", "provider"].includes(role.roleCode.toLowerCase()) ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">
                            Hệ Thống
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              onClick={() => handleToggleStatus(role._id, role.status)}
                              className={`rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors ${
                                role.status === "Active" 
                                ? "bg-[#f59e0b]/10 hover:bg-[#f59e0b] text-[#f59e0b] hover:text-[#121212]"
                                : "bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212]"
                              }`}
                            >
                              {role.status === "Active" ? "Ẩn" : "Hiện"}
                            </Button>
                            <Button
                              onClick={() => handleEdit(role)}
                              className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#1ed760] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#f3727f] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                                  title="Đưa vào thùng rác"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase">
                                    Xác nhận xóa
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
                                    Bạn có chắc chắn muốn đưa loại hình doanh nghiệp{" "}
                                    <span className="text-[#f3727f]">{role.roleName}</span> vào thùng rác?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="mt-6 gap-3">
                                  <AlertDialogCancel className="bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6">
                                    Hủy
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(role._id)}
                                    className="bg-[#f3727f] hover:bg-[#e05b68] text-[#121212] rounded-[500px] font-black uppercase tracking-wider px-6 border-none"
                                  >
                                    Xóa ngay
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e5e5] dark:border-[#272727]">
              <div className="text-sm font-bold text-[#666666] dark:text-[#b3b3b3]">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-[500px] font-bold uppercase tracking-wider text-[11px] h-8 px-4"
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-[500px] font-bold uppercase tracking-wider text-[11px] h-8 px-4"
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
