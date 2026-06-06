import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thùng rác Tài xế",
  description: "Các tài xế đã bị xóa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
