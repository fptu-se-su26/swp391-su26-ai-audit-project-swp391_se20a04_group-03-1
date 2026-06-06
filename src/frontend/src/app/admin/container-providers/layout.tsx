import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hãng Tàu",
  description: "Quản lý danh sách hãng tàu.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
