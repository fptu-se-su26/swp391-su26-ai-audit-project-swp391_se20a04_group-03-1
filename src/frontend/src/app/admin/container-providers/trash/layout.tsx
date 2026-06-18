import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thùng rác Nhà Cung Cấp",
  description: "Các nhà cung cấp đã bị xóa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
