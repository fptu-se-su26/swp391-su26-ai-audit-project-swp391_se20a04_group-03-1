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
import { useState, useRef, useEffect, use } from "react";
import JustValidate from "just-validate";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/CustomSelect";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function EditContainerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [formType, setFormType] = useState("20ft");
  const [formStatus, setFormStatus] = useState("Hàng");
  const [formPortStatus, setFormPortStatus] = useState("Chưa nhập cảng");
  const [bicCodes, setBicCodes] = useState<string[]>([]);
  const [selectedBic, setSelectedBic] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  // Fetch BIC Codes & Container Detail
  useEffect(() => {
    const fetchSettingsAndDetail = async () => {
      try {
        const [settingsRes, detailRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/provider/settings`, { credentials: "include" }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/provider/containers/detail/${resolvedParams.id}`, { credentials: "include" })
        ]);

        const settingsData = await settingsRes.json();
        const detailData = await detailRes.json();

        if (settingsData.code === "success" && settingsData.data?.bic_codes) {
          setBicCodes(settingsData.data.bic_codes);
        }

        if (detailData.code === "success" && detailData.data) {
          const container = detailData.data;
          setFormType(container.type);
          setFormStatus(container.status);
          setFormPortStatus(container.portStatus || "Chưa nhập cảng");

          if (container.number && container.number.length >= 11) {
            const bic = container.number.substring(0, 4);
            const digits = container.number.substring(4);
            setSelectedBic(bic);
            
            setTimeout(() => {
              const el = document.getElementById("number") as HTMLInputElement;
              if (el) el.value = digits;
            }, 100);
          } else {
            setTimeout(() => {
              const el = document.getElementById("number") as HTMLInputElement;
              if (el) el.value = container.number;
            }, 100);
          }
        } else {
          toast.error(detailData.message || "Không thể tải thông tin container.");
        }
      } catch (error) {
        toast.error("Lỗi kết nối.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettingsAndDetail();
  }, [resolvedParams.id]);

  // Form Validator
  useEffect(() => {
    if (loading || !formRef.current) return;

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
          id: resolvedParams.id,
          number: fullContainerNo,
          type: formType,
          status: formStatus,
          portStatus: formPortStatus,
        };

        setSaving(true);
        const loadingToast = toast.loading("Đang cập nhật container...");

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/provider/containers/update`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
            credentials: "include",
          });
          const data = await res.json();

          if (data.code === "success") {
            toast.success(data.message || "Cập nhật thành công!", { id: loadingToast });
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
  }, [loading, formType, formStatus, formPortStatus, selectedBic, router, resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760] mb-4" />
        <p className="text-[#666666] font-bold uppercase tracking-wider text-[12px]">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Cập nhật Container
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] mt-2 text-[16px]">
            Chỉnh sửa thông tin container hiện tại
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

      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible border-t-4 border-t-[#3b82f6]">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
            Sửa thông tin
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
                  "Lưu Thay Đổi"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
