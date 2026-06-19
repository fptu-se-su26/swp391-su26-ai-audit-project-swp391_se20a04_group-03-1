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
import { Plus, Trash2, Box, Settings as SettingsIcon, Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ProviderSettingsPage() {
  const [bicCodes, setBicCodes] = useState<string[]>([]);
  const [newBic, setNewBic] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/provider/settings`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data.code === "success") {
          setBicCodes(data.data.bic_codes || []);
        } else {
          toast.error(data.message || "Không thể lấy cấu hình.");
        }
      } catch (error) {
        toast.error("Lỗi kết nối.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleAddBic = () => {
    const cleanBic = newBic.trim().toUpperCase();
    if (!cleanBic) return;
    
    if (cleanBic.length !== 4) {
      toast.error("Mã BIC phải có đúng 4 chữ cái (VD: HLXU).");
      return;
    }
    
    if (!/^[A-Z]{4}$/.test(cleanBic)) {
      toast.error("Mã BIC chỉ được chứa chữ cái A-Z.");
      return;
    }

    if (bicCodes.includes(cleanBic)) {
      toast.error("Mã BIC này đã tồn tại.");
      return;
    }

    setBicCodes([...bicCodes, cleanBic]);
    setNewBic("");
  };

  const handleRemoveBic = (codeToRemove: string) => {
    setBicCodes(bicCodes.filter((c) => c !== codeToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    const loadingToast = toast.loading("Đang lưu cấu hình...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/provider/settings/bic`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bic_codes: bicCodes }),
        credentials: "include",
      });
      const data = await res.json();
      
      if (data.code === "success") {
        toast.success(data.message || "Đã lưu thành công.", { id: loadingToast });
        setBicCodes(data.data);
      } else {
        toast.error(data.message || "Không thể lưu cấu hình.", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Lỗi kết nối.", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760] mb-4" />
        <p className="text-[#666666] font-bold uppercase tracking-wider text-[12px]">Đang tải cấu hình...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Cài đặt hệ thống
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-2 uppercase tracking-wider text-[12px]">
            Cấu hình các tham số cho hãng tàu
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-8 py-6 gap-2 border-none transition-all duration-200 shadow-lg shadow-[#1ed760]/20"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Lưu Cấu Hình
        </Button>
      </div>

      <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors duration-300">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-[#1ed760]/10 rounded-[500px] flex items-center justify-center">
              <Box className="h-6 w-6 text-[#1db954]" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
                Cấu hình mã BIC (Tiền tố Container)
              </CardTitle>
              <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[12px] uppercase tracking-[1px] mt-1">
                Các mã BIC 4 chữ cái (VD: HLXU, MSCU) thuộc sở hữu của hãng tàu
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="bic" className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                Thêm mã BIC mới
              </Label>
              <div className="flex gap-3">
                <Input
                  id="bic"
                  value={newBic}
                  onChange={(e) => setNewBic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddBic()}
                  placeholder="Nhập 4 chữ cái (VD: HLXU)"
                  maxLength={4}
                  className="uppercase max-w-[250px] bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:ring-1 focus-visible:ring-[#1ed760] transition-all"
                />
                <Button 
                  onClick={handleAddBic}
                  className="bg-[#121212] dark:bg-[#ffffff] text-[#ffffff] dark:text-[#121212] hover:bg-[#333333] dark:hover:bg-[#e5e5e5] h-12 px-8 rounded-[8px] font-black uppercase tracking-wider transition-all"
                >
                  <Plus className="h-4 w-4 mr-2" /> Thêm
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5e5e5] dark:border-[#272727]">
            <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff] mb-4 block">
              Danh sách mã BIC hiện tại ({bicCodes.length})
            </Label>
            
            {bicCodes.length === 0 ? (
              <div className="p-8 text-center bg-[#f8f8f8] dark:bg-[#121212] rounded-[12px] border border-dashed border-[#e5e5e5] dark:border-[#272727]">
                <p className="text-[#666666] font-bold text-[14px]">Chưa có mã BIC nào được cấu hình.</p>
                <p className="text-[#999999] text-[12px] mt-1">Hãy thêm mã BIC để sử dụng khi khai báo container.</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {bicCodes.map((code) => (
                  <div 
                    key={code}
                    className="group flex items-center gap-2 bg-[#1ed760]/10 border border-[#1ed760]/20 hover:border-[#1ed760]/50 text-[#1db954] px-4 py-2 rounded-[500px] transition-all duration-300 hover:shadow-md hover:shadow-[#1ed760]/10 hover:-translate-y-0.5"
                  >
                    <span className="font-black text-[15px] tracking-wide">{code}</span>
                    <button
                      onClick={() => handleRemoveBic(code)}
                      className="h-6 w-6 rounded-full opacity-50 group-hover:opacity-100 hover:!opacity-100 hover:bg-[#f3727f] hover:text-[#ffffff] flex items-center justify-center transition-all text-[#1db954]"
                      title="Xóa mã BIC"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
