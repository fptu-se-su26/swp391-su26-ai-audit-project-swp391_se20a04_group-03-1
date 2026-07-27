"use client";

import { ClientHeader } from "@/components/layout/client-header";
import { useProviderProfile, companyInitials } from "@/lib/use-client-profile";

interface ProviderHeaderProps {
  onMenuClick?: () => void;
}

/**
 * Header cổng hãng tàu.
 *
 * Chuông nhận thông báo khi container của hãng đổi trạng thái cảng — sự kiện do
 * scan.controller phát ra ở luồng qua cổng.
 */
export function ProviderHeader({ onMenuClick }: ProviderHeaderProps) {
  const { profile, loading } = useProviderProfile();

  return (
    <ClientHeader
      onMenuClick={onMenuClick}
      homeHref="/client/provider/dashboard"
      logoutPath="/client/provider/auth/logout"
      loginHref="/client/provider/login"
      accountHref="/client/provider/settings"
      notificationsPath="/client/provider/notifications"
      loading={loading}
      initials={companyInitials(profile?.name)}
      name={profile?.name || "Hãng tàu"}
      subtitle={profile?.code || "Nhà cung cấp container"}
      email={profile?.contact_email || ""}
      highlight={
        profile?.bic_codes?.length
          ? `${profile.bic_codes.length} mã BIC đang quản lý`
          : null
      }
    />
  );
}
