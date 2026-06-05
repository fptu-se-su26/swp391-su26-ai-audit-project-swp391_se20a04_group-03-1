"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, use } from "react";
import JustValidate from "just-validate";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditContainerProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [provider, setContainerProvider] = useState<any>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchContainerProvider = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/container-providers/detail/${resolvedParams.id}`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("Không thể tải thông tin nhà cung cấp");
        const result = await res.json();
        if (result.code === "error") throw new Error(result.message);

        setContainerProvider(result.data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchContainerProvider();
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
      .addField("#code", [
        { rule: "required", errorMessage: "Mã nhà cung cấp là bắt buộc." },
        {
          rule: "customRegexp",
          value: /^[A-Z]{4}$/,
          errorMessage:
            "Mã nhà cung cấp phải gồm đúng 4 chữ cái in hoa (VD: HLXU).",
        },
      ])
      .addField("#name", [
        { rule: "required", errorMessage: "Tên nhà cung cấp là bắt buộc." },
        {
          rule: "minLength",
          value: 3,
          errorMessage: "Tên nhà cung cấp phải từ 3 ký tự trở lên.",
        },
      ])
      .addField("#bic_codes", [
        {
          rule: "customRegexp",
          value: /^([A-Z]{3}(,\s*[A-Z]{3})*)?$/,
          errorMessage:
            "Mã BIC phải gồm 3 chữ cái in hoa, cách nhau bởi dấu phẩy (VD: HLX, HLY).",
        },
      ])
      .addField("#contact_email", [
        { rule: "required", errorMessage: "Email liên hệ là bắt buộc." },
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
          code: formData.get("code")?.toString().trim().toUpperCase(),
          name: formData.get("name")?.toString().trim(),
          bic_codes: formData.get("bic_codes")?.toString().trim()
            ? formData
                .get("bic_codes")
                ?.toString()
                .trim()
                .split(",")
                .map((s) => s.trim())
            : [],
          contact_email: formData.get("contact_email")?.toString().trim(),
          status: formData.get("status")?.toString(),
        };

        try {
          setError(null);
          setSuccessMsg(null);
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/container-providers/edit`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );

          const result = await res.json();
          if (!res.ok || result.code === "error") {
            throw new Error(result.message || "Lỗi khi cập nhật nhà cung cấp.");
          }

          setSuccessMsg("Cập nhật nhà cung cấp thành công!");
          setTimeout(() => router.push("/admin/container-providers"), 1500);
        } catch (err: any) {
          setError(err.message || "Không thể lưu thông tin nhà cung cấp.");
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
        <p>Đang tải thông tin nhà cung cấp...</p>
      </div>
    );
  }

  if (!provider && error) {
    return (
      <div className="p-4 text-red-700 bg-red-50 rounded-lg dark:bg-red-900/10 dark:text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/container-providers">
          <Button
            variant="outline"
            size="icon"
            className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Chỉnh sửa nhà cung cấp
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Cập nhật thông tin cho nhà cung cấp {provider?.name}
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
          <CardTitle className="text-slate-900 dark:text-white">
            Thông tin chi tiết
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form ref={formRef} id="providerEditForm" className="space-y-6">
            <input type="hidden" name="id" value={provider?._id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="code"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Mã nhà cung cấp
                </Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={provider?.code}
                  className="uppercase bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Tên nhà cung cấp
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={provider?.name}
                  className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="bic_codes"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Các mã BIC quốc tế
                </Label>
                <Input
                  id="bic_codes"
                  name="bic_codes"
                  defaultValue={
                    Array.isArray(provider?.bic_codes)
                      ? provider?.bic_codes.join(", ")
                      : provider?.bic_codes
                  }
                  className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="contact_email"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Email liên hệ
                </Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  defaultValue={provider?.contact_email}
                  className="bg-white dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100 dark:placeholder:text-slate-600"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="status"
                  className="text-slate-900 dark:text-slate-300"
                >
                  Trạng thái
                </Label>
                <select
                  id="status"
                  name="status"
                  defaultValue={provider?.status}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus-visible:ring-slate-300"
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="ACTIVE">Đang hoạt động</option>
                  <option value="SUSPENDED">Đình chỉ</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end border-t border-slate-100 dark:border-slate-800/80 pt-4">
              <Link href="/admin/container-providers">
                <Button
                  type="button"
                  variant="outline"
                  className="dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                >
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
