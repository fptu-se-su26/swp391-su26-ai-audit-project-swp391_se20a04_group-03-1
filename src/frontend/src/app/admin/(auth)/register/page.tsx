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
  User,
  Lock,
  Mail,
  AlertTriangle,
  CheckCircle2,
  Shield,
} from "lucide-react";
import JustValidate from "just-validate";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  useEffect(() => {
    if (!formRef.current) return;

    // Cleanup previous instance if re-rendered
    if (validatorRef.current) {
      validatorRef.current.destroy();
    }

    // Initialize JustValidate
    const validator = new JustValidate(formRef.current, {
      validateBeforeSubmitting: true,
      errorFieldCssClass: "border-red-500 focus-visible:ring-red-500",
      errorLabelCssClass:
        "text-red-400 text-xs mt-1.5 font-semibold block animate-in fade-in slide-in-from-top-1 duration-200",
      focusInvalidField: true,
    });

    validator
      .addField("#fullName", [
        { rule: "required", errorMessage: "Vui lòng nhập họ và tên của bạn." },
      ])
      .addField("#email", [
        { rule: "required", errorMessage: "Vui lòng nhập email công vụ." },
        {
          rule: "email",
          errorMessage: "Định dạng email công vụ không hợp lệ.",
        },
      ])
      .addField("#password", [
        { rule: "required", errorMessage: "Vui lòng thiết lập mật khẩu." },
        {
          rule: "minLength",
          value: 6,
          errorMessage: "Mật khẩu phải chứa ít nhất 6 ký tự.",
        },
      ])
      .addField("#confirmPassword", [
        { rule: "required", errorMessage: "Vui lòng xác nhận lại mật khẩu." },
        {
          validator: (value, fields) => {
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
      ])
      .addField("#agreeTerms", [
        {
          rule: "required",
          errorMessage: "Bạn cần đồng ý với các điều khoản bảo mật.",
        },
      ]);

    // Handle form submit on success validation
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
          fullName: formData.get("fullName") as string,
          email: formData.get("email") as string,
          role: formData.get("role") as string,
          password: formData.get("password") as string,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
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
            data.message || "Đăng ký thất bại. Vui lòng thử lại.",
          );
        }

        setSuccess(
          "Tạo tài khoản công vụ thành công! Đang chuyển hướng về trang đăng nhập...",
        );
        setTimeout(() => {
          window.location.href = "/admin/login";
        }, 2000);
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
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3a506b] px-4 py-12 relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00D4FF]/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
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
            Đăng Ký Tài Khoản Công Vụ Hệ Thống Cảng
          </p>
        </div>

        <Card className="bg-[#1c2541]/60 backdrop-blur-xl border border-slate-700/50 shadow-2xl text-white">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-white">
              Đăng ký
            </CardTitle>
            <CardDescription className="text-center text-slate-400 text-sm">
              Cung cấp thông tin để được cấp quyền quản trị/vận hành
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
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="fullName"
                  className="text-slate-300 text-sm font-semibold"
                >
                  Họ và tên
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <User className="h-4 w-4" />
                  </span>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    disabled={isLoading}
                    className="pl-10 bg-slate-950/40 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-slate-900 focus-visible:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
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
                    placeholder="a.nguyen@port.com"
                    disabled={isLoading}
                    className="pl-10 bg-slate-950/40 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-slate-900 focus-visible:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="role"
                  className="text-slate-300 text-sm font-semibold"
                >
                  Bộ phận & Vai trò vận hành
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Shield className="h-4 w-4" />
                  </span>
                  <select
                    id="role"
                    name="role"
                    disabled={isLoading}
                    defaultValue="operator"
                    className="w-full h-10 pl-10 pr-3 rounded-md border border-slate-700/50 bg-slate-950/40 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#00D4FF] focus:ring-offset-2 focus:ring-offset-slate-900 transition-colors"
                  >
                    <option
                      value="operator"
                      className="bg-slate-900 text-white"
                    >
                      Cán bộ Điều hành bãi (Yard Operator)
                    </option>
                    <option
                      value="gatekeeper"
                      className="bg-slate-900 text-white"
                    >
                      Kiểm soát viên Cổng (Gatekeeper)
                    </option>
                    <option value="admin" className="bg-slate-900 text-white">
                      Quản trị viên Hệ thống (System Admin)
                    </option>
                    <option
                      value="technician"
                      className="bg-slate-900 text-white"
                    >
                      Kỹ thuật viên Thiết bị (Crane Operator/Tech)
                    </option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="password"
                  className="text-slate-300 text-sm font-semibold"
                >
                  Mật khẩu
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
                    disabled={isLoading}
                    className="pl-10 pr-10 bg-slate-950/40 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-slate-900 focus-visible:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirmPassword"
                  className="text-slate-300 text-sm font-semibold"
                >
                  Xác nhận mật khẩu
                </Label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    disabled={isLoading}
                    className="pl-10 pr-10 bg-slate-950/40 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-[#00D4FF] focus-visible:ring-offset-slate-900 focus-visible:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-white transition-colors"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex items-start gap-2">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    disabled={isLoading}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-950/40 text-[#00D4FF] focus:ring-[#00D4FF] focus:ring-offset-slate-900 cursor-pointer"
                  />
                  <Label
                    htmlFor="agreeTerms"
                    className="text-xs text-slate-400 leading-tight cursor-pointer select-none"
                  >
                    Tôi đồng ý tuân thủ các quy tắc bảo mật thông tin nội bộ
                    cảng và hướng dẫn vận hành kỹ thuật số của LogiPort.
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-3 bg-[#00D4FF] text-slate-950 hover:bg-[#00B4D8] active:scale-[0.98] font-bold py-2 rounded-lg transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-cyan-500/20"
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
                    Đang xử lý đăng ký...
                  </>
                ) : (
                  "Đăng ký tài khoản công vụ"
                )}
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-700/40 text-sm text-center text-slate-400">
              <p>
                Đã được cấp tài khoản công vụ?{" "}
                <Link
                  href="/admin/login"
                  className="text-[#00D4FF] hover:underline hover:text-cyan-400 font-semibold transition-colors"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
