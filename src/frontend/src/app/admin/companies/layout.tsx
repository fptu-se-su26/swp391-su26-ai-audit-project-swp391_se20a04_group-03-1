import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Công ty",
  description: "Quản lý danh sách công ty vận tải.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
