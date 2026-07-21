"use client";

import { useCallback, useEffect, useState } from "react";

export interface AdminProfile {
  _id: string;
  fullName: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  roleCode: string | null;
  roleName: string | null;
  gateName: string | null;
  isSuperAdmin: boolean;
}

/**
 * Hồ sơ của admin đang đăng nhập. Dùng ở header (hiện tên) và trang hồ sơ.
 * Trả `refresh` để trang hồ sơ cập nhật lại tên ngay sau khi lưu.
 */
export function useAdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/me`, {
        credentials: "include",
      });
      const json = await res.json();
      setProfile(json.code === "success" ? json.data : null);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, refresh: fetchProfile };
}

/** Chữ cái đầu của họ và tên — dùng làm avatar chữ khi không có ảnh. */
export function initialsOf(fullName?: string | null): string {
  if (!fullName) return "?";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}
