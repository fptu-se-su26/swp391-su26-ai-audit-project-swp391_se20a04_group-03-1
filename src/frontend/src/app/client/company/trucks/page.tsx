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
import { Plus, Trash2, Loader2, Pencil, Search, IdCard } from "lucide-react";
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
import toast from "react-hot-toast";
import { AuditCell, AuditFields } from "@/components/ui/audit-cell";

interface Truck extends AuditFields {
  _id: string;
  truckPlate: string;
  truckType: string;
  companyId: {
    _id: string;
    companyCode: string;
    companyName: string;
  };
  createdAt: string;
}


export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchTrucks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/client/trucks/?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();

      if (data.code === "error") {
        throw new Error(data.message || "Lỗi từ máy chủ backend.");
      }

      setTrucks(data.data || []);
      if (data.pagination) setTotalPages(data.pagination.totalPages);
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải danh sách xe.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  // Form Validate
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
      .addField("#truckPlate", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .addField("#truckType", [
        { rule: "required", errorMessage: "Bắt buộc." },
      ])
      
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const payload = {
          truckPlate: formData.get("truckPlate")?.toString().trim(),
          truckType: formData.get("truckType")?.toString().trim(),
          
          
        };

        const loadingToast = toast.loading("Đang lưu xe...");
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/client/trucks`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );
          const data = await res.json();

          if (data.code !== "success") {
            throw new Error(data.message || "Lỗi khi thêm xe.");
          }

          toast.success("Thêm xe thành công!", { id: loadingToast });
          setShowForm(false);
          
          fetchTrucks();
        } catch (err: any) {
          toast.error(err.message || "Không thể lưu thông tin xe.", {
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
  }, [showForm, fetchTrucks]);

  const handleDelete = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa xe...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/client/trucks/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Chuyển xe vào thùng rác thành công.", {
          id: loadingToast,
        });
        fetchTrucks();
      } else {
        throw new Error(data.message || "Không thể xóa xe.");
      }
    } catch (err: any) {
      toast.error(err.message || "Lỗi kết nối khi xóa xe.", {
        id: loadingToast,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Quản lý Xe
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Danh sách tất cả xe và công ty trực thuộc
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/client/company/trucks/trash">
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
            Thêm xe
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-200 overflow-visible">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Thêm xe mới
            </CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
              Điền thông tin để tạo hồ sơ xe mới trong hệ thống.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form ref={formRef} id="truckForm" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="truckPlate"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Biển số xe (*)
                  </Label>
                  <Input
                    id="truckPlate"
                    name="truckPlate"
                    placeholder="VD: 15C12345"
                    className="bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="truckType"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Loại Xe
                  </Label>
                  <Input
                    id="truckType"
                    name="truckType"
                    placeholder="VD: Xe đầu kéo"
                    className="bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
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
              <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-2">
                <IdCard className="w-6 h-6 text-[#1ed760]" /> Danh sách Xe
              </CardTitle>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
                <Input
                  placeholder="Tìm tên, mã CCCD..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 bg-[#ffffff] dark:bg-[#181818] border border-[#d6dbde] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setDebouncedSearchQuery("");
                }}
                disabled={!searchQuery}
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
          ) : trucks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <IdCard className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4" />
              <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px]">
                Không tìm thấy xe nào.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                  <tr>
                    <th className="px-6 py-4 font-black">Biển số xe</th>
                    <th className="px-6 py-4 font-black">Loại Xe</th>
                    
                    
                    <th className="px-6 py-4 font-black">Nhật ký sửa đổi</th>
                    <th className="px-6 py-4 font-black text-right">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                  {trucks.map((truck) => (
                    <tr
                      key={truck._id}
                      className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group"
                    >
                      <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                        {truck.truckPlate}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                        {truck.truckType}
                      </td>
                      
                      
                      <td className="px-6 py-4">
                        <AuditCell
                          createdBy={truck.createdBy}
                          updatedBy={truck.updatedBy}
                          createdAt={truck.createdAt}
                          updatedAt={truck.updatedAt}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/client/company/trucks/edit/${truck._id}`}>
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
                                  Xóa xe này?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                                  Xe{" "}
                                  <span className="text-[#121212] dark:text-[#ffffff]">
                                    {truck.truckType}
                                  </span>{" "}
                                  sẽ được đưa vào thùng rác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider">
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(truck._id)}
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
          {totalPages > 1 && trucks.length > 0 && (
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
