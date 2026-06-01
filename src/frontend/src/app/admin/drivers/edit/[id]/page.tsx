"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Search, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function AsyncCompanySelect({ value, onChange, selectedCompany, error }: { 
    value: string, 
    onChange: (id: string, name: string) => void,
    selectedCompany: { id: string, name: string } | null,
    error?: string
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const fetchCompanies = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/companies?search=${encodeURIComponent(debouncedSearch)}&limit=20`, { credentials: "include" });
                const data = await res.json();
                if (data.code === "success") {
                    setCompanies(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (isOpen) {
            fetchCompanies();
        }
    }, [debouncedSearch, isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <div 
                className={`flex items-center justify-between w-full p-2 border rounded-md cursor-pointer bg-white dark:bg-slate-950 ${error ? "border-red-500" : "border-slate-200 dark:border-slate-800"}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedCompany ? "text-slate-900 dark:text-slate-100 text-sm" : "text-slate-500 text-sm"}>
                    {selectedCompany ? selectedCompany.name : "Tìm và chọn công ty..."}
                </span>
                <Search className="w-4 h-4 text-slate-400" />
            </div>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg max-h-60 flex flex-col">
                    <div className="p-2 sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                        <Input
                            type="text"
                            placeholder="Gõ tên hoặc mã công ty để tìm..."
                            className="w-full text-sm"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        {loading ? (
                            <div className="flex items-center justify-center p-4 text-slate-500 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang tải...
                            </div>
                        ) : companies.length > 0 ? (
                            <ul className="space-y-1">
                                {companies.map((c) => (
                                    <li 
                                        key={c._id}
                                        className={`p-2 text-sm rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${value === c._id ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-medium" : "text-slate-700 dark:text-slate-300"}`}
                                        onClick={() => {
                                            onChange(c._id, `${c.companyCode} - ${c.companyName}`);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                    >
                                        {c.companyCode} - {c.companyName}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-sm text-center text-slate-500">
                                Không tìm thấy công ty nào
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function EditDriverPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    driverId: "",
    driverName: "",
    driverPhone: "",
    companyId: ""
  });
  const [selectedCompany, setSelectedCompany] = useState<{id: string, name: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drivers/${id}`, { credentials: "include" });
        const data = await res.json();
        
        if (data.code === "success" && data.data) {
          const d = data.data;
          setFormData({
            driverId: d.driverId,
            driverName: d.driverName,
            driverPhone: d.driverPhone || "",
            companyId: d.companyId ? d.companyId._id : ""
          });
          if (d.companyId) {
            setSelectedCompany({
              id: d.companyId._id,
              name: `${d.companyId.companyCode} - ${d.companyId.companyName}`
            });
          }
        } else {
          setError(data.message || "Không thể lấy thông tin tài xế");
        }
      } catch (err) {
        setError("Lỗi kết nối đến máy chủ");
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (id) fetchDriver();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!formData.driverId) errors.driverId = "Mã CC/GPLX là bắt buộc";
    if (!formData.driverName) errors.driverName = "Tên tài xế là bắt buộc";
    if (!formData.companyId) errors.companyId = "Vui lòng chọn công ty trực thuộc";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drivers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include"
      });
      const data = await res.json();
      
      if (data.code === "success") {
        router.push("/admin/drivers");
      } else {
        setError(data.message || "Có lỗi xảy ra");
      }
    } catch (err: any) {
      setError("Không thể kết nối đến máy chủ");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/drivers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cập nhật tài xế</h1>
          <p className="text-muted-foreground">Chỉnh sửa thông tin hồ sơ tài xế</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin tài xế</CardTitle>
          <CardDescription>Các trường có dấu (*) là bắt buộc</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="driverId">Số CCCD / GPLX (*)</Label>
                <Input
                  id="driverId"
                  placeholder="Nhập mã định danh tài xế..."
                  value={formData.driverId}
                  onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                  className={fieldErrors.driverId ? "border-red-500" : ""}
                />
                {fieldErrors.driverId && <p className="text-xs text-red-500">{fieldErrors.driverId}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="driverName">Họ và tên (*)</Label>
                <Input
                  id="driverName"
                  placeholder="Nguyễn Văn A..."
                  value={formData.driverName}
                  onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                  className={fieldErrors.driverName ? "border-red-500" : ""}
                />
                {fieldErrors.driverName && <p className="text-xs text-red-500">{fieldErrors.driverName}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="companyId">Công ty trực thuộc (*)</Label>
                <AsyncCompanySelect 
                    value={formData.companyId}
                    selectedCompany={selectedCompany}
                    onChange={(id, name) => {
                        setFormData({ ...formData, companyId: id });
                        setSelectedCompany({ id, name });
                    }}
                    error={fieldErrors.companyId}
                />
                {fieldErrors.companyId && <p className="text-xs text-red-500">{fieldErrors.companyId}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="driverPhone">Số điện thoại liên lạc</Label>
                <Input
                  id="driverPhone"
                  placeholder="0987654321..."
                  value={formData.driverPhone}
                  onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Link href="/admin/drivers">
                <Button variant="outline" type="button">Hủy</Button>
              </Link>
              <Button type="submit" disabled={loading} className="gap-2 bg-blue-600 hover:bg-blue-700">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                <Save className="h-4 w-4" />
                Lưu thông tin
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
