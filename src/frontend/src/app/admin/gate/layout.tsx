import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nhật ký Cổng",
  description: "Giám sát xe ra vào qua cổng.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
