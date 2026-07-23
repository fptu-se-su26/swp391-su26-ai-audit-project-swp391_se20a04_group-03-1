"use client";

import { ClientHeader } from "@/components/layout/client-header";
import { useCompanyProfile, companyInitials } from "@/lib/use-client-profile";

interface CompanyHeaderProps {
  onMenuClick?: () => void;
}

/** Header cổng doanh nghiệp vận tải — chỉ nối dữ liệu vào khung ClientHeader. */
export function CompanyHeader({ onMenuClick }: CompanyHeaderProps) {
  const { profile, loading } = useCompanyProfile();

  return (
    <ClientHeader
      onMenuClick={onMenuClick}
      homeHref="/client/company/dashboard"
      logoutPath="/client/auth/logout"
      loginHref="/client/company/login"
      accountHref="/client/company/settings"
      notificationsPath="/client/notifications"
      loading={loading}
      initials={companyInitials(profile?.companyName)}
      name={profile?.companyName || "Doanh nghiệp"}
      subtitle={profile?.roleName || profile?.roleCode || "Đơn vị vận tải"}
      email={profile?.email || ""}
      highlight={profile?.companyCode ? `Mã DN ${profile.companyCode}` : null}
    />
  );
}
