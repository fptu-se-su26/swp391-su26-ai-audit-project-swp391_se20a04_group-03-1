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
import { Loader2, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef, use } from "react";
import JustValidate from "just-validate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CustomSelect } from "@/components/CustomSelect";
import toast from "react-hot-toast";

export default function EditContainerProviderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [provider, setContainerProvider] = useState<any>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

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
        if (result.data?.status) {
          setSelectedStatus(result.data.status);
        }
      } catch (err: any) {
        toast.error(err.message || "Không thể tải dữ liệu.");
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
      .addField("#password", [
        { 
          validator: (value: string) => !value || value.length >= 6,
          errorMessage: "Tối thiểu 6 ký tự." 
        },
      ])
      .addField("#bic_codes", [
        {
          rule: "customRegexp",
          value: /^([A-Z]{3}(,\s*[A-Z]{3})*)?$/,
          errorMessage: "Mã BIC phải gồm 3 chữ in hoa, cách nhau bởi dấu phẩy.",
        },
      ])
      .addField("#status", [
        { rule: "required", errorMessage: "Bắt buộc." },
      ])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const payload = {
          id: formData.get("id")?.toString(),
          code: formData.get("code")?.toString().trim().toUpperCase(),
          name: formData.get("name")?.toString().trim(),
          contact_email: formData.get("contact_email")?.toString().trim(),
          password: formData.get("password")?.toString(),
          bic_codes: formData.get("bic_codes")?.toString().trim()
            ? formData
                .get("bic_codes")
                ?.toString()
                .trim()
                .split(",")
                .map((s) => s.trim())
            : [],
          status: formData.get("status")?.toString(),
        };

        const loadingToast = toast.loading("Đang lưu thay đổi...");
        try {
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

          toast.success("Cập nhật hãng tàu thành công!", { id: loadingToast });
          setTimeout(() => router.push("/admin/container-providers"), 1500);
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
  }, [loading, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-[#1ed760] mb-4" />
        <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">
          Đang tải thông tin...
        </p>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="font-bold text-[#f3727f] uppercase tracking-wider text-[12px]">
          Không tìm thấy dữ liệu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/container-providers">
          <Button variant="outline" size="icon" className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
            Chỉnh sửa hãng tàu
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Cập nhật thông tin cho hãng tàu {provider?.name}
          </p>
        </div>
      </div>

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
          <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
            Thông tin chi tiết
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form ref={formRef} id="providerEditForm" className="space-y-6">
            <input type="hidden" name="id" value={provider?._id} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="code" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                  Mã hãng tàu
                </Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={provider?.code}
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
                  defaultValue={provider?.name}
                  className="bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="bic_codes" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                  Các mã BIC quốc tế
                </Label>
                <Input
                  id="bic_codes"
                  name="bic_codes"
                  defaultValue={
                    Array.isArray(provider?.bic_codes)
                      ? provider?.bic_codes.join(", ")
                      : provider?.bic_codes || ""
                  }
                  className="uppercase bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
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
                  defaultValue={provider?.contact_email}
                  className="bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                  Mật khẩu đăng nhập
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Để trống nếu không đổi mật khẩu"
                  className="bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                />
              </div>
              <div className="space-y-3 relative md:col-span-2">
                <Label htmlFor="status" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                  Trạng thái
                </Label>
                <div className="relative">
                  <CustomSelect
                    id="status"
                    name="status"
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={[
                      { value: "ACTIVE", label: "Đang hoạt động" },
                      { value: "INACTIVE", label: "Chưa kích hoạt" },
                      { value: "SUSPENDED", label: "Đình chỉ" },
                    ]}
                    placeholder="-- Chọn trạng thái --"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-4 justify-end pt-8">
              <Link href="/admin/container-providers">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-8"
                >
                  Hủy bỏ
                </Button>
              </Link>
              <Button
                type="submit"
                className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] px-8 rounded-[500px]"
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
