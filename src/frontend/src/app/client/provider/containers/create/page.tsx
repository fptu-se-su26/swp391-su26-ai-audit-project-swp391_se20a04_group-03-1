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
import { ArrowLeft, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import JustValidate from "just-validate";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/CustomSelect";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateContainerPage() {
  const router = useRouter();
  
  const [formType, setFormType] = useState("20ft");
  const [formStatus, setFormStatus] = useState("Hàng");
  const [formPortStatus, setFormPortStatus] = useState("Chưa nhập cảng");
  const [bicCodes, setBicCodes] = useState<string[]>([]);
  const [selectedBic, setSelectedBic] = useState("");
  const [saving, setSaving] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  // Fetch BIC Codes
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/provider/settings`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.code === "success" && data.data?.bic_codes) {
          setBicCodes(data.data.bic_codes);
          if (data.data.bic_codes.length > 0) {
            setSelectedBic(data.data.bic_codes[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy BIC code:", error);
      }
    };
    fetchSettings();
  }, []);

  // Form Validator
  useEffect(() => {
    if (!formRef.current) return;

    const validator = new JustValidate(formRef.current, {
      errorFieldCssClass: "border-[#f3727f] focus:ring-[#f3727f] focus:border-[#f3727f]",
      errorLabelCssClass: "text-[#f3727f] text-[12px] font-bold uppercase tracking-wider mt-1 block",
    });

    validatorRef.current = validator;

    validator
      .addField("#number", [
        { rule: "required", errorMessage: "Bắt buộc nhập 7 chữ số." },
        { rule: "customRegexp", value: /^[0-9]{7}$/i, errorMessage: "Phải bao gồm đúng 7 chữ số (VD: 1234567)" }
      ])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        
        if (!selectedBic) {
          toast.error("Vui lòng chọn hoặc cấu hình mã BIC trước.");
          return;
        }

        const formData = new FormData(formRef.current!);
        const numberDigits = formData.get("number")?.toString().trim();
        const fullContainerNo = `${selectedBic}${numberDigits}`;
        
        const payload = {
          number: fullContainerNo,
          type: formType,
          status: formStatus,
          portStatus: formPortStatus,
        };

        setSaving(true);
        const loadingToast = toast.loading("Đang đăng ký container...");

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/provider/containers/create`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          });
          const data = await res.json();

          if (data.code === "success") {
            toast.success(data.message || "Thành công!", { id: loadingToast });
            setTimeout(() => {
              router.push("/client/provider/containers");
            }, 1000);
          } else {
            toast.error(data.message || "Đã xảy ra lỗi.", { id: loadingToast });
            setSaving(false);
          }
        } catch (error) {
          toast.error("Lỗi kết nối mạng.", { id: loadingToast });
          setSaving(false);
        }
      });

    return () => {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
    };
  }, [formType, formStatus, formPortStatus, selectedBic, router]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Khai báo Container
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] mt-2 text-[16px]">
            Đăng ký container mới vào hệ thống LogiPort
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/client/provider/containers">
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2 px-6 h-12"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible border-t-4 border-t-[#1ed760]">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
            Khai báo mới
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form ref={formRef} className="space-y-8 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label
                  htmlFor="number"
                  className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                >
                  Mã BIC Container
                </Label>
                <div className="flex gap-2">
                  <div className="w-[100px]">
                    <CustomSelect
                      value={selectedBic}
                      onChange={setSelectedBic}
                      options={bicCodes.map((bic) => ({ value: bic, label: bic }))}
                      placeholder={bicCodes.length > 0 ? "BIC" : "Chưa có"}
                    />
                  </div>
                  <Input
                    id="number"
                    name="number"
                    placeholder="VD: 1234567"
                    maxLength={7}
                    className="flex-1 uppercase bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:ring-[#1ed760] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                  Kích thước / Loại
                </Label>
                <CustomSelect
                  value={formType}
                  onChange={setFormType}
                  options={[
                    { value: "20ft", label: "20ft Standard" },
                    { value: "40ft", label: "40ft Standard" },
                    { value: "40ft HC", label: "40ft High Cube" },
                    { value: "45ft", label: "45ft High Cube" },
                  ]}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                  Tình trạng (Rỗng/Hàng)
                </Label>
                <CustomSelect
                  value={formStatus}
                  onChange={setFormStatus}
                  options={[
                    { value: "Hàng", label: "Có Hàng (Full)" },
                    { value: "Rỗng", label: "Rỗng (Empty)" },
                  ]}
                />
              </div>

              <div className="space-y-3">
                <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                  Trạng thái LogiPort
                </Label>
                <CustomSelect
                  value={formPortStatus}
                  onChange={setFormPortStatus}
                  options={[
                    { value: "Chưa nhập cảng", label: "Chưa nhập cảng" },
                    { value: "Đã nhập cảng", label: "Đã nhập cảng" },
                    { value: "Đang lưu bãi", label: "Đang lưu bãi" },
                    { value: "Đã xuất cảng", label: "Đã xuất cảng" },
                  ]}
                />
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-[#e5e5e5] dark:border-[#272727]">
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] px-8 h-12 rounded-[500px]"
              >
                {saving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Hoàn Tất Khai Báo"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
