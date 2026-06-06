import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thùng rác Hãng Tàu",
  description: "Các hãng tàu đã bị xóa.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
