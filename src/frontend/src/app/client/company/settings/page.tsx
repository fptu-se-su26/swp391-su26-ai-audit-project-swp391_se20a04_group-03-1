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
  Building2,
  KeyRound,
  Loader2,
  LogOut,
  Save,
  ShieldCheck,
  UserSquare2,
  Truck,
  Lock,
  Info,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCompanyProfile, companyInitials } from "@/lib/use-client-profile";

/**
 * Trang cài đặt của doanh nghiệp vận tải.
 *
 * Chỉ gồm những gì hệ thống thật sự làm được, cố ý KHÔNG bịa thêm mục:
 *   1. Hồ sơ doanh nghiệp — sửa được tên, người liên hệ, số điện thoại.
 *   2. Thông tin do cảng cấp — chỉ đọc (mã DN, email, loại hình, trạng thái).
 *   3. Bảo mật — đổi mật khẩu, đăng xuất khỏi mọi thiết bị.
 *
 * Không có mục "thông báo qua email/SMS" hay "sao lưu dữ liệu" vì backend không
 * có gì đứng sau, thêm vào chỉ tạo nút bấm không làm gì.
 */

const API = process.env.NEXT_PUBLIC_API_URL;
const LOGIN_URL = "/client/company/login";

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-[#1ed760]/10 text-[#1db954] border-[#1ed760]/20",
  Inactive: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  Suspended: "bg-[#f3727f]/10 text-[#f3727f] border-[#f3727f]/20",
};

const STATUS_LABEL: Record<string, string> = {
  Active: "Đang hoạt động",
  Inactive: "Chờ kích hoạt",
  Suspended: "Tạm khóa",
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

/** Ô chỉ đọc cho các trường do cảng cấp — hiển thị kèm ổ khóa cho rõ vì sao không sửa được. */
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

export default function CompanySettingsPage() {
  const { profile, loading, refresh } = useCompanyProfile();

  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  // Đổ dữ liệu vào form khi hồ sơ về. Chỉ chạy khi profile đổi tham chiếu nên
  // không đè lên những gì người dùng đang gõ dở.
  useEffect(() => {
    if (!profile) return;
    setCompanyName(profile.companyName || "");
    setContactPerson(profile.contactPerson || "");
    setContactPhone(profile.contactPhone || "");
  }, [profile]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const t = toast.loading("Đang lưu thông tin...");
    try {
      const res = await fetch(`${API}/client/settings/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ companyName, contactPerson, contactPhone }),
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

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp.");
      return;
    }
    setSavingPassword(true);
    const t = toast.loading("Đang đổi mật khẩu...");
    try {
      const res = await fetch(`${API}/client/settings/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message || "Đổi mật khẩu thành công.", { id: t });
        // Backend đã hủy phiên và xóa cookie -> mọi request sau đều 401,
        // đưa thẳng về trang đăng nhập thay vì để người dùng gặp lỗi liên tục.
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
      const res = await fetch(`${API}/client/settings/logout-all`, {
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
          Đang tải thông tin tài khoản...
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
          Cài đặt tài khoản
        </h1>
        <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-2 uppercase tracking-wider text-[12px]">
          Thông tin doanh nghiệp và bảo mật đăng nhập
        </p>
      </div>

      {/* Thẻ nhận diện */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-20 w-20 rounded-[500px] bg-[#1ed760] text-[#121212] flex items-center justify-center font-black text-2xl shrink-0">
            {companyInitials(profile.companyName)}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-2xl font-black text-[#121212] dark:text-[#ffffff] truncate">
              {profile.companyName}
            </h2>
            <p className="text-[14px] font-bold text-[#666666] dark:text-[#b3b3b3] truncate">
              {profile.email}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border ${
                  STATUS_STYLE[profile.status] || STATUS_STYLE.Inactive
                }`}
              >
                {STATUS_LABEL[profile.status] || profile.status}
              </span>
              {profile.roleName && (
                <span className="inline-flex items-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20">
                  {profile.roleName}
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
              <UserSquare2 className="h-5 w-5 mx-auto text-[#666666] dark:text-[#b3b3b3]" />
              <p className="text-2xl font-black text-[#121212] dark:text-[#ffffff] mt-1">
                {profile.totalDrivers}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#999999]">
                Tài xế
              </p>
            </div>
            <div className="text-center">
              <Truck className="h-5 w-5 mx-auto text-[#666666] dark:text-[#b3b3b3]" />
              <p className="text-2xl font-black text-[#121212] dark:text-[#ffffff] mt-1">
                {profile.totalTrucks}
              </p>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#999999]">
                Xe
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hồ sơ doanh nghiệp */}
      <SettingCard
        icon={Building2}
        title="Hồ sơ doanh nghiệp"
        description="Thông tin liên hệ hiển thị cho ban quản lý cảng"
      >
        <form onSubmit={saveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="companyName" className={labelClass}>
                Tên doanh nghiệp
              </Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                maxLength={150}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPerson" className={labelClass}>
                Người liên hệ
              </Label>
              <Input
                id="contactPerson"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                maxLength={100}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone" className={labelClass}>
                Số điện thoại
              </Label>
              <Input
                id="contactPhone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="VD: 0912345678"
                maxLength={11}
                className={inputClass}
              />
            </div>
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
              <ReadOnlyField label="Mã doanh nghiệp" value={profile.companyCode} />
              <ReadOnlyField label="Email đăng nhập" value={profile.email} />
              <ReadOnlyField
                label="Loại hình"
                value={profile.roleName || profile.roleCode || "—"}
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
