import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Báo cáo",
  description: "Phân tích và xuất báo cáo dữ liệu cảng.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
