"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  UserCog,
  Mail,
  ShieldCheck,
  KeyRound,
  LogOut,
  Loader2,
  Building2,
  CalendarClock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminProfile, initialsOf } from "@/lib/use-admin-profile";
import { usePermissions } from "@/lib/permissions";

const API = process.env.NEXT_PUBLIC_API_URL;

export default function ProfilePage() {
  const router = useRouter();
  const { profile, loading, refresh } = useAdminProfile();
  const { permissions, isSuperAdmin } = usePermissions();

  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const [loggingOutAll, setLoggingOutAll] = useState(false);

  useEffect(() => {
    if (profile) setFullName(profile.fullName);
  }, [profile]);

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim() === profile?.fullName) {
      toast("Bạn chưa thay đổi gì");
      return;
    }
    setSavingName(true);
    try {
      const res = await fetch(`${API}/settings/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ fullName: fullName.trim() }),
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message);
        await refresh();
      } else {
        toast.error(json.message || "Không thể cập nhật");
      }
    } catch {
      toast.error("Không kết nối được máy chủ");
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Xác nhận mật khẩu không khớp");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`${API}/settings/me/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (json.code === "success") {
        // Backend đã hủy phiên đăng nhập -> bắt buộc đăng nhập lại.
        toast.success(json.message);
        setTimeout(() => router.push("/admin/login"), 1200);
      } else {
        toast.error(json.message || "Không thể đổi mật khẩu");
      }
    } catch {
      toast.error("Không kết nối được máy chủ");
    } finally {
      setSavingPassword(false);
    }
  };

  const logoutAll = async () => {
    setLoggingOutAll(true);
    try {
      const res = await fetch(`${API}/settings/me/logout-all`, {
        method: "PATCH",
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        toast.success(json.message);
        setTimeout(() => router.push("/admin/login"), 1000);
      } else {
        toast.error(json.message || "Không thể đăng xuất");
      }
    } catch {
      toast.error("Không kết nối được máy chủ");
    } finally {
      setLoggingOutAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-[#1ed760]" />
        <p className="mt-3 font-bold uppercase tracking-wider text-[12px] text-[#666666] dark:text-[#b3b3b3]">
          Đang tải thông tin tài khoản...
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <p className="py-32 text-center font-bold text-[#f3727f]">
        Không tải được thông tin tài khoản. Vui lòng đăng nhập lại.
      </p>
    );
  }

  const inputClass =
    "w-full px-5 py-3 rounded-[500px] bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[14px] font-bold text-[#121212] dark:text-[#ffffff] outline-none focus:border-[#1ed760] transition-colors disabled:opacity-60";
  const labelClass =
    "block text-[11px] font-black uppercase tracking-[1.5px] text-[#666666] dark:text-[#b3b3b3] mb-2";
  const btnClass =
    "inline-flex items-center gap-2 rounded-[500px] bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] text-[12px] px-6 py-3 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
          Tài khoản của tôi
        </h1>
        <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
          Thông tin cá nhân, mật khẩu và phiên đăng nhập của bạn.
        </p>
      </div>

      {/* Thẻ nhận diện */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="h-20 w-20 shrink-0 rounded-[500px] bg-[#1ed760] text-[#121212] flex items-center justify-center font-black text-2xl">
            {initialsOf(profile.fullName)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-2xl font-black text-[#121212] dark:text-[#ffffff] truncate">
              {profile.fullName}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-2 text-[13px] font-bold text-[#666666] dark:text-[#b3b3b3]">
              <span className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" /> {profile.email}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                {profile.roleName || profile.roleCode || "Chưa gán vai trò"}
              </span>
              {profile.gateName && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" /> Cổng {profile.gateName}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarClock className="h-4 w-4" />
                Tham gia{" "}
                {new Date(profile.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
          <span
            className={`shrink-0 self-start sm:self-center text-[11px] px-4 py-1.5 font-black uppercase tracking-wider rounded-[500px] ${
              profile.isActive
                ? "bg-[#1ed760]/10 text-[#1db954]"
                : "bg-[#f3727f]/10 text-[#f3727f]"
            }`}
          >
            {profile.isActive ? "Đang hoạt động" : "Chưa kích hoạt"}
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Đổi họ tên */}
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-[500px] bg-[#f8f8f8] dark:bg-[#272727] text-[#666666] dark:text-[#b3b3b3]">
                <UserCog className="h-5 w-5" />
              </div>
              <h2 className="text-[17px] font-black uppercase tracking-wider text-[#121212] dark:text-[#ffffff]">
                Thông tin cá nhân
              </h2>
            </div>

            <form onSubmit={saveName} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="fullName">
                  Họ và tên
                </label>
                <input
                  id="fullName"
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="email">
                  Email đăng nhập
                </label>
                <input id="email" className={inputClass} value={profile.email} disabled />
                <p className="text-[11px] font-bold text-[#999999] dark:text-[#666666] mt-2 px-2">
                  Email và vai trò do quản trị viên cấp cao thay đổi, bạn không tự
                  sửa được.
                </p>
              </div>
              <button type="submit" className={btnClass} disabled={savingName}>
                {savingName && <Loader2 className="h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </button>
            </form>
          </CardContent>
        </Card>

        {/* Đổi mật khẩu */}
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 rounded-[500px] bg-[#f8f8f8] dark:bg-[#272727] text-[#666666] dark:text-[#b3b3b3]">
                <KeyRound className="h-5 w-5" />
              </div>
              <h2 className="text-[17px] font-black uppercase tracking-wider text-[#121212] dark:text-[#ffffff]">
                Đổi mật khẩu
              </h2>
            </div>

            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className={labelClass} htmlFor="currentPassword">
                  Mật khẩu hiện tại
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  className={inputClass}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="newPassword">
                  Mật khẩu mới
                </label>
                <input
                  id="newPassword"
                  type="password"
                  className={inputClass}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="confirmPassword">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className={inputClass}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <p className="text-[11px] font-bold text-[#999999] dark:text-[#666666] px-2">
                Đổi mật khẩu sẽ đăng xuất bạn khỏi mọi thiết bị.
              </p>
              <button type="submit" className={btnClass} disabled={savingPassword}>
                {savingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
                Đổi mật khẩu
              </button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Quyền hạn được cấp */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 rounded-[500px] bg-[#f8f8f8] dark:bg-[#272727] text-[#666666] dark:text-[#b3b3b3]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-[17px] font-black uppercase tracking-wider text-[#121212] dark:text-[#ffffff]">
              Quyền hạn được cấp
            </h2>
          </div>

          {isSuperAdmin ? (
            <p className="text-[14px] font-bold text-[#1db954]">
              Bạn là Super Admin — có toàn quyền trên mọi chức năng của hệ thống.
            </p>
          ) : permissions.length === 0 ? (
            <p className="text-[14px] font-bold text-[#666666] dark:text-[#b3b3b3]">
              Vai trò của bạn chưa được cấp quyền nào.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {permissions.map((p) => (
                <div
                  key={p.resource}
                  className="p-4 rounded-[12px] bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727]"
                >
                  <p className="font-black text-[13px] text-[#121212] dark:text-[#ffffff]">
                    {p.resource}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.actions.map((a) => (
                      <span
                        key={a}
                        className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-[500px] bg-[#1ed760]/10 text-[#1db954]"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phiên đăng nhập */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <h2 className="text-[17px] font-black uppercase tracking-wider text-[#121212] dark:text-[#ffffff]">
              Phiên đăng nhập
            </h2>
            <p className="text-[13px] font-bold text-[#666666] dark:text-[#b3b3b3] mt-1.5 max-w-xl">
              Hệ thống chỉ cho phép một phiên đăng nhập cùng lúc. Nếu nghi ngờ tài
              khoản bị dùng ở nơi khác, hãy đăng xuất toàn bộ thiết bị.
            </p>
          </div>
          <button
            onClick={logoutAll}
            disabled={loggingOutAll}
            className="shrink-0 inline-flex items-center gap-2 rounded-[500px] border border-[#f3727f] text-[#f3727f] hover:bg-[#f3727f] hover:text-[#ffffff] font-black uppercase tracking-[1.5px] text-[12px] px-6 py-3 transition-colors cursor-pointer disabled:opacity-50"
          >
            {loggingOutAll ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Đăng xuất mọi thiết bị
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
