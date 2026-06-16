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
import { Loader2, ArrowLeft, Search } from "lucide-react";
import { useState, useEffect, useRef, use } from "react";
import JustValidate from "just-validate";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";



export default function EditDriverPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [driver, setDriver] = useState<any>(null);

  

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  // Fetch data
  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/client/drivers/${resolvedParams.id}`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error("Không thể tải thông tin tài xế");
        const data = await res.json();
        if (data.code !== "success") throw new Error(data.message);

        const d = data.data;
        setDriver(d);
      } catch (err: any) {
        toast.error(err.message || "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
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
      .addField("#driverId", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .addField("#driverName", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const payload = {
          driverId: formData.get("driverId")?.toString().trim(),
          driverName: formData.get("driverName")?.toString().trim(),
          driverPhone: formData.get("driverPhone")?.toString().trim(),
          
        };

        const loadingToast = toast.loading("Đang lưu thay đổi...");
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/client/drivers/${resolvedParams.id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );

          const data = await res.json();

          if (data.code !== "success") {
            throw new Error(data.message || "Lỗi khi cập nhật tài xế.");
          }

          toast.success("Cập nhật tài xế thành công!", { id: loadingToast });
          setTimeout(() => router.push("/client/company/drivers"), 1500);
        } catch (err: any) {
          toast.error(err.message || "Không thể lưu thông tin tài xế.", { id: loadingToast });
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

  if (!driver) {
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
        <Link href="/client/company/drivers">
          <Button variant="outline" size="icon" className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
            Chỉnh sửa tài xế
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Cập nhật thông tin hồ sơ cho tài xế {driver?.driverName}
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
          <form ref={formRef} id="driverEditForm" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label htmlFor="driverId" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                  Số CCCD / GPLX (*)
                </Label>
                <Input
                  id="driverId"
                  name="driverId"
                  defaultValue={driver?.driverId}
                  className="bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="driverName" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                  Họ và tên (*)
                </Label>
                <Input
                  id="driverName"
                  name="driverName"
                  defaultValue={driver?.driverName}
                  className="bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="driverPhone" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                  Số điện thoại
                </Label>
                <Input
                  id="driverPhone"
                  name="driverPhone"
                  defaultValue={driver?.driverPhone}
                  className="bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[4px] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-4 justify-end pt-8">
              <Link href="/client/company/drivers">
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
