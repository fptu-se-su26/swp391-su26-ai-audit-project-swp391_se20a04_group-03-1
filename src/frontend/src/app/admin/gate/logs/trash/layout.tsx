import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thùng rác Nhật ký",
  description: "Nhật ký cổng đã bị xóa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
