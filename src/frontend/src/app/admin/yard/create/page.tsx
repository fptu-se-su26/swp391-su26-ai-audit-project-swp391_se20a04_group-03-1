"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertCircle, Save } from "lucide-react";
import Link from "next/link";
import JustValidate from "just-validate";

export default function CreateYardPage() {
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  useEffect(() => {
    if (!formRef.current) return;

    const validator = new JustValidate(formRef.current, {
      errorFieldCssClass: "border-red-500 focus:ring-red-500 focus:border-red-500",
      errorLabelCssClass: "text-red-500 text-xs mt-1 block font-medium",
    });

    validatorRef.current = validator;

    validator
      .addField("#name", [
        {
          rule: "required",
          errorMessage: "Tên bãi đỗ là bắt buộc.",
        },
      ])
      .addField("#cameraIp", [
        {
          rule: "required",
          errorMessage: "Địa chỉ IP Camera là bắt buộc.",
        },
      ])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        setSubmitting(true);
        setError(null);
        
        const formData = new FormData(formRef.current!);
        const payload = {
          name: formData.get("name")?.toString().trim(),
          cameraIp: formData.get("cameraIp")?.toString().trim(),
        };

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yards/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          });
          const result = await res.json();
          if (!res.ok || result.code === "error") {
            throw new Error(result.message || "Lỗi khi tạo bãi đỗ.");
          }
          
          router.push("/admin/yard");
        } catch (err: any) {
          setError(err.message || "Lỗi hệ thống khi tạo bãi đỗ.");
          setSubmitting(false);
        }
      });

    return () => {
      validator.destroy();
    };
  }, [router]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/yard">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tạo bãi đỗ mới</h1>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200/50">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <Card className="border border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Thông tin bãi đỗ</CardTitle>
          <CardDescription>
            Điền tên bãi đỗ và địa chỉ IP luồng stream của Camera.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Tên bãi đỗ</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ví dụ: Bãi chờ Container A"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cameraIp">Địa chỉ IP Camera</Label>
              <Input
                id="cameraIp"
                name="cameraIp"
                placeholder="Ví dụ: rtsp://192.168.1.100/stream"
              />
            </div>
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {submitting ? "Đang lưu..." : "Lưu bãi đỗ"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
