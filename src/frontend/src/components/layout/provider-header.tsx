"use client";

import { ClientHeader } from "@/components/layout/client-header";
import { useProviderProfile, companyInitials } from "@/lib/use-client-profile";

interface ProviderHeaderProps {
  onMenuClick?: () => void;
}

/**
 * Header cổng hãng tàu.
 *
 * Chưa gắn chuông thông báo: hiện chưa có sự kiện nào của hệ thống nhắm riêng
 * tới hãng tàu, gắn chuông vào sẽ luôn rỗng. Khi có luồng sự kiện (vd container
 * của hãng vừa vào/ra cảng) chỉ cần thêm notificationsPath là xong.
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
