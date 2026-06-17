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
  Shield,
  CheckCircle2,
  Building2,
  Phone,
} from "lucide-react";
import JustValidate from "just-validate";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
      .addField("#code", [
        { rule: "required", errorMessage: "Vui lòng nhập mã nhà cung cấp." },
      ])
      .addField("#name", [
        { rule: "required", errorMessage: "Vui lòng nhập tên nhà cung cấp." },
      ])
      .addField("#contact_email", [
        { rule: "required", errorMessage: "Vui lòng nhập email." },
        { rule: "email", errorMessage: "Email không hợp lệ." },
      ])
      .addField("#passwordInput", [
        { rule: "required", errorMessage: "Vui lòng nhập mật khẩu." },
        { rule: "minLength", value: 6, errorMessage: "Mật khẩu tối thiểu 6 ký tự." },
      ])
      .addField("#confirmPasswordInput", [
        {
          validator: () => {
            if (!formRef.current) return false;
            const confirmPassElem = formRef.current.elements.namedItem("confirmPassword") as HTMLInputElement;
            return !!confirmPassElem && confirmPassElem.value.trim() !== "";
          },
          errorMessage: "Vui lòng xác nhận mật khẩu.",
        },
        {
          validator: () => {
            if (!formRef.current) return false;
            const passElem = formRef.current.elements.namedItem("password") as HTMLInputElement;
            const confirmPassElem = formRef.current.elements.namedItem("confirmPassword") as HTMLInputElement;
            if (passElem && confirmPassElem) {
              return passElem.value === confirmPassElem.value;
            }
            return false;
          },
          errorMessage: "Mật khẩu không khớp.",
        },
      ])
      .addField("#agreeTerms", [
        { rule: "required", errorMessage: "Bạn cần đồng ý với điều khoản." },
      ]);

    validator.onSuccess(async (event?: Event) => {
      if (event) event.preventDefault();

      setIsLoading(true);
      const loadingToast = toast.loading("Đang xử lý đăng ký...");

      try {
        const formData = new FormData(formRef.current!);
        const payload = {
          code: formData.get("code") as string,
          name: formData.get("name") as string,
          contact_email: formData.get("contact_email") as string,
          bic_codes: formData.get("bic_codes") as string,
          roleCode: "provider",
          password: formData.get("password") as string,
        };

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/client/provider/auth/register`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        const data = await response.json();

        if (data.code === "error") {
          throw new Error(data.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }

        toast.success("Tạo tài khoản thành công!", { id: loadingToast });
        setTimeout(() => {
          window.location.href = "/client/provider/login";
        }, 2000);
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
  }, [showPassword, showConfirmPassword]);

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
            Kiến tạo tương lai <br />
            <span className="text-[#1ed760]">Logistics Tự Động</span>
          </h1>
          <p className="mt-6 text-[#666666] dark:text-[#b3b3b3] max-w-md text-[16px] font-normal leading-[1.6]">
            Đăng ký ngay tài khoản nhà cung cấp để tham gia điều phối thông minh, tối ưu hóa quá trình xuất nhập tại cảng lớn nhất.
          </p>
        </div>

        <div className="relative z-10 bg-[#f8f8f8] dark:bg-[#1f1f1f] border border-[#e5e5e5] dark:border-[#272727] rounded-[8px] p-6 max-w-md shadow-sm dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-colors duration-300">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-[500px] bg-[#1ed760]/10 flex items-center justify-center shrink-0">
              <Shield className="text-[#1ed760] h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-[18px]">Bảo Mật Hệ Thống</h4>
              <p className="text-[14px] text-[#666666] dark:text-[#b3b3b3] mt-2 leading-[1.6]">
                Dữ liệu tài khoản của cán bộ điều hành được mã hóa nhiều lớp, tuân thủ nghiêm ngặt quy chuẩn bảo mật quốc tế.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-[420px] py-12">
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
                Đăng Ký Mới
              </CardTitle>
              <CardDescription className="text-center text-[#666666] dark:text-[#b3b3b3] text-[14px]">
                Thiết lập tài khoản nhà cung cấp
              </CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10">
              <form ref={formRef} className="space-y-5">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-[#121212] dark:text-[#ffffff] text-[12px] font-bold uppercase tracking-[1.5px]">
                      Mã nhà cung cấp
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#999999] dark:text-[#b3b3b3] pointer-events-none">
                        <Shield className="h-5 w-5" />
                      </span>
                      <Input
                        id="code"
                        name="code"
                        type="text"
                        placeholder="VD: HLXU"
                        disabled={isLoading}
                        className="uppercase pl-12 py-6 bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] placeholder:text-[#999999] dark:placeholder:text-[#666666] focus-visible:ring-[#1ed760] focus-visible:border-transparent transition-all rounded-[8px] text-[16px] font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[#121212] dark:text-[#ffffff] text-[12px] font-bold uppercase tracking-[1.5px]">
                      Tên nhà cung cấp
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#999999] dark:text-[#b3b3b3] pointer-events-none">
                        <Building2 className="h-5 w-5" />
                      </span>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="VD: Hapag-Lloyd"
                        disabled={isLoading}
                        className="pl-12 py-6 bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] placeholder:text-[#999999] dark:placeholder:text-[#666666] focus-visible:ring-[#1ed760] focus-visible:border-transparent transition-all rounded-[8px] text-[16px] font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-[#121212] dark:text-[#ffffff] text-[12px] font-bold uppercase tracking-[1.5px]">
                      Email liên hệ / Đăng nhập
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#999999] dark:text-[#b3b3b3] pointer-events-none">
                        <Mail className="h-5 w-5" />
                      </span>
                      <Input
                        id="contact_email"
                        name="contact_email"
                        type="email"
                        placeholder="contact@hapag-lloyd.com"
                        disabled={isLoading}
                        className="pl-12 py-6 bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] placeholder:text-[#999999] dark:placeholder:text-[#666666] focus-visible:ring-[#1ed760] focus-visible:border-transparent transition-all rounded-[8px] text-[16px] font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bic_codes" className="text-[#121212] dark:text-[#ffffff] text-[12px] font-bold uppercase tracking-[1.5px]">
                      Mã BIC (Tùy chọn)
                    </Label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#999999] dark:text-[#b3b3b3] pointer-events-none">
                        <Ship className="h-5 w-5" />
                      </span>
                      <Input
                        id="bic_codes"
                        name="bic_codes"
                        type="text"
                        placeholder="VD: HLX, HLY"
                        disabled={isLoading}
                        className="uppercase pl-12 bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] placeholder:text-[#999999] dark:placeholder:text-[#666666] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors rounded-[4px] h-12 text-[14px] font-bold"
                      />
                    </div>
                  </div>
                </div>


                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#121212] dark:text-[#ffffff] text-[12px] font-bold uppercase tracking-[1.5px]">
                    Mật khẩu
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#999999] dark:text-[#b3b3b3] pointer-events-none">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      id="passwordInput"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Tối thiểu 6 ký tự"
                      disabled={isLoading}
                      className="pl-12 pr-12 bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] placeholder:text-[#999999] dark:placeholder:text-[#666666] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors rounded-[4px] h-12 text-[14px] font-bold"
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
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-[#121212] dark:text-[#ffffff] text-[12px] font-bold uppercase tracking-[1.5px]">
                    Xác nhận mật khẩu
                  </Label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-[#999999] dark:text-[#b3b3b3] pointer-events-none">
                      <Lock className="h-5 w-5" />
                    </span>
                    <Input
                      id="confirmPasswordInput"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Nhập lại mật khẩu"
                      disabled={isLoading}
                      className="pl-12 pr-12 bg-[#ffffff] dark:bg-[#121212] border border-[#d6dbde] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] placeholder:text-[#999999] dark:placeholder:text-[#666666] focus-visible:ring-0 focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] hover:border-[#00754A] transition-colors rounded-[4px] h-12 text-[14px] font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#999999] dark:text-[#b3b3b3] hover:text-[#121212] dark:hover:text-[#ffffff] transition-colors"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input
                    id="agreeTerms"
                    name="agreeTerms"
                    type="checkbox"
                    disabled={isLoading}
                    className="mt-1 h-5 w-5 rounded-[4px] border-[#e5e5e5] dark:border-[#272727] bg-[#f8f8f8] dark:bg-[#121212] accent-[#1ed760] cursor-pointer"
                  />
                  <Label htmlFor="agreeTerms" className="text-[12px] text-[#666666] dark:text-[#b3b3b3] font-normal leading-relaxed cursor-pointer select-none">
                    Tôi đồng ý tuân thủ các quy định bảo mật nội bộ và hệ thống quản trị LogiPort.
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[2px] py-7 rounded-[500px] transition-all duration-200 mt-6 border-none text-[14px]"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Đăng ký tài khoản"}
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-[#e5e5e5] dark:border-[#272727] text-[14px] text-center text-[#666666] dark:text-[#b3b3b3] font-bold">
                <p>
                  Đã có tài khoản?{" "}
                  <Link href="/client/provider/login" className="text-[#121212] dark:text-[#ffffff] hover:text-[#1ed760] transition-colors ml-1 uppercase tracking-wider text-[12px]">
                    Đăng nhập
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
