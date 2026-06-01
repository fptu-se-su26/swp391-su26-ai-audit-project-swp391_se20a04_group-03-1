"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, use } from "react";
import JustValidate from "just-validate";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditCompanyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [company, setCompany] = useState<any>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/companies/detail/${resolvedParams.id}`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("Không thể tải thông tin công ty");
        const result = await res.json();
        if (result.code === "error") throw new Error(result.message);

        setCompany(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, [resolvedParams.id]);

  // Setup validation
  useEffect(() => {
    if (loading || !formRef.current) return;

    const validator = new JustValidate(formRef.current, {
      errorFieldCssClass:
        "border-red-500 focus:ring-red-500 focus:border-red-500",
      errorLabelCssClass: "text-red-500 text-xs mt-1 block font-medium",
    });

    validatorRef.current = validator;

    validator
      .addField("#companyCode", [
        { rule: "required", errorMessage: "Mã công ty là bắt buộc." },
        {
          rule: "customRegexp",
          value: /^[A-Z0-9-]{3,20}$/,
          errorMessage: "Mã công ty chỉ gồm chữ in hoa, số và dấu gạch ngang.",
        },
      ])
      .addField("#companyName", [
        { rule: "required", errorMessage: "Tên công ty là bắt buộc." },
        {
          rule: "minLength",
          value: 3,
          errorMessage: "Tên công ty phải từ 3 ký tự trở lên.",
        },
      ])
      .addField("#contactPerson", [
        { rule: "required", errorMessage: "Tên người liên hệ là bắt buộc." },
      ])
      .addField("#contactPhone", [
        { rule: "required", errorMessage: "Số điện thoại là bắt buộc." },
        {
          rule: "customRegexp",
          value: /^(0[3|5|7|8|9])[0-9]{8}$/,
          errorMessage: "Số điện thoại không đúng định dạng Việt Nam.",
        },
      ])
      .addField("#email", [
        { rule: "required", errorMessage: "Email là bắt buộc." },
        { rule: "email", errorMessage: "Email không hợp lệ." },
      ])
      .addField("#status", [
        { rule: "required", errorMessage: "Trạng thái là bắt buộc." },
      ])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const payload = {
          id: formData.get("id")?.toString(),
          companyCode: formData.get("companyCode")?.toString().trim().toUpperCase(),
          companyName: formData.get("companyName")?.toString().trim(),
          contactPerson: formData.get("contactPerson")?.toString().trim(),
          contactPhone: formData.get("contactPhone")?.toString().trim(),
          email: formData.get("email")?.toString().trim().toLowerCase(),
          status: formData.get("status")?.toString(),
        };

        try {
          setError(null);
          setSuccessMsg(null);
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/companies/edit`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );

          const result = await res.json();
          if (!res.ok || result.code === "error") {
            throw new Error(result.message || "Lỗi khi cập nhật công ty.");
          }

          setSuccessMsg("Cập nhật công ty thành công!");
          setTimeout(() => router.push("/admin/companies"), 1500);
        } catch (err: any) {
          setError(err.message || "Không thể lưu thông tin công ty.");
        }
      });

    return () => {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
    };
  }, [loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-500 mb-2" />
        <p>Đang tải thông tin công ty...</p>
      </div>
    );
  }

  if (!company && error) {
    return <div className="p-4 text-red-700 bg-red-50 rounded-lg dark:bg-red-900/10 dark:text-red-400">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/companies">
          <Button variant="outline" size="icon" className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chỉnh sửa công ty
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Cập nhật thông tin cho công ty {company?.companyName}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200/50 dark:bg-red-900/10 dark:text-red-400 dark:border-red-900/30">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-4 text-sm text-green-700 bg-green-50 rounded-lg border border-green-200/50 dark:bg-green-900/10 dark:text-green-400 dark:border-green-900/30">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <Card className="border border-slate-200 shadow-lg dark:border-slate-800">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 dark:bg-slate-900 dark:border-slate-800/80">
          <CardTitle className="text-slate-900 dark:text-white">Thông tin chi tiết</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form ref={formRef} id="companyEditForm" className="space-y-6">
            <input type="hidden" name="id" value={company?._id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="companyCode" className="text-slate-900 dark:text-slate-300">Mã công ty</Label>
                <Input
                  id="companyCode"
                  name="companyCode"
                  defaultValue={company?.companyCode}
                  className="uppercase bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName" className="text-slate-900 dark:text-slate-300">Tên công ty</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  defaultValue={company?.companyName}
                  className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-slate-900 dark:text-slate-300">Người liên hệ</Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  defaultValue={company?.contactPerson}
                  className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-slate-900 dark:text-slate-300">Số điện thoại</Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  defaultValue={company?.contactPhone}
                  className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-900 dark:text-slate-300">Email liên hệ</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={company?.email}
                  className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="text-slate-900 dark:text-slate-300">Trạng thái</Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={company?.status}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:ring-slate-300"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="Active">Đang hoạt động</option>
                  <option value="Suspended">Đình chỉ</option>
                  <option value="Inactive">Ngừng hoạt động</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <Link href="/admin/companies">
                <Button type="button" variant="outline" className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800">
                  Hủy bỏ
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                Lưu thay đổi
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
