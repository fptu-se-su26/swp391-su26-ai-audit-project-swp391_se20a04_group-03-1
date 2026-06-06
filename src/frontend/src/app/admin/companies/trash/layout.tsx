import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thùng rác Công ty",
  description: "Các công ty đã bị xóa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
