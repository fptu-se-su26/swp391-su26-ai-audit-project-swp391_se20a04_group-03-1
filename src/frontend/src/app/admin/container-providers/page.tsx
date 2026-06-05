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
  Building2,
  Loader2,
  Pencil,
  Search,
} from "lucide-react";
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

interface Provider {
  _id: string;
  code: string;
  name: string;
  bic_codes: string[];
  contact_email: string;
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
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
  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (statusFilter && statusFilter !== "ALL")
        params.append("status", statusFilter);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/container-providers/?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data && data.code === "error") {
        throw new Error(data.message || "Lỗi từ máy chủ backend.");
      }

      const providerArray =
        data && data.data ? data.data : Array.isArray(data) ? data : [];
      setProviders(providerArray);

      if (data && data.pagination) {
        setTotalPages(data.pagination.totalPages);
      } else {
        setTotalPages(1);
      }
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải danh sách hãng tàu.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

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
      errorFieldCssClass: "border-[#f3727f] focus:ring-[#f3727f] focus:border-[#f3727f]",
      errorLabelCssClass: "text-[#f3727f] text-[12px] font-bold uppercase tracking-wider mt-1 block",
    });

    validatorRef.current = validator;

    validator
      .addField("#code", [
        { rule: "required", errorMessage: "Bắt buộc." },
        {
          rule: "customRegexp",
          value: /^[A-Z]{4}$/,
          errorMessage: "Mã phải gồm đúng 4 chữ cái in hoa (VD: HLXU).",
        },
      ])
      .addField("#name", [
        { rule: "required", errorMessage: "Bắt buộc." },
        {
          rule: "minLength",
          value: 3,
          errorMessage: "Từ 3 ký tự trở lên.",
        },
      ])
      .addField("#contact_email", [
        { rule: "required", errorMessage: "Bắt buộc." },
        { rule: "email", errorMessage: "Email không hợp lệ." },
      ])
      .addField("#bic_codes", [
        {
          rule: "customRegexp",
          value: /^([A-Z]{3}(,\s*[A-Z]{3})*)?$/,
          errorMessage: "Mã BIC phải gồm 3 chữ in hoa, cách nhau bởi dấu phẩy (VD: HLX, HLY).",
        },
      ])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const payload = {
          code: formData.get("code")?.toString().trim().toUpperCase(),
          name: formData.get("name")?.toString().trim(),
          contact_email: formData.get("contact_email")?.toString().trim(),
          bic_codes: formData.get("bic_codes")?.toString().trim()
            ? formData
                .get("bic_codes")
                ?.toString()
                .trim()
                .split(",")
                .map((s) => s.trim())
            : [],
        };

        const loadingToast = toast.loading("Đang lưu hãng tàu...");
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/container-providers/create`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );

          const result = await res.json();

          if (!res.ok || result.code === "error") {
            throw new Error(result.message || "Lỗi khi thêm hãng tàu.");
          }

          toast.success("Thêm hãng tàu thành công!", { id: loadingToast });
          setShowForm(false);
          fetchProviders();
        } catch (err: any) {
          toast.error(err.message || "Không thể lưu thông tin hãng tàu.", { id: loadingToast });
        }
      });

    return () => {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
    };
  }, [showForm, fetchProviders]);

  // Update Status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const loadingToast = toast.loading("Đang cập nhật trạng thái...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/container-providers/status/${id}`,
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
          newStatus === "ACTIVE" ? "Hoạt động" : "Đình chỉ"
        }`,
        { id: loadingToast }
      );
      fetchProviders();
    } catch (err: any) {
      toast.error(err.message || "Không thể cập nhật trạng thái.", { id: loadingToast });
    }
  };

  // Soft Delete
  const handleDeleteProvider = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa hãng tàu...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/container-providers/delete/${id}`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );

      const result = await res.json();

      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi đưa vào thùng rác.");
      }

      toast.success("Đã chuyển hãng tàu vào thùng rác.", { id: loadingToast });
      fetchProviders();
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa hãng tàu.", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
            Quản lý hãng tàu
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Quản lý danh sách các hãng tàu (Container Providers)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/container-providers/trash">
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
            Thêm hãng tàu
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-200 overflow-visible">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Thêm hãng tàu mới
            </CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
              Điền thông tin chi tiết của hãng tàu cung cấp container.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form ref={formRef} id="providerForm" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="code" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Mã hãng tàu
                  </Label>
                  <Input
                    id="code"
                    name="code"
                    placeholder="VD: HLXU"
                    className="uppercase bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Tên hãng tàu
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="VD: Hapag-Lloyd"
                    className="bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="contact_email" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Email liên hệ
                  </Label>
                  <Input
                    id="contact_email"
                    name="contact_email"
                    type="email"
                    placeholder="contact@hapag-lloyd.com"
                    className="bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="bic_codes" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Mã BIC (Tùy chọn)
                  </Label>
                  <Input
                    id="bic_codes"
                    name="bic_codes"
                    placeholder="VD: HLX, HLY (cách nhau bởi dấu phẩy)"
                    className="uppercase bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
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
                Danh sách hãng tàu
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <Input
                  placeholder="Tìm mã, tên, email..."
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
                    { value: "ACTIVE", label: "Đang hoạt động" },
                    { value: "SUSPENDED", label: "Đình chỉ" },
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
          ) : providers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Building2 className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4" />
              <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px]">
                {searchQuery || statusFilter !== "ALL"
                  ? "Không tìm thấy hãng tàu nào phù hợp."
                  : "Chưa có hãng tàu nào trong hệ thống."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                  <tr>
                    <th className="px-6 py-4 font-black">Mã HT</th>
                    <th className="px-6 py-4 font-black">Tên hãng tàu</th>
                    <th className="px-6 py-4 font-black">Mã BIC</th>
                    <th className="px-6 py-4 font-black">Email</th>
                    <th className="px-6 py-4 font-black">Ngày tạo</th>
                    <th className="px-6 py-4 font-black">Trạng thái</th>
                    <th className="px-6 py-4 font-black text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                  {providers.map((comp) => (
                    <tr
                      key={comp._id}
                      className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                        {comp.code}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                        {comp.name}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {comp.bic_codes && comp.bic_codes.length > 0
                          ? comp.bic_codes.join(", ")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {comp.contact_email}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {comp.createdAt
                          ? new Date(comp.createdAt).toLocaleDateString("vi-VN")
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border ${
                            comp.status === "ACTIVE"
                              ? "bg-[#1ed760]/10 text-[#1ed760] border-[#1ed760]/20"
                              : "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
                          }`}
                        >
                          {comp.status === "ACTIVE" ? "Hoạt động" : "Đình chỉ"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {comp.status === "SUSPENDED" && (
                            <Button
                              onClick={() => handleUpdateStatus(comp._id, "ACTIVE")}
                              className="bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors"
                            >
                              Kích hoạt
                            </Button>
                          )}
                          {comp.status === "ACTIVE" && (
                            <Button
                              onClick={() => handleUpdateStatus(comp._id, "SUSPENDED")}
                              className="bg-[#f59e0b]/10 hover:bg-[#f59e0b] text-[#f59e0b] hover:text-[#121212] rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors"
                            >
                              Đình chỉ
                            </Button>
                          )}
                          <Link href={`/admin/container-providers/edit/${comp._id}`}>
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
                                  Xóa hãng tàu này?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                                  Hãng tàu <span className="text-[#121212] dark:text-[#ffffff]">{comp.name}</span> sẽ được đưa vào thùng rác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider">
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteProvider(comp._id)}
                                  className="bg-[#f3727f] hover:bg-[#d85663] text-white rounded-[500px] font-black uppercase tracking-wider border-none"
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
          {totalPages > 1 && providers.length > 0 && (
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
