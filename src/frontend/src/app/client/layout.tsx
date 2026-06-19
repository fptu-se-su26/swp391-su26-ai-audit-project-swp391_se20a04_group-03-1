import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cổng Doanh Nghiệp | LogiPort",
  description: "Lựa chọn cổng thông tin dành cho Doanh nghiệp vận tải hoặc Hãng tàu.",
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
