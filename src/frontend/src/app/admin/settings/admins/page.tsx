"use client";

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
import {
  Plus,
  Trash2,
  Loader2,
  Pencil,
  Search,
  ShieldCheck,
  Mail,
  User,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import JustValidate from "just-validate";
import Link from "next/link";
import { CustomSelect } from "@/components/CustomSelect";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import toast from "react-hot-toast";

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

  const [addRole, setAddRole] = useState("Admin");
  const [addStatus, setAddStatus] = useState("active");
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState("");

  const [formElement, setFormElement] = useState<HTMLFormElement | null>(null);
  const [editFormElement, setEditFormElement] = useState<HTMLFormElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter]);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_URL}/settings/admins?page=${currentPage}&limit=10`;
      if (debouncedSearchQuery)
        url += `&search=${encodeURIComponent(debouncedSearchQuery)}`;
      if (statusFilter !== "all") url += `&status=${statusFilter}`;

      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();

      if (data.code === "success") {
        setAdmins(data.data);
        setTotalPages(data.totalPages || 1);
      } else {
        // Fallback for UI if API doesn't exist yet
        setAdmins([
          {
            _id: "1",
            fullName: "Quản trị viên Tổng",
            email: "admin@logiport.vn",
            role: "SuperAdmin",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
          {
            _id: "2",
            fullName: "Nguyễn Văn Kho",
            email: "kho@logiport.vn",
            role: "Admin",
            isActive: true,
            createdAt: new Date().toISOString(),
          },
        ]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setAdmins([
        {
          _id: "1",
          fullName: "Quản trị viên Tổng",
          email: "admin@logiport.vn",
          role: "SuperAdmin",
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          fullName: "Nguyễn Văn Kho",
          email: "kho@logiport.vn",
          role: "Admin",
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [currentPage, debouncedSearchQuery, statusFilter]);

  useEffect(() => {
    if (isAddModalOpen && formElement) {
      const validator = new JustValidate(formElement, {
        validateBeforeSubmitting: true,
      });

      validator
        .addField("#fullName", [
          { rule: "required", errorMessage: "Vui lòng nhập họ tên" },
        ])
        .addField("#email", [
          { rule: "required", errorMessage: "Vui lòng nhập email" },
          { rule: "email", errorMessage: "Email không hợp lệ" },
        ])
        .addField("#password", [
          { rule: "required", errorMessage: "Vui lòng nhập mật khẩu" },
          {
            rule: "password",
            errorMessage: "Mật khẩu tối thiểu 8 ký tự, 1 chữ cái và 1 số",
          },
        ])
        .onSuccess(async (event) => {
          event?.preventDefault();
          setIsAdding(true);
          const formData = new FormData(formElement!);
          const data = Object.fromEntries(formData.entries());

          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/settings/admins`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
              },
            );
            const result = await res.json();
            if (result.code === "success") {
              toast.success("Tạo tài khoản Admin thành công");
              setIsAddModalOpen(false);
              fetchAdmins();
            } else {
              toast.error(result.message || "Tạo thất bại");
            }
          } catch (err) {
            toast.error("Lỗi kết nối server");
          } finally {
            setIsAdding(false);
          }
        });

      return () => {
        validator.destroy();
      };
    }
  }, [isAddModalOpen, formElement]);

  useEffect(() => {
    if (isEditModalOpen && editFormElement && editingAdmin) {
      const validator = new JustValidate(editFormElement, {
        validateBeforeSubmitting: true,
      });

      validator
        .addField("#editFullName", [
          { rule: "required", errorMessage: "Vui lòng nhập họ tên" },
        ])
        .addField("#editEmail", [
          { rule: "required", errorMessage: "Vui lòng nhập email" },
          { rule: "email", errorMessage: "Email không hợp lệ" },
        ])
        .onSuccess(async (event) => {
          event?.preventDefault();
          setIsEditing(true);
          const formData = new FormData(editFormElement!);
          const data = Object.fromEntries(formData.entries());

          try {
            const res = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/settings/admins/${editingAdmin._id}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include",
              },
            );
            const result = await res.json();
            if (result.code === "success") {
              toast.success("Cập nhật thành công");
              setIsEditModalOpen(false);
              fetchAdmins();
            } else {
              toast.error(result.message || "Cập nhật thất bại");
            }
          } catch (err) {
            toast.error("Lỗi kết nối server");
          } finally {
            setIsEditing(false);
          }
        });

      return () => {
        validator.destroy();
      };
    }
  }, [isEditModalOpen, editingAdmin, editFormElement]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/admins/${id}/delete`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã chuyển vào thùng rác");
        if (admins.length === 1 && currentPage > 1)
          setCurrentPage(currentPage - 1);
        else fetchAdmins();
      } else {
        toast.error(data.message || "Xóa thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    }
  };

  const handleApprove = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/settings/admins/${id}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.code === "success") {
        toast.success(`Đã cập nhật trạng thái thành ${newStatus}`);
        fetchAdmins();
      } else {
        toast.error(data.message || "Cập nhật thất bại");
      }
    } catch (err) {
      toast.error("Lỗi kết nối server");
    }
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditRole(admin.role);
    setEditStatus(admin.isActive ? "active" : "pending");
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Quản lý Tài khoản Admin
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Quản lý, xét duyệt và phân quyền cho người dùng quản trị
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/settings" passHref>
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#121212] dark:hover:border-[#ffffff] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <ArrowLeft className="h-4 w-4" /> Cài đặt
            </Button>
          </Link>
          <Link href="/admin/settings/admins/trash" passHref>
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#f3727f] dark:hover:border-[#f3727f] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <Trash2 className="h-4 w-4 text-[#f3727f]" />
              Thùng rác
            </Button>
          </Link>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 gap-2 border-none transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-1" /> Thêm Admin
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
                Danh sách Admin
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <Input
                  placeholder="Tìm kiếm tài khoản, họ tên, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-[#ffffff] dark:bg-[#181818] border border-[#d6dbde] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:ring-0 focus-visible:border-[#1ed760] dark:focus-visible:border-[#1ed760] hover:border-[#1ed760] transition-colors"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 rounded-[500px] text-[12px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                    statusFilter === "all"
                      ? "bg-[#1ed760] text-[#121212]"
                      : "bg-[#eeeeee] dark:bg-[#272727] text-[#666666] dark:text-[#b3b3b3] hover:bg-[#e5e5e5] dark:hover:bg-[#333333]"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setStatusFilter("active")}
                  className={`px-4 py-2 rounded-[500px] text-[12px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                    statusFilter === "active"
                      ? "bg-[#1ed760] text-[#121212]"
                      : "bg-[#eeeeee] dark:bg-[#272727] text-[#666666] dark:text-[#b3b3b3] hover:bg-[#e5e5e5] dark:hover:bg-[#333333]"
                  }`}
                >
                  Đã duyệt
                </button>
                <button
                  onClick={() => setStatusFilter("pending")}
                  className={`px-4 py-2 rounded-[500px] text-[12px] font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-200 ${
                    statusFilter === "pending"
                      ? "bg-[#f59e0b] text-[#121212]"
                      : "bg-[#eeeeee] dark:bg-[#272727] text-[#666666] dark:text-[#b3b3b3] hover:bg-[#e5e5e5] dark:hover:bg-[#333333]"
                  }`}
                >
                  Chờ duyệt
                </button>
              </div>
            </div>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
              <tr>
                <th className="px-6 py-4 font-black">Tài khoản</th>
                <th className="px-6 py-4 font-black">Thông tin</th>
                <th className="px-6 py-4 font-black">Trạng thái</th>
                <th className="px-6 py-4 font-black">Vai trò</th>
                <th className="px-6 py-4 font-black text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#1ed760]" />
                    <p className="mt-2 font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">
                      Đang tải dữ liệu...
                    </p>
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500 dark:text-[#b3b3b3]"
                  >
                    <ShieldCheck className="h-16 w-16 mx-auto text-[#e5e5e5] dark:text-[#272727] mb-4" />
                    <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px]">
                      Không tìm thấy tài khoản admin nào.
                    </p>
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
                        <div className="w-10 h-10 rounded-full bg-[#1ed760]/10 flex items-center justify-center text-[#1db954] font-black uppercase">
                          {admin.fullName ? admin.fullName.substring(0, 2) : "AD"}
                        </div>
                        <div>
                          <p className="font-bold text-[#121212] dark:text-[#ffffff]">
                            {admin.fullName}
                          </p>
                          <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider">
                            {new Date(admin.createdAt).toLocaleDateString(
                              "vi-VN",
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        
                        <div className="flex items-center gap-2 text-[#666666] dark:text-[#b3b3b3] font-bold text-[12px]">
                          <Mail className="h-4 w-4" />
                          {admin.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {admin.isActive === true ? (
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border bg-[#1ed760]/10 text-[#1ed760] border-[#1ed760]/20">
                          Đã duyệt
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20">
                          Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border bg-[#e5e5e5] text-[#666666] border-[#cccccc] dark:bg-[#272727] dark:text-[#999999] dark:border-[#333333]">
                        {admin.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {admin.isActive === false && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors"
                            onClick={() => handleApprove(admin._id, "active")}
                            title="Duyệt tài khoản"
                          >
                            Duyệt ngay
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#1ed760] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                          onClick={() => openEditModal(admin)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#f3727f] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                              title="Xóa vĩnh viễn"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff]">
                                Xóa quản trị viên này?
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                                Tài khoản{" "}
                                <span className="text-[#121212] dark:text-[#ffffff]">
                                  {admin.fullName}
                                </span>{" "}
                                sẽ được đưa vào thùng rác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider">
                                Hủy
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(admin._id)}
                                className="bg-[#f3727f] hover:bg-[#d85663] text-white rounded-[500px] font-black uppercase tracking-wider"
                              >
                                Đồng ý
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
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50 text-[#121212] dark:text-[#ffffff]"
                        : "text-[#121212] dark:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-[#272727]"
                    }
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
                      className={
                        currentPage === i + 1
                          ? "bg-[#1ed760] text-[#121212] hover:bg-[#1db954]"
                          : "text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727]"
                      }
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
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50 text-[#121212] dark:text-[#ffffff]"
                        : "text-[#121212] dark:text-[#ffffff] hover:bg-gray-100 dark:hover:bg-[#272727]"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727] max-w-lg p-0 overflow-hidden">
          <DialogHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
            <DialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Thêm mới Admin
            </DialogTitle>
          </DialogHeader>
          <form ref={setFormElement} className="p-6 space-y-4">

            <div className="space-y-3">
              <Label
                htmlFor="fullName"
                className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
              >
                Họ và tên <span className="text-[#f3727f]">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="Nhập họ và tên..."
                className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:ring-0 focus-visible:border-[#1ed760] transition-colors"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="email"
                className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
              >
                Email liên hệ <span className="text-[#f3727f]">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập địa chỉ email..."
                className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:ring-0 focus-visible:border-[#1ed760] transition-colors"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="password"
                className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
              >
                Mật khẩu khởi tạo <span className="text-[#f3727f]">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu..."
                className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:ring-0 focus-visible:border-[#1ed760] transition-colors"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="role"
                className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
              >
                Vai trò
              </Label>
              <CustomSelect
                id="role"
                name="role"
                value={addRole}
                onChange={setAddRole}
                options={[
                  { value: "Admin", label: "Admin (Quản trị viên)" },
                  {
                    value: "Manager",
                    label: "Manager (Quản lý cấp trung)",
                  },
                  {
                    value: "SuperAdmin",
                    label: "Super Admin (Quản trị cấp cao)",
                  },
                ]}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="status"
                className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
              >
                Trạng thái khởi tạo
              </Label>
              <CustomSelect
                id="status"
                name="status"
                value={addStatus}
                onChange={setAddStatus}
                options={[
                  { value: "active", label: "Duyệt ngay (Active)" },
                  { value: "pending", label: "Chờ duyệt (Pending)" },
                ]}
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
                className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-8"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isAdding}
                className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-8 border-none transition-all duration-200"
              >
                {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tạo mới
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727] max-w-lg p-0 overflow-hidden">
          <DialogHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
            <DialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Cập nhật Admin
            </DialogTitle>
          </DialogHeader>
          <form ref={setEditFormElement} className="p-6 space-y-4">
            <div className="space-y-3">
              <Label
                htmlFor="editFullName"
                className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
              >
                Họ và tên <span className="text-[#f3727f]">*</span>
              </Label>
              <Input
                id="editFullName"
                name="fullName"
                defaultValue={editingAdmin?.fullName}
                className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:ring-0 focus-visible:border-[#1ed760] transition-colors"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="editEmail"
                className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
              >
                Email liên hệ <span className="text-[#f3727f]">*</span>
              </Label>
              <Input
                id="editEmail"
                name="email"
                type="email"
                defaultValue={editingAdmin?.email}
                className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:ring-0 focus-visible:border-[#1ed760] transition-colors"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="editRole"
                className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
              >
                Vai trò
              </Label>
              <CustomSelect
                id="editRole"
                name="role"
                value={editRole}
                onChange={setEditRole}
                options={[
                  { value: "Admin", label: "Admin (Quản trị viên)" },
                  {
                    value: "Manager",
                    label: "Manager (Quản lý cấp trung)",
                  },
                  {
                    value: "SuperAdmin",
                    label: "Super Admin (Quản trị cấp cao)",
                  },
                ]}
                className="w-full"
              />
            </div>
            <div className="space-y-3">
              <Label
                htmlFor="editStatus"
                className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
              >
                Trạng thái
              </Label>
              <CustomSelect
                id="editStatus"
                name="status"
                value={editStatus}
                onChange={setEditStatus}
                options={[
                  { value: "active", label: "Đã duyệt (Active)" },
                  { value: "pending", label: "Chờ duyệt (Pending)" },
                ]}
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-8"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isEditing}
                className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-8 border-none transition-all duration-200"
              >
                {isEditing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
