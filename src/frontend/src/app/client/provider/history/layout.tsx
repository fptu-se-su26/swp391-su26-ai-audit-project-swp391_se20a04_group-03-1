import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Lịch sử Giao dịch",
  description:
    "Toàn bộ lượt ra vào cảng của container thuộc hãng tàu, có tìm kiếm và lọc theo chiều.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
