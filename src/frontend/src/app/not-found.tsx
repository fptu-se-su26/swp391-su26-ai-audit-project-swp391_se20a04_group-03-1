"use client";

import { Button } from "@/components/ui/button";
import { MoveLeft, Home, MapPinOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#121212] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-2xl w-full flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="h-24 w-24 bg-[#ffffff] dark:bg-[#181818] rounded-full flex items-center justify-center border border-[#e5e5e5] dark:border-[#272727] mb-8 shadow-sm">
          <MapPinOff className="h-10 w-10 text-[#f3727f]" />
        </div>

        <h1 className="text-[120px] md:text-[180px] font-black text-[#121212] dark:text-[#ffffff] tracking-tighter leading-none mb-4 select-none">
          404
        </h1>

        <div className="space-y-4 mb-12 relative">
          <div className="absolute -left-6 top-0 bottom-0 w-1 bg-[#1ed760] rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider text-left pl-2">
            Không tìm thấy trang
          </h2>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px] uppercase tracking-wider text-left pl-2 max-w-md">
            Địa chỉ bạn vừa truy cập không tồn tại hoặc đã bị di chuyển sang một
            liên kết khác.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full sm:w-auto bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#e5e5e5] dark:hover:bg-[#272727] h-12 px-8 rounded-[500px] font-black uppercase tracking-[1.5px] gap-2 transition-all duration-200"
          >
            <MoveLeft className="h-5 w-5" />
            Quay lại
          </Button>

          <Link href="/admin/yard" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-[#1ed760] hover:bg-[#1db954] text-[#121212] h-12 px-8 rounded-[500px] font-black uppercase tracking-[1.5px] gap-2 border-none transition-all duration-200 shadow-md shadow-[#1ed760]/20">
              <Home className="h-5 w-5" />
              Về trang chủ
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[10px] font-bold text-[#999999] uppercase tracking-[2px]">
          LOGIPORT DESIGN SYSTEM &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
