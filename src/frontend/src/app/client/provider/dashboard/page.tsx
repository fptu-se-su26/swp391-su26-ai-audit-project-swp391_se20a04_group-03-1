"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Container, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  AlertTriangle, 
  Plus, 
  ArrowRight,
  Boxes,
  Activity
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function ProviderDashboardPage() {
  const [stats, setStats] = useState({
    totalContainers: 1250,
    availableEmpty: 450,
    inUse: 800,
    gateInToday: 42,
    gateOutToday: 38
  });

  const [recentTransactions, setRecentTransactions] = useState([
    {
      id: "TRX-9901",
      containerCode: "MSKU1234567",
      type: "Gate In",
      time: "08:15 - 16/06/2026",
      status: "Thành công",
    },
    {
      id: "TRX-9902",
      containerCode: "CMAU7654321",
      type: "Gate Out",
      time: "09:30 - 16/06/2026",
      status: "Thành công",
    },
    {
      id: "TRX-9903",
      containerCode: "EVER8888888",
      type: "Gate In",
      time: "10:45 - 16/06/2026",
      status: "Đang xử lý",
    }
  ]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Tổng quan Nhà Cung Cấp
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-2">
            Theo dõi tình trạng container và các giao dịch tại cảng.
          </p>
        </div>
        <Link href="/client/provider/containers?action=register">
          <Button className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 py-6 gap-2 border-none transition-all duration-200 shadow-lg shadow-[#1ed760]/20">
            <Plus className="h-5 w-5" />
            Đăng ký Container mới
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-[#666666] dark:text-[#999999] uppercase tracking-[2px]">
                  Tổng số Container
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
                  {stats.totalContainers}
                </p>
              </div>
              <div className="h-12 w-12 rounded-[500px] bg-[#3b82f6]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Boxes className="h-6 w-6 text-[#3b82f6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-[#666666] dark:text-[#999999] uppercase tracking-[2px]">
                  Container Rỗng (Sẵn sàng)
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
                  {stats.availableEmpty}
                </p>
              </div>
              <div className="h-12 w-12 rounded-[500px] bg-[#1ed760]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Container className="h-6 w-6 text-[#1ed760]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-[#666666] dark:text-[#999999] uppercase tracking-[2px]">
                  Lượt nhập (Hôm nay)
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
                  {stats.gateInToday}
                </p>
              </div>
              <div className="h-12 w-12 rounded-[500px] bg-[#f59e0b]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowDownToLine className="h-6 w-6 text-[#f59e0b]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors group">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[11px] font-black text-[#666666] dark:text-[#999999] uppercase tracking-[2px]">
                  Lượt xuất (Hôm nay)
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight text-[#1db954]">
                  {stats.gateOutToday}
                </p>
              </div>
              <div className="h-12 w-12 rounded-[500px] bg-[#1ed760]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ArrowUpFromLine className="h-6 w-6 text-[#1ed760]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions List */}
        <Card className="lg:col-span-2 bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
          <CardHeader className="p-6 border-b border-[#e5e5e5] dark:border-[#272727] flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#1ed760]" />
              Giao dịch gần đây
            </CardTitle>
            {/* Trỏ về trang container: /client/provider/history chưa từng tồn tại nên nút này vốn dẫn vào 404. */}
            <Link href="/client/provider/containers">
              <Button variant="ghost" className="text-[#666666] hover:text-[#121212] dark:text-[#999999] dark:hover:text-[#ffffff] font-bold text-xs uppercase tracking-wider rounded-[500px]">
                Xem tất cả <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
              {recentTransactions.map((trx) => (
                <div key={trx.id} className="p-6 hover:bg-[#f8f8f8] dark:hover:bg-[#121212]/50 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-[500px] flex items-center justify-center ${
                      trx.type === 'Gate In' ? 'bg-[#1ed760]/10 text-[#1ed760]' : 'bg-[#3b82f6]/10 text-[#3b82f6]'
                    }`}>
                      {trx.type === 'Gate In' ? <ArrowDownToLine className="h-5 w-5" /> : <ArrowUpFromLine className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-black text-[#121212] dark:text-[#ffffff] text-[15px]">
                        {trx.containerCode}
                      </p>
                      <p className="text-[13px] text-[#666666] dark:text-[#999999] font-medium mt-0.5">
                        {trx.type} • {trx.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 rounded-[500px] text-[11px] font-bold uppercase tracking-wider ${
                      trx.status === 'Thành công'
                        ? 'bg-[#1ed760]/10 text-[#1db954]'
                        : 'bg-[#f59e0b]/10 text-[#f59e0b]'
                    }`}>
                      {trx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Panel / Analytics */}
        <div className="space-y-6">
          <Card className="bg-[#121212] dark:bg-[#1f1f1f] border-none rounded-[16px] overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardContent className="p-8 relative z-10">
              <div className="w-12 h-12 bg-[#3b82f6] rounded-[500px] flex items-center justify-center mb-6 shadow-lg shadow-[#3b82f6]/30 group-hover:scale-110 transition-transform duration-300">
                <Activity className="h-6 w-6 text-[#ffffff]" />
              </div>
              <h3 className="text-xl font-black text-[#ffffff] mb-3 leading-tight tracking-tight">
                Tích hợp dữ liệu
              </h3>
              <p className="text-[#b3b3b3] text-sm font-medium leading-relaxed mb-6">
                Hệ thống LogiPort đang đồng bộ trực tiếp với các hãng tàu thông qua chuẩn API BICS quốc tế.
              </p>
              <Button className="w-full bg-[#ffffff] hover:bg-[#e5e5e5] text-[#121212] font-black uppercase tracking-[1.5px] rounded-[500px] h-[48px] text-[13px] transition-all">
                Xem chi tiết API
              </Button>
            </CardContent>
          </Card>
          
          <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-sm font-black uppercase tracking-tight text-[#666666] dark:text-[#999999]">
                Thông tin nhà cung cấp
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-[#e5e5e5] dark:border-[#272727] border-dashed">
                <span className="text-[13px] font-bold text-[#666666] dark:text-[#999999]">Tên Hãng</span>
                <span className="text-[14px] font-black text-[#121212] dark:text-[#ffffff]">MAERSK LINE</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#e5e5e5] dark:border-[#272727] border-dashed">
                <span className="text-[13px] font-bold text-[#666666] dark:text-[#999999]">Mã Hãng Tàu</span>
                <span className="text-[14px] font-black text-[#121212] dark:text-[#ffffff]">MSK</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-[#e5e5e5] dark:border-[#272727] border-dashed">
                <span className="text-[13px] font-bold text-[#666666] dark:text-[#999999]">BIC Codes</span>
                <span className="text-[14px] font-black text-[#121212] dark:text-[#ffffff]">MSKU, MRKU, MAEU</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
