"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Hồ sơ của tài khoản client đang đăng nhập (doanh nghiệp vận tải / hãng tàu).
 *
 * Tách khỏi use-admin-profile vì hai bên dùng cookie khác nhau, endpoint khác
 * nhau và hình dạng dữ liệu khác nhau — gộp lại chỉ tạo một hàm đầy nhánh if.
 */

export interface CompanyProfile {
  _id: string;
  companyCode: string;
  companyName: string;
  contactPerson: string;
  contactPhone: string;
  email: string;
  status: "Active" | "Inactive" | "Suspended";
  createdAt: string;
  roleCode: string | null;
  roleName: string | null;
  totalDrivers: number;
  totalTrucks: number;
}

export interface ProviderProfile {
  _id: string;
  code: string | null;
  name: string | null;
  contact_email: string | null;
  bic_codes: string[];
}

const API = process.env.NEXT_PUBLIC_API_URL;

export function useCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API}/client/settings/me`, {
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

export function useProviderProfile() {
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API}/client/provider/settings`, {
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

/**
 * Chữ cái đầu dùng làm avatar chữ.
 *
 * Khác initialsOf bên admin: tên doanh nghiệp hay có tiền tố pháp lý ("Công ty
 * TNHH ...") nên lấy chữ đầu của hai từ ĐẦU tiên sau khi bỏ tiền tố, thay vì
 * chữ đầu của họ và tên.
 */
const LEGAL_PREFIXES = [
  "công",
  "ty",
  "cty",
  "tnhh",
  "cp",
  "cổ",
  "phần",
  "mtv",
  "doanh",
  "nghiệp",
];

export function companyInitials(name?: string | null): string {
  if (!name) return "?";
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => !LEGAL_PREFIXES.includes(w.toLowerCase()));
  const source = words.length > 0 ? words : name.trim().split(/\s+/);
  if (source.length === 1) return source[0].slice(0, 2).toUpperCase();
  return (source[0].charAt(0) + source[1].charAt(0)).toUpperCase();
}
