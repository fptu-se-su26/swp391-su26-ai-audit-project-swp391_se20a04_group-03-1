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
import { Plus, Trash2, Building2, Loader2, Pencil, Search } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import JustValidate from "just-validate";
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

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch
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
        `${process.env.NEXT_PUBLIC_API_URL}/companies/?${params.toString()}`,
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
      toast.error(err.message || "Đã xảy ra lỗi khi tải danh sách công ty.");
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

  // Validate
  useEffect(() => {
    if (!showForm || !formRef.current) {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
      return;
    }

    const validator = new JustValidate(formRef.current, {
      errorFieldCssClass:
        "border-[#f3727f] focus:ring-[#f3727f] focus:border-[#f3727f]",
      errorLabelCssClass:
        "text-[#f3727f] text-[12px] font-bold uppercase tracking-wider mt-1 block",
    });

    validatorRef.current = validator;

    validator
      .addField("#companyCode", [
        { rule: "required", errorMessage: "Bắt buộc." },
        {
          rule: "customRegexp",
          value: /^[A-Z0-9-]{3,20}$/,
          errorMessage: "Chỉ gồm chữ in hoa, số và gạch ngang (3-20 ký tự).",
        },
      ])
      .addField("#companyName", [
        { rule: "required", errorMessage: "Bắt buộc." },
        {
          rule: "minLength",
          value: 3,
          errorMessage: "Từ 3 ký tự trở lên.",
        },
      ])
      .addField("#contactPerson", [
        { rule: "required", errorMessage: "Bắt buộc." },
      ])
      .addField("#contactPhone", [
        { rule: "required", errorMessage: "Bắt buộc." },
        {
          rule: "customRegexp",
          value: /^(0[3|5|7|8|9])[0-9]{8}$/,
          errorMessage: "Số điện thoại không hợp lệ.",
        },
      ])
      .addField("#email", [
        { rule: "required", errorMessage: "Bắt buộc." },
        { rule: "email", errorMessage: "Email không hợp lệ." },
      ])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const payload = {
          companyCode: formData
            .get("companyCode")
            ?.toString()
            .trim()
            .toUpperCase(),
          companyName: formData.get("companyName")?.toString().trim(),
          contactPerson: formData.get("contactPerson")?.toString().trim(),
          contactPhone: formData.get("contactPhone")?.toString().trim(),
          email: formData.get("email")?.toString().trim().toLowerCase(),
        };

        const loadingToast = toast.loading("Đang lưu công ty...");
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/companies/create`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );

          const result = await res.json();
          if (!res.ok || result.code === "error") {
            throw new Error(result.message || "Lỗi khi thêm công ty.");
          }

          toast.success("Thêm công ty thành công!", { id: loadingToast });
          setShowForm(false);
          fetchCompanies();
        } catch (err: any) {
          toast.error(err.message || "Không thể lưu thông tin công ty.", {
            id: loadingToast,
          });
        }
      });

    return () => {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
    };
  }, [showForm, fetchCompanies]);

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const loadingToast = toast.loading("Đang cập nhật trạng thái...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/status/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newStatus: newStatus }),
          credentials: "include",
        },
      );

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi cập nhật trạng thái.");
      }

      toast.success(
        `Đã chuyển trạng thái sang: ${
          newStatus === "Active" ? "Hoạt động" : "Đình chỉ"
        }`,
        { id: loadingToast },
      );
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật trạng thái.", {
        id: loadingToast,
      });
    }
  };

  // Soft Delete
  const handleDeleteCompany = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa công ty...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/companies/delete/${id}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi đưa vào thùng rác.");
      }

      toast.success("Đã chuyển công ty vào thùng rác.", { id: loadingToast });
      fetchCompanies();
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa công ty.", {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Quản lý công ty
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Quản lý danh sách các công ty vận tải và đối tác
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/companies/trash">
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#f3727f] dark:hover:border-[#f3727f] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <Trash2 className="h-4 w-4 text-[#f3727f]" />
              Thùng rác
            </Button>
          </Link>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 gap-2 border-none transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Thêm công ty
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-200 overflow-visible">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Thêm công ty mới
            </CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
              Điền thông tin chi tiết của công ty đối tác.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form ref={formRef} id="companyForm" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="companyCode"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Mã công ty
                  </Label>
                  <Input
                    id="companyCode"
                    name="companyCode"
                    placeholder="VD: TRANS-01"
                    className="uppercase bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="companyName"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Tên công ty
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    placeholder="CÔNG TY TNHH ABC"
                    className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="contactPerson"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Người đại diện / Liên hệ
                  </Label>
                  <Input
                    id="contactPerson"
                    name="contactPerson"
                    placeholder="Nguyễn Văn A"
                    className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="contactPhone"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Số điện thoại
                  </Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    placeholder="VD: 0987654321"
                    className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
                <div className="space-y-3 md:col-span-2">
                  <Label
                    htmlFor="email"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Email liên hệ
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contact@company.com"
                    className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px]"
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end pt-8">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] rounded-[500px] font-bold uppercase tracking-wider px-8"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] px-8 rounded-[500px]"
                >
                  Đăng ký
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
                Danh sách đối tác
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <Input
                  placeholder="Tìm mã, tên công ty, số điện thoại..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-[#ffffff] dark:bg-[#181818] border border-[#d6dbde] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
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
              <Loader2 className="h-10 w-10 animate-spin text-[#1ed760] mb-4" />
              <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">
                Đang tải dữ liệu...
              </p>
            </div>
          ) : companies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Building2 className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4" />
              <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px]">
                {searchQuery || statusFilter !== "ALL"
                  ? "Không tìm thấy công ty nào phù hợp."
                  : "Chưa có công ty nào trong hệ thống."}
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
                    <th className="px-6 py-4 font-black">Email</th>
                    <th className="px-6 py-4 font-black">Ngày tạo</th>
                    <th className="px-6 py-4 font-black">Trạng thái</th>
                    <th className="px-6 py-4 font-black text-right">
                      Hành động
                    </th>
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
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {comp.email}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {comp.createdAt
                          ? new Date(comp.createdAt).toLocaleDateString("vi-VN")
                          : "-"}
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
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {comp.status === "Suspended" && (
                            <Button
                              onClick={() =>
                                handleUpdateStatus(comp._id, "Active")
                              }
                              className="bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors"
                            >
                              Kích hoạt
                            </Button>
                          )}
                          {comp.status === "Active" && (
                            <Button
                              onClick={() =>
                                handleUpdateStatus(comp._id, "Suspended")
                              }
                              className="bg-[#f59e0b]/10 hover:bg-[#f59e0b] text-[#f59e0b] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors"
                            >
                              Đình chỉ
                            </Button>
                          )}
                          <Link href={`/admin/companies/edit/${comp._id}`}>
                            <Button
                              className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#1ed760] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#f3727f] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff]">
                                  Xóa công ty này?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                                  Công ty{" "}
                                  <span className="text-[#121212] dark:text-[#ffffff]">
                                    {comp.companyName}
                                  </span>{" "}
                                  sẽ được đưa vào thùng rác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider">
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteCompany(comp._id)}
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
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
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
