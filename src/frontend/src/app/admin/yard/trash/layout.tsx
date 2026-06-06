import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thùng rác Bãi đỗ",
  description: "Các bãi đỗ đã bị xóa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
