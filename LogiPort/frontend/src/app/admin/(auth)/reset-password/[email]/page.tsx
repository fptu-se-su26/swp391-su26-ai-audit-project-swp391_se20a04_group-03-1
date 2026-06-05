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
import { useParams, useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Ship,
  Lock,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import JustValidate from "just-validate";

export default function ResetPasswordPage() {
  const params = useParams();
  // Decode email từ URL (do email chứa ký tự @ sẽ bị encode thành %40)
  const email = decodeURIComponent((params?.email as string) || "");
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  useEffect(() => {
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

    validator
      .addField("#otp", [
        { rule: "required", errorMessage: "Vui lòng nhập mã OTP." },
        {
          rule: "minLength",
          value: 6,
          errorMessage: "Mã OTP phải có đúng 6 chữ số.",
        },
        {
          rule: "maxLength",
          value: 6,
          errorMessage: "Mã OTP phải có đúng 6 chữ số.",
        },
      ])
      .addField("#password", [
        { rule: "required", errorMessage: "Vui lòng nhập mật khẩu mới." },
        {
          rule: "minLength",
          value: 6,
          errorMessage: "Mật khẩu mới phải chứa ít nhất 6 ký tự.",
        },
      ])
      .addField("#confirmPassword", [
        {
          rule: "required",
          errorMessage: "Vui lòng xác nhận mật khẩu mới.",
        },
        {
          validator: (value: any, fields: any) => {
            if (fields["#password"] && fields["#password"].elem) {
              const repeatPasswordValue = (
                fields["#password"].elem as HTMLInputElement
              ).value;
              return value === repeatPasswordValue;
            }
            return true;
          },
          errorMessage: "Mật khẩu xác nhận không khớp.",
        },
      ]);

    validator.onSuccess(async (event?: Event) => {
      if (event) {
        event.preventDefault();
      }

      setError("");
      setSuccess("");
      setIsLoading(true);

      try {
        const formData = new FormData(formRef.current!);
        const payload = {
          email: email, // Lấy từ URL param
          otp: formData.get("otp") as string,
          password: formData.get("password") as string,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`,
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
            data.message || "Đã xảy ra lỗi khi đặt lại mật khẩu.",
          );
        }

        setSuccess(
          "Đặt lại mật khẩu thành công! Đang tự động chuyển hướng về trang đăng nhập...",
        );
        setTimeout(() => {
          router.push("/admin/login");
        }, 1800);
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
  }, [email, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3a506b] px-4 relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00D4FF] to-blue-500 shadow-lg shadow-cyan-500/20 mb-4 transition-transform hover:scale-105 duration-300">
            <Ship className="h-9 w-9 text-slate-900" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            LogiPort System
          </h1>
          <p className="text-slate-300 text-sm mt-2">
            Thiết Lập Mật Khẩu Công Vụ Mới
          </p>
        </div>

        <Card className="bg-[#1c2541]/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl text-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-white">
              Đặt lại mật khẩu
            </CardTitle>
            <CardDescription className="text-center text-slate-400 text-sm">
              Nhập mã OTP đã được gửi tới{" "}
              <strong className="text-[#00D4FF]">{email}</strong> và mật khẩu
              mới của bạn.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2 text-sm text-red-200 animate-shake">
                <AlertTriangle className="h-5 w-5 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/30 flex items-start gap-2 text-sm text-green-200">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                <span>{success}</span>
              </div>
            )}

            <form ref={formRef} className="space-y-4">
              {/* OTP */}
              <div className="space-y-2">
                <Label
                  htmlFor="otp"
                  className="text-slate-300 text-sm font-semibold"
                >
                  Mã OTP (6 chữ số)
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <KeyRound className="h-4 w-4" />
                  </span>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    maxLength={6}
                    placeholder="Nhập mã 6 số"
                    disabled={isLoading || !!success}
                    className="pl-10 bg-slate-950/40 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-slate-900 focus-visible:border-transparent transition-all tracking-widest font-mono"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-slate-300 text-sm font-semibold"
                >
                  Mật khẩu mới
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
                    disabled={isLoading || !!success}
                    className="pl-10 pr-10 bg-slate-950/40 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-slate-900 focus-visible:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors"
                    disabled={isLoading || !!success}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-slate-300 text-sm font-semibold"
                >
                  Xác nhận mật khẩu mới
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu mới"
                    disabled={isLoading || !!success}
                    className="pl-10 pr-10 bg-slate-950/40 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-slate-900 focus-visible:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors"
                    disabled={isLoading || !!success}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2 bg-[#00D4FF] text-slate-950 hover:bg-[#00B4D8] active:scale-[0.98] font-bold py-2 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
                disabled={isLoading || !!success}
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
                    Đang lưu mật khẩu mới...
                  </>
                ) : (
                  "Cập nhật mật khẩu"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-700/40 text-sm text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-2 text-slate-300 hover:text-[#00D4FF] font-semibold transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại trang Đăng nhập
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
