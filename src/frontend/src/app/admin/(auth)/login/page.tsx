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
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Ship,
  Lock,
  Mail,
  CheckCircle2,
} from "lucide-react";
import JustValidate from "just-validate";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  useEffect(() => {
    if (!formRef.current) return;

    if (validatorRef.current) {
      validatorRef.current.destroy();
    }

    const validator = new JustValidate(formRef.current, {
      validateBeforeSubmitting: true,
      errorFieldCssClass: "border-[#f3727f] focus-visible:ring-[#f3727f]",
      errorLabelCssClass:
        "text-[#f3727f] text-xs mt-1.5 font-bold uppercase tracking-wider block animate-in fade-in",
      focusInvalidField: true,
    });

    validator
      .addField("#email", [
        { rule: "required", errorMessage: "Vui lòng nhập email công vụ." },
        { rule: "email", errorMessage: "Định dạng email không hợp lệ." },
      ])
      .addField("#password", [
        { rule: "required", errorMessage: "Vui lòng nhập mật khẩu." },
        { rule: "minLength", value: 6, errorMessage: "Mật khẩu phải chứa ít nhất 6 ký tự." },
      ]);

    validator.onSuccess(async (event?: Event) => {
      if (event) event.preventDefault();

      setIsLoading(true);
      const loadingToast = toast.loading("Đang xác thực...");

      try {
        const formData = new FormData(formRef.current!);
        const payload = {
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          },
        );

        const data = await response.json();

        if (data.code === "error") {
          throw new Error(data.message || "Tài khoản hoặc mật khẩu không chính xác.");
        }

        toast.success("Đăng nhập thành công!", { id: loadingToast });
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 1200);
      } catch (err: any) {
        toast.error(err.message, { id: loadingToast });
      } finally {
        setIsLoading(false);
      }
    });

    validatorRef.current = validator;

    return () => {
      if (validatorRef.current) {
        validatorRef.current.destroy();
      }
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] font-sans transition-colors duration-300">
      {/* Left Side - Visual/Brand Panel */}
      <div className="hidden lg:flex flex-col relative w-1/2 justify-between p-16 border-r border-[#e5e5e5] dark:border-[#272727] bg-[#ffffff] dark:bg-[#181818] transition-colors duration-300">
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-3 font-black text-2xl tracking-tight mb-4 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-[500px] bg-[#1ed760]/10 flex items-center justify-center">
              <Ship className="h-6 w-6 text-[#1ed760]" />
            </div>
            LogiPort
          </Link>
          <h1 className="text-5xl font-black leading-[1.1] mt-16 tracking-tight">
            Vận hành cảng <br />
            <span className="text-[#1ed760]">Quyền Năng & Tốc Độ</span>
          </h1>
          <p className="mt-6 text-[#666666] dark:text-[#b3b3b3] max-w-md text-[16px] font-normal leading-[1.6]">
            Hệ thống giám sát, điều phối và tự động hóa quy trình xuất nhập container hiện đại nhất dành cho doanh nghiệp logistics.
          </p>
        </div>

        <div className="relative z-10 bg-[#f8f8f8] dark:bg-[#1f1f1f] border border-[#e5e5e5] dark:border-[#272727] rounded-[8px] p-6 max-w-md shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-colors duration-300">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-[500px] bg-[#1ed760]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="text-[#1ed760] h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-[18px]">AI Camera Tích Hợp</h4>
              <p className="text-[14px] text-[#666666] dark:text-[#b3b3b3] mt-2 leading-[1.6]">
                Nhận diện tự động biển số xe và mã container trực tiếp tại cổng với độ chính xác đạt trên 99%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-[500px] bg-[#1ed760]/10 mb-4">
              <Ship className="h-8 w-8 text-[#1ed760]" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              LogiPort
            </h1>
          </div>

          <Card className="bg-[#ffffff] dark:bg-[#181818] border-none shadow-[0_8px_24px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] text-[#121212] dark:text-[#ffffff] rounded-[8px] overflow-hidden transition-colors duration-300">
            <CardHeader className="space-y-2 pb-6 pt-10">
              <CardTitle className="text-3xl font-black text-center tracking-tight">
                Đăng Nhập
              </CardTitle>
              <CardDescription className="text-center text-[#666666] dark:text-[#b3b3b3] text-[14px]">
                Sử dụng email công vụ để tiếp tục
              </CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <form ref={formRef} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-[#121212] dark:text-[#ffffff] text-[12px] font-bold uppercase tracking-[1.5px]">
                    Email công vụ
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#999999] dark:text-[#b3b3b3] pointer-events-none">
                      <Mail className="h-5 w-5" />
                    </span>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="admin@port.com"
                      disabled={isLoading}
                      className="pl-12 py-6 bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] placeholder:text-[#999999] dark:placeholder:text-[#666666] focus-visible:ring-[#1ed760] focus-visible:border-transparent transition-all rounded-[8px] text-[16px] font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-[#121212] dark:text-[#ffffff] text-[12px] font-bold uppercase tracking-[1.5px]">
                      Mật khẩu
                    </Label>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#999999] dark:text-[#b3b3b3] pointer-events-none">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      disabled={isLoading}
                      className="pl-12 pr-12 py-6 bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] placeholder:text-[#999999] dark:placeholder:text-[#666666] focus-visible:ring-[#1ed760] focus-visible:border-transparent transition-all rounded-[8px] text-[16px] font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#999999] dark:text-[#b3b3b3] hover:text-[#121212] dark:hover:text-[#ffffff] transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="text-right mt-2">
                    <Link href="/admin/forgot-password" className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3] hover:text-[#121212] dark:hover:text-[#ffffff] uppercase tracking-wider transition-colors">
                      Quên mật khẩu?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[2px] py-7 rounded-[500px] transition-all duration-200 mt-4 border-none text-[14px]"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xác thực..." : "Đăng nhập ngay"}
                </Button>
              </form>

            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
