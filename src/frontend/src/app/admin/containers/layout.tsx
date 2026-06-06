import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quản lý Container",
  description: "Quản lý trạng thái và vị trí container.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
