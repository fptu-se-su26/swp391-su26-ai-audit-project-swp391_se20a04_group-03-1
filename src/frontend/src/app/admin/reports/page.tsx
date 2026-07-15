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
  Loader2,
} from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Can, RequirePermission, usePermissions } from "@/lib/permissions";

// ===== Kiểu dữ liệu khớp với payload backend /reports/overview =====
interface Overview {
  range: { from: string; to: string };
  kpis: {
    totalCheckIns: { value: number; delta: number | null };
    avgDwellMinutes: { value: number; delta: number | null };
    yardUtilizationPct: { value: number; occupied: number; totalSlots: number };
    completedAppointments: {
      value: number;
      delta: number | null;
      pickup: number;
      dropoff: number;
    };
  };
  charts: {
    trafficByHour: number[];
    containerDistribution: {
      total: number;
      items: {
        type: string;
        status: string;
        label: string;
        count: number;
        pct: number;
      }[];
    };
  };
  cards: {
    traffic: { totalCheckIns: number; totalCheckOuts: number };
    yard: { occupied: number; totalSlots: number; free: number; pct: number };
    container: { total: number };
    performance: { peakHour: number; peakCount: number };
    revenue: { available: false; reason: string };
    alerts: { count: number };
  };
  alerts: {
    key: string;
    severity: "high" | "medium" | "low";
    message: string;
    count: number;
  }[];
}

// Loại báo cáo (giá trị = query `type` gửi backend).
const REPORT_TYPE_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "traffic", label: "Xe vào/ra" },
  { value: "yard", label: "Bãi" },
  { value: "container", label: "Container" },
  { value: "performance", label: "Hiệu suất" },
  { value: "alerts", label: "Cảnh báo" },
];

const DIST_COLORS = [
  "bg-[#1ed760]",
  "bg-[#00754A]",
  "bg-[#3b82f6]",
  "bg-[#f59e0b]",
  "bg-[#a855f7]",
  "bg-[#121212] dark:bg-[#ffffff]",
];

// yyyy-mm-dd cho input date.
const toDateInput = (d: Date) => d.toISOString().slice(0, 10);

function ReportsContent() {
  const { can } = usePermissions();
  const canExport = can("reports", "export");

  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 29);

  const [fromDate, setFromDate] = useState(toDateInput(monthAgo));
  const [toDate, setToDate] = useState(toDateInput(today));
  const [reportType, setReportType] = useState("all");

  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ from: fromDate, to: toDate });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/overview?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.code === "success") {
        setOverview(data.data);
      } else {
        toast.error(data.message || "Không thể tải dữ liệu báo cáo.");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilter = () => {
    if (fromDate > toDate) {
      toast.error("Khoảng ngày không hợp lệ.");
      return;
    }
    fetchOverview();
  };

  const handleExport = async (type: string) => {
    if (!canExport) {
      toast.error("Bạn không có quyền xuất báo cáo.");
      return;
    }
    const loadingToast = toast.loading("Đang xuất báo cáo...");
    setExporting(true);
    try {
      const params = new URLSearchParams({ type, from: fromDate, to: toDate });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/export?${params.toString()}`,
        { credentials: "include" },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.message || "Không thể xuất báo cáo.", {
          id: loadingToast,
        });
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bao-cao-${type}-${toDateInput(new Date())}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Đã xuất báo cáo thành công!", { id: loadingToast });
    } catch {
      toast.error("Lỗi kết nối khi xuất báo cáo.", { id: loadingToast });
    } finally {
      setExporting(false);
    }
  };

  // Đổi delta số thành badge % (mũi tên + màu).
  const renderDelta = (delta: number | null) => {
    if (delta === null) {
      return (
        <p className="text-[10px] font-bold text-[#666666] dark:text-[#999999] mt-2 uppercase tracking-wider">
          So kỳ trước
        </p>
      );
    }
    const up = delta >= 0;
    return (
      <p
        className={`text-[10px] font-bold mt-2 uppercase tracking-wider flex items-center gap-1 ${
          up ? "text-[#1ed760]" : "text-[#f3727f]"
        }`}
      >
        <span
          className={`${up ? "bg-[#1ed760]/20" : "bg-[#f3727f]/20"} p-0.5 rounded-full`}
        >
          {up ? "↑" : "↓"}
        </span>{" "}
        {Math.abs(delta)}% so kỳ trước
      </p>
    );
  };

  const dist = overview?.charts.containerDistribution.items ?? [];
  const traffic = overview?.charts.trafficByHour ?? new Array(24).fill(0);
  const maxTraffic = Math.max(1, ...traffic);

  const reportCards = [
    {
      type: "traffic",
      title: "Báo cáo xe vào/ra",
      icon: <Truck className="h-6 w-6 text-[#1ed760]" />,
      desc: "Số liệu xe check-in/out theo ngày",
      meta: overview
        ? `${overview.cards.traffic.totalCheckIns} vào · ${overview.cards.traffic.totalCheckOuts} ra`
        : "—",
      available: true,
    },
    {
      type: "yard",
      title: "Báo cáo bãi",
      icon: <Box className="h-6 w-6 text-[#1ed760]" />,
      desc: "Tình trạng chiếm dụng bãi",
      meta: overview
        ? `${overview.cards.yard.occupied}/${overview.cards.yard.totalSlots} ô (${overview.cards.yard.pct}%)`
        : "—",
      available: true,
    },
    {
      type: "container",
      title: "Báo cáo container",
      icon: <FileText className="h-6 w-6 text-[#1ed760]" />,
      desc: "Số lượng container theo loại",
      meta: overview ? `${overview.cards.container.total} container` : "—",
      available: true,
    },
    {
      type: "performance",
      title: "Báo cáo hiệu suất",
      icon: <BarChart2 className="h-6 w-6 text-[#1ed760]" />,
      desc: "Hiệu suất xử lý theo khung giờ",
      meta: overview
        ? `Cao điểm ${overview.cards.performance.peakHour}h (${overview.cards.performance.peakCount} xe)`
        : "—",
      available: true,
    },
    {
      type: "revenue",
      title: "Báo cáo doanh thu",
      icon: <DollarSign className="h-6 w-6 text-[#666666]" />,
      desc: overview?.cards.revenue.reason || "Chưa có dữ liệu doanh thu",
      meta: "Không khả dụng",
      available: false,
    },
    {
      type: "alerts",
      title: "Báo cáo cảnh báo",
      icon: <AlertTriangle className="h-6 w-6 text-[#f3727f]" />,
      desc: "Các sự cố và cảnh báo",
      meta: overview ? `${overview.cards.alerts.count} cảnh báo` : "—",
      available: true,
    },
  ];

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
        <Can resource="reports" action="export">
          <Button
            onClick={() => handleExport(reportType)}
            disabled={exporting || loading}
            className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 gap-2 border-none transition-all duration-200 disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            Xuất báo cáo
          </Button>
        </Can>
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
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
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
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
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
                options={REPORT_TYPE_OPTIONS}
              />
            </div>
            <Button
              onClick={handleFilter}
              disabled={loading}
              className="bg-[#121212] dark:bg-[#ffffff] hover:bg-[#272727] dark:hover:bg-[#e5e5e5] text-[#ffffff] dark:text-[#121212] h-12 px-8 rounded-[500px] font-black uppercase tracking-[1.5px] gap-2 transition-all duration-200 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Filter className="h-4 w-4" />
              )}
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
            Tổng hợp theo khoảng ngày đã chọn
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-[#1ed760]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-[#e5e5e5] dark:divide-[#272727]">
              <div className="md:px-6 pt-4 md:pt-0 first:pt-0 first:pl-0">
                <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#999999] mb-2">
                  Tổng xe check-in
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff]">
                  {overview?.kpis.totalCheckIns.value ?? 0}
                </p>
                {renderDelta(overview?.kpis.totalCheckIns.delta ?? null)}
              </div>
              <div className="md:px-6 pt-4 md:pt-0">
                <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#999999] mb-2">
                  Thời gian lưu bãi TB
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff]">
                  {overview?.kpis.avgDwellMinutes.value ?? 0}
                  <span className="text-xl ml-1">phút</span>
                </p>
                {renderDelta(overview?.kpis.avgDwellMinutes.delta ?? null)}
              </div>
              <div className="md:px-6 pt-4 md:pt-0">
                <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#999999] mb-2">
                  Tỷ lệ sử dụng bãi
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff]">
                  {overview?.kpis.yardUtilizationPct.value ?? 0}%
                </p>
                <p className="text-[10px] font-bold text-[#666666] dark:text-[#999999] mt-2 uppercase tracking-wider">
                  {overview?.kpis.yardUtilizationPct.occupied ?? 0}/
                  {overview?.kpis.yardUtilizationPct.totalSlots ?? 0} ô đỗ
                </p>
              </div>
              <div className="md:px-6 pt-4 md:pt-0 border-none">
                <p className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#999999] mb-2">
                  Lượt lấy/trả hoàn thành
                </p>
                <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff]">
                  {overview?.kpis.completedAppointments.value ?? 0}
                </p>
                <p className="text-[10px] font-bold text-[#666666] dark:text-[#999999] mt-2 uppercase tracking-wider">
                  Lấy {overview?.kpis.completedAppointments.pickup ?? 0} · Trả{" "}
                  {overview?.kpis.completedAppointments.dropoff ?? 0}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportCards.map((report) => (
          <Card
            key={report.type}
            className={`group bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${
              report.available
                ? "hover:border-[#1ed760] dark:hover:border-[#1ed760]"
                : "opacity-60"
            }`}
          >
            <CardHeader className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 bg-[#f8f8f8] dark:bg-[#121212] group-hover:bg-[#1ed760]/10 rounded-full flex items-center justify-center border border-[#e5e5e5] dark:border-[#272727] group-hover:border-[#1ed760]/30 transition-colors">
                  {report.icon}
                </div>
                {report.available && (
                  <Can resource="reports" action="export">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={exporting || loading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExport(report.type);
                      }}
                      className="h-8 w-8 text-[#666666] dark:text-[#b3b3b3] group-hover:text-[#121212] dark:group-hover:text-[#ffffff] rounded-full hover:bg-[#e5e5e5] dark:hover:bg-[#272727]"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </Can>
                )}
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
                  {report.meta}
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
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#1ed760]" />
              </div>
            ) : (
              <div className="h-64 flex items-end justify-around gap-1">
                {traffic.map((count, idx) => (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                    <div
                      className="w-full bg-[#e5e5e5] dark:bg-[#272727] group-hover:bg-[#1ed760] rounded-t-[4px] transition-colors relative"
                      style={{ height: `${(count / maxTraffic) * 200}px` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#121212] text-[#ffffff] text-[10px] font-bold px-2 py-1 rounded-[4px] pointer-events-none transition-opacity">
                        {count}
                      </div>
                    </div>
                    {idx % 2 === 0 && (
                      <span className="text-[9px] font-bold text-[#666666] dark:text-[#999999]">
                        {idx}h
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-[14px] font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Phân bố container
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-[#1ed760]" />
              </div>
            ) : dist.length === 0 ? (
              <p className="text-center py-10 text-[#666666] dark:text-[#999999] font-bold uppercase tracking-wider text-[12px]">
                Không có dữ liệu container
              </p>
            ) : (
              <div className="space-y-6">
                {dist.map((item, idx) => (
                  <div key={item.label} className="group">
                    <div className="flex justify-between text-[12px] font-bold uppercase tracking-wider mb-2">
                      <span className="text-[#666666] dark:text-[#999999] group-hover:text-[#121212] dark:group-hover:text-[#ffffff] transition-colors">
                        {item.label} ({item.count})
                      </span>
                      <span className="text-[#121212] dark:text-[#ffffff]">
                        {item.pct}%
                      </span>
                    </div>
                    <div className="w-full bg-[#f8f8f8] dark:bg-[#121212] rounded-full h-3 border border-[#e5e5e5] dark:border-[#272727]">
                      <div
                        className={`${DIST_COLORS[idx % DIST_COLORS.length]} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <RequirePermission resource="reports" action="view">
      <ReportsContent />
    </RequirePermission>
  );
}
