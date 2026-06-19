"use client";

import Link from "next/link";
import { Ship, Truck, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ClientSelectionPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212] flex flex-col items-center justify-center p-6 transition-colors duration-300 relative overflow-hidden font-sans">
      
      {/* Premium Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#1ed760]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#00754A]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl z-10 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <Link href="/">
            <div className="w-16 h-16 bg-[#ffffff] dark:bg-[#181818] rounded-2xl flex items-center justify-center shadow-sm border border-[#e5e5e5] dark:border-[#272727] mb-4 hover:scale-105 transition-transform cursor-pointer">
              <Ship className="h-8 w-8 text-[#1ed760]" />
            </div>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Cổng Doanh Nghiệp
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold max-w-lg text-[16px]">
            Vui lòng chọn loại hình doanh nghiệp của bạn để truy cập vào hệ thống quản lý tương ứng.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Transport Company Card */}
          <Link href="/client/company/login" className="group">
            <div className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[24px] p-8 h-full flex flex-col justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(30,215,96,0.15)] hover:border-[#1ed760]/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#1ed760]/10 to-transparent rounded-bl-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="space-y-6 relative z-10">
                <div className="w-16 h-16 rounded-full bg-[#f8f8f8] dark:bg-[#121212] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1ed760] transition-all duration-300">
                  <Truck className="h-8 w-8 text-[#121212] dark:text-[#ffffff] group-hover:text-[#000000] transition-colors" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wide mb-2 group-hover:text-[#1ed760] transition-colors">
                    Đơn Vị Vận Tải
                  </h2>
                  <p className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
                    Dành cho các công ty logistics, doanh nghiệp vận tải bộ. Đặt lịch hẹn giao nhận, quản lý đội xe và tài xế.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex items-center text-[#1ed760] font-black uppercase tracking-[1.5px] text-[12px] opacity-80 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                Đăng nhập ngay <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </Link>

          {/* Container Provider Card */}
          <Link href="/client/provider/login" className="group">
            <div className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[24px] p-8 h-full flex flex-col justify-between shadow-sm hover:shadow-[0_8px_30px_rgba(30,215,96,0.15)] hover:border-[#1ed760]/50 transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#1ed760]/10 to-transparent rounded-bl-[100px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="space-y-6 relative z-10">
                <div className="w-16 h-16 rounded-full bg-[#f8f8f8] dark:bg-[#121212] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#1ed760] transition-all duration-300">
                  <Ship className="h-8 w-8 text-[#121212] dark:text-[#ffffff] group-hover:text-[#000000] transition-colors" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wide mb-2 group-hover:text-[#1ed760] transition-colors">
                    Hãng Tàu (Provider)
                  </h2>
                  <p className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
                    Dành cho các hãng tàu cung cấp container. Tra cứu thông tin, quản lý danh sách container và mã BIC.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 flex items-center text-[#1ed760] font-black uppercase tracking-[1.5px] text-[12px] opacity-80 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                Đăng nhập ngay <ArrowRight className="ml-2 h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>

        <div className="flex justify-center pt-8">
          <Link href="/">
            <Button variant="ghost" className="text-[#666666] dark:text-[#b3b3b3] hover:text-[#121212] dark:hover:text-[#ffffff] font-bold uppercase tracking-[1.5px] text-[12px]">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại trang chủ
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
