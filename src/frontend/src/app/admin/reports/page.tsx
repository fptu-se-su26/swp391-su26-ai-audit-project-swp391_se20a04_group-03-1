"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  Filter,
  Truck,
  Box,
  FileText,
  BarChart2,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { useState } from "react";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("Tất cả");

  const handleExport = () => {
    const loadingToast = toast.loading("Đang xuất báo cáo...");
    setTimeout(() => {
      toast.success("Đã xuất báo cáo thành công!", { id: loadingToast });
    }, 1500);
  };

  const handleFilter = () => {
    const loadingToast = toast.loading("Đang lọc dữ liệu...");
    setTimeout(() => {
      toast.success("Dữ liệu đã được làm mới.", { id: loadingToast });
    }, 800);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Báo cáo
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1 uppercase tracking-wider text-[12px]">
            Xem và tải báo cáo quản lý cảng
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 gap-2 border-none transition-all duration-200"
        >
          <Download className="h-5 w-5" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Filter Options */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
          <CardTitle className="text-[12px] font-bold text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 p-6">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 space-y-3">
              <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                Từ ngày
              </Label>
              <Input
                type="date"
                defaultValue="2026-05-01"
                onClick={(e) => (e.target as any).showPicker?.()}
                className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] transition-colors cursor-pointer dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex-1 space-y-3">
              <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                Đến ngày
              </Label>
              <Input
                type="date"
                defaultValue="2026-05-19"
                onClick={(e) => (e.target as any).showPicker?.()}
                className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] transition-colors cursor-pointer dark:[color-scheme:dark]"
              />
            </div>
            <div className="flex-1 space-y-3">
              <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                Loại báo cáo
              </Label>
              <CustomSelect
                value={reportType}
                onChange={setReportType}
                options={[
                  { value: "Tất cả", label: "Tất cả" },
                  { value: "Xe vào/ra", label: "Xe vào/ra" },
                  { value: "Container", label: "Container" },
                  { value: "Phiếu nâng/hạ", label: "Phiếu nâng/hạ" },
                  { value: "Doanh thu", label: "Doanh thu" },
                ]}
              />
            </div>
            <Button
              onClick={handleFilter}
              className="bg-[#121212] dark:bg-[#ffffff] hover:bg-[#272727] dark:hover:bg-[#e5e5e5] text-[#ffffff] dark:text-[#121212] h-12 px-8 rounded-[500px] font-black uppercase tracking-[1.5px] gap-2 transition-all duration-200"
            >
              <Filter className="h-4 w-4" />
              Lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
          <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
            Chỉ số chính (KPIs)
          </CardTitle>
          <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[12px] uppercase tracking-wider mt-1">
            Các chỉ số quản lý chính hôm nay
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#e5e5e5] dark:divide-[#272727]">
            <div className="md:px-6 pt-4 md:pt-0 first:pt-0 first:pl-0">
              <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#999999] mb-2">
                Tổng xe check-in
              </p>
              <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff]">
                42
              </p>
              <p className="text-[10px] font-bold text-[#1ed760] mt-2 uppercase tracking-wider flex items-center gap-1">
                <span className="bg-[#1ed760]/20 p-0.5 rounded-full">↑</span>{" "}
                12% từ hôm qua
              </p>
            </div>
            <div className="md:px-6 pt-4 md:pt-0">
              <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#999999] mb-2">
                Thời gian chờ TB
              </p>
              <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff]">
                14<span className="text-xl ml-1">phút</span>
              </p>
              <p className="text-[10px] font-bold text-[#1ed760] mt-2 uppercase tracking-wider flex items-center gap-1">
                <span className="bg-[#1ed760]/20 p-0.5 rounded-full">↓</span> 8%
                từ hôm qua
              </p>
            </div>
            <div className="md:px-6 pt-4 md:pt-0">
              <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#999999] mb-2">
                Tỷ lệ sử dụng bãi
              </p>
              <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff]">
                78%
              </p>
              <p className="text-[10px] font-bold text-[#f3727f] mt-2 uppercase tracking-wider flex items-center gap-1">
                <span className="bg-[#f3727f]/20 p-0.5 rounded-full">↑</span>{" "}
                Tăng 5%
              </p>
            </div>
            <div className="md:px-6 pt-4 md:pt-0 border-none">
              <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#999999] mb-2">
                Phiếu nâng/hạ
              </p>
              <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff]">
                128
              </p>
              <p className="text-[10px] font-bold text-[#666666] dark:text-[#999999] mt-2 uppercase tracking-wider">
                Hôm nay
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: "Báo cáo xe vào/ra",
            icon: <Truck className="h-6 w-6 text-[#1ed760]" />,
            desc: "Số liệu xe check-in/out theo ngày",
            date: "Hôm nay",
          },
          {
            title: "Báo cáo bãi",
            icon: <Box className="h-6 w-6 text-[#1ed760]" />,
            desc: "Tình trạng chiếm dụng bãi",
            date: "Hôm nay",
          },
          {
            title: "Báo cáo container",
            icon: <FileText className="h-6 w-6 text-[#1ed760]" />,
            desc: "Số lượng container theo loại",
            date: "Hôm nay",
          },
          {
            title: "Báo cáo hiệu suất",
            icon: <BarChart2 className="h-6 w-6 text-[#1ed760]" />,
            desc: "Hiệu suất xử lý theo khung giờ",
            date: "Tuần này",
          },
          {
            title: "Báo cáo doanh thu",
            icon: <DollarSign className="h-6 w-6 text-[#1ed760]" />,
            desc: "Doanh thu từ phí lưu trú",
            date: "Tháng này",
          },
          {
            title: "Báo cáo cảnh báo",
            icon: <AlertTriangle className="h-6 w-6 text-[#f3727f]" />,
            desc: "Các sự cố và cảnh báo",
            date: "Tháng này",
          },
        ].map((report, idx) => (
          <Card
            key={idx}
            className="group bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
          >
            <CardHeader className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-[#f8f8f8] dark:bg-[#121212] group-hover:bg-[#1ed760]/10 rounded-full flex items-center justify-center border border-[#e5e5e5] dark:border-[#272727] group-hover:border-[#1ed760]/30 transition-colors">
                  {report.icon}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport();
                  }}
                  className="h-8 w-8 text-[#666666] dark:text-[#b3b3b3] group-hover:text-[#121212] dark:group-hover:text-[#ffffff] rounded-full hover:bg-[#e5e5e5] dark:hover:bg-[#272727]"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <CardTitle className="text-lg font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
                {report.title}
              </CardTitle>
              <CardDescription className="text-[12px] font-bold text-[#666666] dark:text-[#999999] mt-2">
                {report.desc}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-0 mt-auto">
              <div className="pt-4 border-t border-[#e5e5e5] dark:border-[#272727] w-full">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">
                  Cập nhật: {report.date}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-[14px] font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Lượng xe theo giờ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-64 flex items-end justify-around gap-2">
              {[5, 8, 12, 15, 18, 14, 12, 10, 8, 6, 4, 3].map((count, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-full bg-[#e5e5e5] dark:bg-[#272727] group-hover:bg-[#1ed760] rounded-t-[4px] transition-colors relative"
                    style={{ height: `${(count / 20) * 200}px` }}
                  >
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#121212] text-[#ffffff] text-[10px] font-bold px-2 py-1 rounded-[4px] pointer-events-none transition-opacity">
                      {count}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#666666] dark:text-[#999999]">
                    {idx}h
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-[14px] font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Phân bố container
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              {[
                { label: "20ft Hàng", value: 45, color: "bg-[#1ed760]" },
                { label: "40ft Hàng", value: 30, color: "bg-[#00754A]" },
                { label: "20ft Rỗng", value: 15, color: "bg-[#3b82f6]" },
                {
                  label: "40ft Rỗng",
                  value: 10,
                  color: "bg-[#121212] dark:bg-[#ffffff]",
                },
              ].map((item) => (
                <div key={item.label} className="group">
                  <div className="flex justify-between text-[12px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-[#666666] dark:text-[#999999] group-hover:text-[#121212] dark:group-hover:text-[#ffffff] transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[#121212] dark:text-[#ffffff]">
                      {item.value}%
                    </span>
                  </div>
                  <div className="w-full bg-[#f8f8f8] dark:bg-[#121212] rounded-full h-3 border border-[#e5e5e5] dark:border-[#272727]">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
