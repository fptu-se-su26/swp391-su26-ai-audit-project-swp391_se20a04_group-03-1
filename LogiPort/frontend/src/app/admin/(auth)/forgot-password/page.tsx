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
  Ship,
  Mail,
  AlertTriangle,
  ArrowLeft,
  MailCheck,
  ExternalLink,
} from "lucide-react";
import JustValidate from "just-validate";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSent, setIsSent] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Chỉ khởi tạo khi form đang được hiển thị (nghĩa là isSent đang false)
    if (!formRef.current) return;

    if (validatorRef.current) {
      validatorRef.current.destroy();
    }

    const validator = new JustValidate(formRef.current, {
      validateBeforeSubmitting: true,
      errorFieldCssClass: "border-red-500 focus-visible:ring-red-500",
      errorLabelCssClass:
        "text-red-400 text-xs mt-1.5 font-semibold block animate-in fade-in slide-in-from-top-1 duration-200",
      focusInvalidField: true,
    });

    validator.addField("#email", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập địa chỉ email công vụ.",
      },
      {
        rule: "email",
        errorMessage: "Định dạng email công vụ không hợp lệ.",
      },
    ]);

    validator.onSuccess(async (event?: Event) => {
      if (event) {
        event.preventDefault();
      }

      setError("");
      setIsLoading(true);

      try {
        const formData = new FormData(formRef.current!);
        const payload = {
          email: formData.get("email") as string,
        };

        // Lưu email vào state để chút nữa in ra màn hình thông báo "đã gửi"
        setEmail(payload.email);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          },
        );

        const data = await response.json();

        if (data.code === "error") {
          throw new Error(
            data.message || "Đã xảy ra lỗi khi gửi yêu cầu khôi phục.",
          );
        }

        // Chuyển sang trang reset password với email đã được gửi OTP
        router.push(`/admin/reset-password/${payload.email}`);

        // Chuyển sang màn hình thông báo đã gửi
        setIsSent(true);
      } catch (err: any) {
        setError(err.message);
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
  }, [isSent]); // Phụ thuộc vào isSent để khi form ẩn đi sẽ dọn dẹp validator

  return (
    <div className="min-h-screen w-full flex bg-[#0b132b] overflow-hidden">
      {/* Left Side - Visual/Brand Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col relative w-1/2 justify-between p-12 text-white">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/auth-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b132b]/90 via-[#0b132b]/60 to-transparent pointer-events-none" />
        
        <div className="relative z-10 animate-fade-in slide-in-from-left-4">
          <div className="inline-flex items-center gap-3 font-bold text-2xl tracking-tight mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D4FF] to-blue-500 shadow-lg shadow-cyan-500/30 flex items-center justify-center">
              <Ship className="h-5 w-5 text-slate-900" />
            </div>
            LogiPort System
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mt-8">
            Quên mật khẩu? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-blue-500">
              Không thành vấn đề
            </span>
          </h1>
          <p className="mt-4 text-slate-300 max-w-md text-lg leading-relaxed">
            Chúng tôi sẽ giúp bạn khôi phục quyền truy cập vào hệ thống điều hành cảng một cách nhanh chóng và bảo mật.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

        <div className="w-full max-w-md relative z-10 animate-fade-in slide-in-from-right-4">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-blue-500 shadow-lg shadow-cyan-500/20 mb-4 transition-transform hover:scale-105 duration-300">
              <Ship className="h-9 w-9 text-slate-900" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              LogiPort System
            </h1>
          </div>
          <p className="text-slate-300 text-sm mt-2 hidden lg:block mb-6">
            Khôi Phục Mật Khẩu Tài Khoản Công Vụ
          </p>

          <Card className="bg-[#1c2541]/40 backdrop-blur-2xl border border-slate-700/50 shadow-2xl text-white rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00D4FF] to-blue-600" />
            {!isSent ? (
              <>
                <CardHeader className="space-y-2 pb-6 pt-8">
                  <CardTitle className="text-2xl font-bold text-center text-white tracking-tight">
                    Quên mật khẩu
                  </CardTitle>
                  <CardDescription className="text-center text-slate-400 text-sm px-4">
                    Nhập email công vụ của bạn, chúng tôi sẽ gửi liên kết khôi phục mật khẩu.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-sm text-red-200 animate-shake">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                <form ref={formRef} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-slate-300 text-sm font-semibold"
                    >
                      Email công vụ
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="officer@port.com"
                        disabled={isLoading}
                        className="pl-10 bg-slate-950/40 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-slate-900 focus-visible:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full mt-2 bg-[#00D4FF] text-slate-950 hover:bg-[#00B4D8] active:scale-[0.98] font-bold py-2 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-950"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Đang gửi yêu cầu...
                      </>
                    ) : (
                      "Gửi liên kết khôi phục"
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-4 border-t border-slate-700/40 text-sm text-center">
                  <Link
                    href="/admin/login"
                    className="inline-flex items-center gap-2 text-slate-300 hover:text-[#00D4FF] font-semibold transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> Quay lại Đăng nhập
                  </Link>
                </div>
              </CardContent>
            </>
          ) : (
            <></>
          )}
        </Card>
      </div>
      </div>
    </div>
  );
}
