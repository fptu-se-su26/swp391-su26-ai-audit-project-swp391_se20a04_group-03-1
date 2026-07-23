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
import {
  Plus,
  Trash2,
  Box,
  Loader2,
  Save,
  Ship,
  KeyRound,
  ShieldCheck,
  LogOut,
  Lock,
  Info,
  Boxes,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useProviderProfile, companyInitials } from "@/lib/use-client-profile";

/**
 * Trang cài đặt của hãng tàu.
 *
 * Gồm đúng những gì hệ thống làm được:
 *   1. Hồ sơ — sửa tên hãng tàu.
 *   2. Thông tin do cảng cấp — chỉ đọc (mã hãng, email đăng nhập, trạng thái).
 *   3. Mã BIC — phần cấu hình nghiệp vụ riêng của hãng tàu (giữ nguyên như cũ).
 *   4. Bảo mật — đổi mật khẩu, đăng xuất khỏi mọi thiết bị.
 */

const API = process.env.NEXT_PUBLIC_API_URL;
const LOGIN_URL = "/client/provider/login";

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: "bg-[#1ed760]/10 text-[#1db954] border-[#1ed760]/20",
  INACTIVE: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  SUSPENDED: "bg-[#f3727f]/10 text-[#f3727f] border-[#f3727f]/20",
};

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Chờ kích hoạt",
  SUSPENDED: "Tạm khóa",
};

const inputClass =
  "bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:ring-1 focus-visible:ring-[#1ed760] transition-all";

const labelClass =
  "text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]";

function SettingCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
      <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-[#1ed760]/10 rounded-[500px] flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-[#1db954]" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              {title}
            </CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[12px] uppercase tracking-[1px] mt-1">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-2">
      <Label className={labelClass}>{label}</Label>
      <div className="flex items-center gap-2 h-12 px-4 rounded-[8px] bg-[#f0f0f0] dark:bg-[#0d0d0d] border border-[#e5e5e5] dark:border-[#272727]">
        <Lock className="h-3.5 w-3.5 text-[#999999] shrink-0" />
        <span className="font-bold text-[14px] text-[#666666] dark:text-[#b3b3b3] truncate">
          {value}
        </span>
      </div>
    </div>
  );
}

export default function ProviderSettingsPage() {
  const { profile, loading, refresh } = useProviderProfile();

  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [bicCodes, setBicCodes] = useState<string[]>([]);
  const [newBic, setNewBic] = useState("");
  const [savingBic, setSavingBic] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  // Đổ dữ liệu vào form khi hồ sơ về.
  useEffect(() => {
    if (!profile) return;
    setName(profile.name || "");
    setBicCodes(profile.bic_codes || []);
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const t = toast.loading("Đang lưu thông tin...");
    try {
      const res = await fetch(`${API}/client/provider/settings/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message || "Đã lưu.", { id: t });
        refresh();
      } else {
        toast.error(json.message || "Không thể lưu thông tin.", { id: t });
      }
    } catch {
      toast.error("Lỗi kết nối.", { id: t });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddBic = () => {
    const clean = newBic.trim().toUpperCase();
    if (!clean) return;
    if (!/^[A-Z]{4}$/.test(clean)) {
      toast.error("Mã BIC phải gồm đúng 4 chữ cái A-Z (VD: HLXU).");
      return;
    }
    if (bicCodes.includes(clean)) {
      toast.error("Mã BIC này đã tồn tại.");
      return;
    }
    setBicCodes([...bicCodes, clean]);
    setNewBic("");
  };

  const saveBic = async () => {
    setSavingBic(true);
    const t = toast.loading("Đang lưu cấu hình...");
    try {
      const res = await fetch(`${API}/client/provider/settings/bic`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ bic_codes: bicCodes }),
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message || "Đã lưu thành công.", { id: t });
        setBicCodes(json.data);
        refresh();
      } else {
        toast.error(json.message || "Không thể lưu cấu hình.", { id: t });
      }
    } catch {
      toast.error("Lỗi kết nối.", { id: t });
    } finally {
      setSavingBic(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp.");
      return;
    }
    setSavingPassword(true);
    const t = toast.loading("Đang đổi mật khẩu...");
    try {
      const res = await fetch(`${API}/client/provider/settings/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message || "Đổi mật khẩu thành công.", { id: t });
        // Backend đã hủy phiên và xóa cookie -> mọi request sau đều lỗi,
        // đưa thẳng về trang đăng nhập.
        setTimeout(() => {
          window.location.href = LOGIN_URL;
        }, 1200);
      } else {
        toast.error(json.message || "Không thể đổi mật khẩu.", { id: t });
        setSavingPassword(false);
      }
    } catch {
      toast.error("Lỗi kết nối.", { id: t });
      setSavingPassword(false);
    }
  };

  const logoutEverywhere = async () => {
    setLoggingOut(true);
    const t = toast.loading("Đang đăng xuất...");
    try {
      const res = await fetch(`${API}/client/provider/settings/logout-all`, {
        method: "PATCH",
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message || "Đã đăng xuất.", { id: t });
        setTimeout(() => {
          window.location.href = LOGIN_URL;
        }, 900);
      } else {
        toast.error(json.message || "Không thể đăng xuất.", { id: t });
        setLoggingOut(false);
      }
    } catch {
      toast.error("Lỗi kết nối.", { id: t });
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760] mb-4" />
        <p className="text-[#666666] font-bold uppercase tracking-wider text-[12px]">
          Đang tải cấu hình...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <p className="text-[#121212] dark:text-[#ffffff] font-bold">
          Không lấy được thông tin tài khoản. Vui lòng đăng nhập lại.
        </p>
        <a href={LOGIN_URL}>
          <Button className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-wider px-6">
            Về trang đăng nhập
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <div>
        <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
          Cài đặt tài khoản
        </h1>
        <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-2 uppercase tracking-wider text-[12px]">
          Thông tin hãng tàu, mã BIC và bảo mật đăng nhập
        </p>
      </div>

      {/* Thẻ nhận diện */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-20 w-20 rounded-[500px] bg-[#1ed760] text-[#121212] flex items-center justify-center font-black text-2xl shrink-0">
            {companyInitials(profile.name)}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-2xl font-black text-[#121212] dark:text-[#ffffff] truncate">
              {profile.name}
            </h2>
            <p className="text-[14px] font-bold text-[#666666] dark:text-[#b3b3b3] truncate">
              {profile.contact_email}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border ${
                  STATUS_STYLE[profile.status] || STATUS_STYLE.INACTIVE
                }`}
              >
                {STATUS_LABEL[profile.status] || profile.status}
              </span>
              {profile.code && (
                <span className="inline-flex items-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20">
                  Mã {profile.code}
                </span>
              )}
              <span className="text-[12px] font-bold text-[#999999] dark:text-[#666666]">
                Tham gia từ{" "}
                {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
          <div className="flex gap-6 shrink-0">
            <div className="text-center">
              <Boxes className="h-5 w-5 mx-auto text-[#666666] dark:text-[#b3b3b3]" />
              <p className="text-2xl font-black text-[#121212] dark:text-[#ffffff] mt-1">
                {profile.totalContainers}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#999999]">
                Container
              </p>
            </div>
            <div className="text-center">
              <Box className="h-5 w-5 mx-auto text-[#666666] dark:text-[#b3b3b3]" />
              <p className="text-2xl font-black text-[#121212] dark:text-[#ffffff] mt-1">
                {bicCodes.length}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#999999]">
                Mã BIC
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hồ sơ hãng tàu */}
      <SettingCard
        icon={Ship}
        title="Hồ sơ hãng tàu"
        description="Tên hiển thị cho ban quản lý cảng và các doanh nghiệp vận tải"
      >
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className={labelClass}>
              Tên hãng tàu
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={150}
              className={inputClass}
            />
          </div>

          <div className="pt-6 border-t border-[#e5e5e5] dark:border-[#272727] space-y-4">
            <div className="flex items-start gap-3">
              <Info className="h-4 w-4 text-[#666666] dark:text-[#b3b3b3] shrink-0 mt-0.5" />
              <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3]">
                Các thông tin dưới đây do ban quản lý cảng cấp và xét duyệt nên
                không tự sửa được. Cần thay đổi, vui lòng liên hệ cảng.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ReadOnlyField label="Mã hãng tàu" value={profile.code || "—"} />
              <ReadOnlyField
                label="Email đăng nhập"
                value={profile.contact_email || "—"}
              />
              <ReadOnlyField
                label="Trạng thái"
                value={STATUS_LABEL[profile.status] || profile.status}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-8 h-12 gap-2 border-none shadow-lg shadow-[#1ed760]/20"
            >
              {savingProfile ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu thay đổi
            </Button>
          </div>
        </form>
      </SettingCard>

      {/* Mã BIC */}
      <SettingCard
        icon={Box}
        title="Mã BIC (Tiền tố Container)"
        description="Các mã BIC 4 chữ cái thuộc sở hữu của hãng tàu"
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="bic" className={labelClass}>
              Thêm mã BIC mới
            </Label>
            <div className="flex gap-3">
              <Input
                id="bic"
                value={newBic}
                onChange={(e) => setNewBic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddBic();
                  }
                }}
                placeholder="Nhập 4 chữ cái (VD: HLXU)"
                maxLength={4}
                className={`${inputClass} uppercase max-w-[250px]`}
              />
              <Button
                type="button"
                onClick={handleAddBic}
                className="bg-[#121212] dark:bg-[#ffffff] text-[#ffffff] dark:text-[#121212] hover:bg-[#333333] dark:hover:bg-[#e5e5e5] h-12 px-8 rounded-[8px] font-black uppercase tracking-wider"
              >
                <Plus className="h-4 w-4 mr-2" /> Thêm
              </Button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e5e5e5] dark:border-[#272727]">
            <Label className={`${labelClass} mb-4 block`}>
              Danh sách mã BIC hiện tại ({bicCodes.length})
            </Label>

            {bicCodes.length === 0 ? (
              <div className="p-8 text-center bg-[#f8f8f8] dark:bg-[#121212] rounded-[12px] border border-dashed border-[#e5e5e5] dark:border-[#272727]">
                <p className="text-[#666666] font-bold text-[14px]">
                  Chưa có mã BIC nào được cấu hình.
                </p>
                <p className="text-[#999999] text-[12px] mt-1">
                  Không có mã BIC thì hệ thống không nhận diện được container nào
                  thuộc hãng tàu của bạn.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {bicCodes.map((code) => (
                  <div
                    key={code}
                    className="group flex items-center gap-2 bg-[#1ed760]/10 border border-[#1ed760]/20 hover:border-[#1ed760]/50 text-[#1db954] px-4 py-2 rounded-[500px] transition-all duration-300 hover:shadow-md hover:shadow-[#1ed760]/10 hover:-translate-y-0.5"
                  >
                    <span className="font-black text-[15px] tracking-wide">
                      {code}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setBicCodes(bicCodes.filter((c) => c !== code))
                      }
                      className="h-6 w-6 rounded-full opacity-50 group-hover:opacity-100 hover:bg-[#f3727f] hover:text-[#ffffff] flex items-center justify-center transition-all text-[#1db954] cursor-pointer"
                      title="Xóa mã BIC"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={saveBic}
              disabled={savingBic}
              className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-8 h-12 gap-2 border-none shadow-lg shadow-[#1ed760]/20"
            >
              {savingBic ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Lưu mã BIC
            </Button>
          </div>
        </div>
      </SettingCard>

      {/* Đổi mật khẩu */}
      <SettingCard
        icon={KeyRound}
        title="Đổi mật khẩu"
        description="Sau khi đổi, mọi thiết bị đang đăng nhập sẽ bị đăng xuất"
      >
        <form onSubmit={changePassword} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className={labelClass}>
                Mật khẩu hiện tại
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className={labelClass}>
                Mật khẩu mới
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={labelClass}>
                Nhập lại mật khẩu mới
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className={inputClass}
              />
            </div>
          </div>
          <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3]">
            Mật khẩu mới cần ít nhất 6 ký tự và khác mật khẩu hiện tại.
          </p>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={savingPassword}
              className="bg-[#121212] dark:bg-[#ffffff] text-[#ffffff] dark:text-[#121212] hover:bg-[#333333] dark:hover:bg-[#e5e5e5] rounded-[500px] font-black uppercase tracking-[1.5px] px-8 h-12 gap-2"
            >
              {savingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              Đổi mật khẩu
            </Button>
          </div>
        </form>
      </SettingCard>

      {/* Phiên đăng nhập */}
      <SettingCard
        icon={ShieldCheck}
        title="Phiên đăng nhập"
        description="Hệ thống chỉ cho phép một phiên hoạt động tại một thời điểm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-[13px] font-bold text-[#666666] dark:text-[#b3b3b3] max-w-2xl">
            Nếu bạn nghi ngờ tài khoản đang được dùng ở nơi khác, hãy đăng xuất
            khỏi mọi thiết bị. Bạn sẽ cần đăng nhập lại ngay sau đó.
          </p>
          <Button
            onClick={logoutEverywhere}
            disabled={loggingOut}
            className="bg-[#f3727f] hover:bg-[#e05c6a] text-[#ffffff] rounded-[500px] font-black uppercase tracking-[1.5px] px-8 h-12 gap-2 shrink-0"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Đăng xuất mọi thiết bị
          </Button>
        </div>
      </SettingCard>
    </div>
  );
}
