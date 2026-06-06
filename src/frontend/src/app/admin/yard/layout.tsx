import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Bãi đỗ",
  description: "Giám sát và cấu hình bãi đỗ container.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
