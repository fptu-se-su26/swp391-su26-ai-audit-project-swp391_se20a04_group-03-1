"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Clock,
  CheckCircle2,
  Plus,
  ArrowRight,
  ArrowLeft,
  UserSquare2,
  Box,
  Calendar,
  AlertTriangle,
  Info,
  RefreshCw,
  Loader2,
  Warehouse,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/**
 * Trang tổng quan của doanh nghiệp vận tải.
 *
 * Toàn bộ số liệu lấy từ GET /client/dashboard/overview — backend đã khoanh
 * vùng theo doanh nghiệp đang đăng nhập, trang này không tự lọc gì thêm.
 */

const API = process.env.NEXT_PUBLIC_API_URL;
/** Trực ca nhìn màn hình liên tục nên tự làm mới, khỏi phải bấm F5. */
const REFRESH_MS = 60000;

interface TrendPoint {
  date: string;
  label: string;
  pickup: number;
  dropoff: number;
  total: number;
}

interface UpcomingItem {
  _id: string;
  containerNo: string;
  truckPlate: string;
  purpose: string;
  status: string;
  scheduledDate: string;
  timeSlot: string;
  driverName: string | null;
  driverPhone: string | null;
}

interface ActivityItem {
  _id: string;
  at: string | null;
  direction: "in" | "out";
  containerNo: string | null;
  truckPlate: string | null;
  purpose: string | null;
  gateName: string | null;
  yardName: string | null;
  assignedSlot: string | null;
}

interface ContainerItem {
  _id: string;
  number: string;
  type: string;
  status: string;
  portStatus: string;
  updatedAt: string;
}

interface AlertItem {
  key: string;
  severity: "warning" | "error" | "info";
  title: string;
  message: string;
  link: string;
}

interface DashboardData {
  generatedAt: string;
  company: { name: string | null; code: string | null };
  kpis: {
    todayTotal: number;
    todayPending: number;
    todayConfirmed: number;
    pendingAll: number;
    confirmedAll: number;
    completedMonth: number;
    cancelledMonth: number;
    containersInPort: number;
  };
  fleet: {
    drivers: number;
    driversActive: number;
    driversInactive: number;
    trucks: number;
  };
  charts: {
    weeklyTrend: TrendPoint[];
    todaySlots: { slot: string; count: number }[];
    statusBreakdown: { status: string; label: string; count: number }[];
  };
  upcomingAppointments: UpcomingItem[];
  recentActivity: ActivityItem[];
  containersInPort: ContainerItem[];
  alerts: AlertItem[];
}

const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  Confirmed: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20",
  Completed: "bg-[#1ed760]/10 text-[#1db954] border-[#1ed760]/20",
  Cancelled: "bg-[#f3727f]/10 text-[#f3727f] border-[#f3727f]/20",
};

const STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ duyệt",
  Confirmed: "Đã duyệt",
  Completed: "Hoàn thành",
  Cancelled: "Đã hủy",
};

const STATUS_BAR: Record<string, string> = {
  Pending: "bg-[#f59e0b]",
  Confirmed: "bg-[#3b82f6]",
  Completed: "bg-[#1ed760]",
  Cancelled: "bg-[#f3727f]",
};

const ALERT_STYLE = {
  error: {
    box: "bg-[#f3727f]/10 border-[#f3727f]/30",
    icon: "text-[#f3727f]",
  },
  warning: {
    box: "bg-[#f59e0b]/10 border-[#f59e0b]/30",
    icon: "text-[#f59e0b]",
  },
  info: {
    box: "bg-[#3b82f6]/10 border-[#3b82f6]/30",
    icon: "text-[#3b82f6]",
  },
} as const;

const formatDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("vi-VN") : "—";

const formatTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

interface KpiCardProps {
  label: string;
  value: number;
  hint?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

function KpiCard({ label, value, hint, icon: Icon, color, href }: KpiCardProps) {
  const card = (
    <Card className="h-full bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#1ed760] dark:hover:border-[#1ed760] transition-colors group">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2 min-w-0">
            <p className="text-[11px] font-black text-[#666666] dark:text-[#999999] uppercase tracking-[2px]">
              {label}
            </p>
            <p className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
              {value}
            </p>
            {hint && (
              <p className="text-[12px] font-bold text-[#999999] dark:text-[#666666] truncate">
                {hint}
              </p>
            )}
          </div>
          <div
            className="h-12 w-12 rounded-[500px] flex items-center justify-center group-hover:scale-110 transition-transform shrink-0"
            style={{ backgroundColor: `${color}1a` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  return href ? (
    <Link href={href} className="block h-full">
      {card}
    </Link>
  ) : (
    card
  );
}

function SectionCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
      <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 flex flex-row items-center justify-between gap-4">
        <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <p className="px-6 py-10 text-center text-[13px] font-bold text-[#666666] dark:text-[#b3b3b3]">
      {text}
    </p>
  );
}

export default function CompanyDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const res = await fetch(`${API}/client/dashboard/overview`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        setData(json.data);
        setError(null);
      } else {
        setError(json.message || "Không thể tải dữ liệu tổng quan.");
      }
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => load(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-[#1ed760] mb-4" />
        <p className="text-[#666666] font-bold uppercase tracking-wider text-[12px]">
          Đang tải tổng quan...
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <AlertTriangle className="h-10 w-10 text-[#f3727f]" />
        <p className="text-[#121212] dark:text-[#ffffff] font-bold">{error}</p>
        <Button
          onClick={() => load()}
          className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-wider px-6"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  if (!data) return null;

  const { kpis, fleet, charts } = data;
  const trendMax = Math.max(1, ...charts.weeklyTrend.map((d) => d.total));
  const slotMax = Math.max(1, ...charts.todaySlots.map((s) => s.count));
  const statusTotal = charts.statusBreakdown.reduce((s, x) => s + x.count, 0);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tiêu đề + hành động chính */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Tổng quan Doanh nghiệp
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-2">
            {data.company.name || "Đội xe của bạn"}
            {data.company.code ? ` · Mã ${data.company.code}` : ""} · Cập nhật{" "}
            {formatTime(data.generatedAt)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className="p-3 rounded-[500px] bg-[#f8f8f8] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#666666] dark:text-[#b3b3b3] hover:text-[#121212] dark:hover:text-[#ffffff] transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Làm mới"
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
          <Link href="/client/company/appointments">
            <Button className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 py-6 gap-2 border-none transition-all duration-200 shadow-lg shadow-[#1ed760]/20">
              <Plus className="h-5 w-5" />
              Tạo lịch hẹn mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Cảnh báo cần xử lý */}
      {data.alerts.length > 0 && (
        <div className="space-y-3">
          {data.alerts.map((a) => {
            const style = ALERT_STYLE[a.severity];
            return (
              <Link
                key={a.key}
                href={a.link}
                className={`flex items-start gap-4 p-4 rounded-[16px] border ${style.box} hover:brightness-105 transition-all`}
              >
                <AlertTriangle className={`h-5 w-5 shrink-0 mt-0.5 ${style.icon}`} />
                <div className="min-w-0">
                  <p className="font-black text-[14px] text-[#121212] dark:text-[#ffffff]">
                    {a.title}
                  </p>
                  <p className="text-[13px] font-bold text-[#666666] dark:text-[#b3b3b3] mt-0.5">
                    {a.message}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          label="Lịch hẹn hôm nay"
          value={kpis.todayTotal}
          hint={`${kpis.todayConfirmed} đã duyệt · ${kpis.todayPending} chờ duyệt`}
          icon={Calendar}
          color="#3b82f6"
          href="/client/company/appointments"
        />
        <KpiCard
          label="Đang chờ duyệt"
          value={kpis.pendingAll}
          hint="Toàn bộ lịch hẹn chưa được phê duyệt"
          icon={Clock}
          color="#f59e0b"
          href="/client/company/appointments"
        />
        <KpiCard
          label="Hoàn thành tháng này"
          value={kpis.completedMonth}
          hint={`${kpis.cancelledMonth} lượt bị hủy`}
          icon={CheckCircle2}
          color="#1ed760"
          href="/client/company/appointments/completed"
        />
        <KpiCard
          label="Container trong cảng"
          value={kpis.containersInPort}
          hint="Đã nhập cảng hoặc đang lưu bãi"
          icon={Box}
          color="#a855f7"
        />
      </div>

      {/* Đội xe */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KpiCard
          label="Tài xế đang hoạt động"
          value={fleet.driversActive}
          hint={`Tổng ${fleet.drivers} tài xế · ${fleet.driversInactive} ngừng`}
          icon={UserSquare2}
          color="#00b3c8"
          href="/client/company/drivers"
        />
        <KpiCard
          label="Đầu kéo đang quản lý"
          value={fleet.trucks}
          hint="Số xe đã khai báo với cảng"
          icon={Truck}
          color="#6366f1"
          href="/client/company/trucks"
        />
        <KpiCard
          label="Lịch hẹn đã duyệt"
          value={kpis.confirmedAll}
          hint="Sẵn sàng ra vào cổng"
          icon={CheckCircle2}
          color="#3b82f6"
          href="/client/company/appointments"
        />
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title="Lịch hẹn 7 ngày gần nhất"
            action={
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-[#666666] dark:text-[#b3b3b3]">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#3b82f6]" /> Lấy
                </span>
                <span className="flex items-center gap-1.5 text-[#666666] dark:text-[#b3b3b3]">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#1ed760]" /> Trả
                </span>
              </div>
            }
          >
            <div className="p-6">
              <div className="flex items-end justify-between gap-3 h-[200px]">
                {charts.weeklyTrend.map((d) => (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
                  >
                    <span className="text-[11px] font-black text-[#121212] dark:text-[#ffffff] opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.total}
                    </span>
                    <div className="w-full flex items-end justify-center gap-1 h-full">
                      <div
                        className="w-1/2 max-w-[22px] bg-[#3b82f6] rounded-t-[4px] transition-all duration-500"
                        style={{
                          height: `${(d.pickup / trendMax) * 100}%`,
                          minHeight: d.pickup > 0 ? "4px" : "0",
                        }}
                        title={`${d.pickup} lượt lấy container`}
                      />
                      <div
                        className="w-1/2 max-w-[22px] bg-[#1ed760] rounded-t-[4px] transition-all duration-500"
                        style={{
                          height: `${(d.dropoff / trendMax) * 100}%`,
                          minHeight: d.dropoff > 0 ? "4px" : "0",
                        }}
                        title={`${d.dropoff} lượt trả container`}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#666666] dark:text-[#b3b3b3]">
                      {d.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        <SectionCard title="Cơ cấu trạng thái">
          <div className="p-6 space-y-5">
            {statusTotal === 0 ? (
              <EmptyRow text="Doanh nghiệp chưa có lịch hẹn nào." />
            ) : (
              charts.statusBreakdown.map((s) => {
                const pct = Math.round((s.count / statusTotal) * 100);
                return (
                  <div key={s.status} className="space-y-2">
                    <div className="flex items-center justify-between text-[12px] font-bold">
                      <span className="text-[#121212] dark:text-[#ffffff]">
                        {s.label}
                      </span>
                      <span className="text-[#666666] dark:text-[#b3b3b3]">
                        {s.count} · {pct}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-[500px] bg-[#f0f0f0] dark:bg-[#272727] overflow-hidden">
                      <div
                        className={`h-full rounded-[500px] transition-all duration-500 ${STATUS_BAR[s.status]}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SectionCard>
      </div>

      {/* Khung giờ hôm nay */}
      <SectionCard title="Khung giờ đặt lịch hôm nay">
        {charts.todaySlots.length === 0 ? (
          <EmptyRow text="Hôm nay chưa có lịch hẹn nào." />
        ) : (
          <div className="p-6 flex items-end gap-2 overflow-x-auto h-[180px]">
            {charts.todaySlots.map((s) => (
              <div
                key={s.slot}
                className="flex flex-col items-center gap-2 h-full justify-end min-w-[56px]"
              >
                <span className="text-[11px] font-black text-[#121212] dark:text-[#ffffff]">
                  {s.count}
                </span>
                <div
                  className="w-8 bg-[#1ed760] rounded-t-[4px] transition-all duration-500"
                  style={{
                    height: `${(s.count / slotMax) * 100}%`,
                    minHeight: "4px",
                  }}
                />
                <span className="text-[10px] font-bold text-[#666666] dark:text-[#b3b3b3] whitespace-nowrap">
                  {s.slot.slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Lịch hẹn sắp tới + Hoạt động qua cổng */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Lịch hẹn sắp tới"
          action={
            <Link href="/client/company/appointments">
              <Button
                variant="ghost"
                className="text-[#666666] hover:text-[#121212] dark:text-[#b3b3b3] dark:hover:text-[#ffffff] font-bold uppercase tracking-wider text-[12px] gap-2"
              >
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        >
          {data.upcomingAppointments.length === 0 ? (
            <EmptyRow text="Không có lịch hẹn nào sắp tới." />
          ) : (
            <div className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
              {data.upcomingAppointments.map((a) => (
                <div key={a._id} className="px-6 py-4 flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-[500px] flex items-center justify-center shrink-0 ${
                      a.purpose === "Lấy container"
                        ? "bg-[#3b82f6]/10 text-[#3b82f6]"
                        : "bg-[#1ed760]/10 text-[#1db954]"
                    }`}
                  >
                    {a.purpose === "Lấy container" ? (
                      <ArrowRight className="h-5 w-5" />
                    ) : (
                      <ArrowLeft className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[14px] text-[#121212] dark:text-[#ffffff] truncate">
                      {a.containerNo} · {a.truckPlate}
                    </p>
                    <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3] truncate">
                      {formatDate(a.scheduledDate)} · {a.timeSlot}
                      {a.driverName ? ` · ${a.driverName}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border ${STATUS_STYLE[a.status]}`}
                  >
                    {STATUS_LABEL[a.status] || a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Hoạt động qua cổng gần nhất">
          {data.recentActivity.length === 0 ? (
            <EmptyRow text="Chưa có lượt ra vào cổng nào được ghi nhận." />
          ) : (
            <div className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
              {data.recentActivity.map((t) => (
                <div key={t._id} className="px-6 py-4 flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-[500px] flex items-center justify-center shrink-0 ${
                      t.direction === "in"
                        ? "bg-[#1ed760]/10 text-[#1db954]"
                        : "bg-[#f59e0b]/10 text-[#f59e0b]"
                    }`}
                  >
                    <Truck className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[14px] text-[#121212] dark:text-[#ffffff] truncate">
                      {t.truckPlate || "—"}
                      {t.containerNo ? ` · ${t.containerNo}` : ""}
                    </p>
                    <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3] truncate">
                      {t.direction === "in" ? "Vào cảng" : "Rời cảng"}
                      {t.gateName ? ` · ${t.gateName}` : ""}
                      {t.assignedSlot ? ` · Ô ${t.assignedSlot}` : ""}
                      {t.yardName ? ` · ${t.yardName}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] font-bold text-[#999999] dark:text-[#666666] text-right">
                    {formatTime(t.at)}
                    <br />
                    {formatDate(t.at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Container trong cảng */}
      <SectionCard title="Container của bạn đang trong cảng">
        {data.containersInPort.length === 0 ? (
          <EmptyRow text="Không có container nào của doanh nghiệp đang nằm trong cảng." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                <tr>
                  <th className="px-6 py-4 font-black">Số container</th>
                  <th className="px-6 py-4 font-black">Loại</th>
                  <th className="px-6 py-4 font-black">Tình trạng hàng</th>
                  <th className="px-6 py-4 font-black">Trạng thái cảng</th>
                  <th className="px-6 py-4 font-black">Cập nhật</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                {data.containersInPort.map((c) => (
                  <tr
                    key={c._id}
                    className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                      {c.number}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                      {c.type}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                      {c.status}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border bg-[#1ed760]/10 text-[#1db954] border-[#1ed760]/20">
                        <Warehouse className="h-3 w-3" />
                        {c.portStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                      {formatDate(c.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Ghi chú cuối trang: giúp người dùng hiểu con số lấy từ đâu */}
      <div className="flex items-start gap-3 p-4 rounded-[16px] bg-[#f8f8f8] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727]">
        <Info className="h-4 w-4 text-[#666666] dark:text-[#b3b3b3] shrink-0 mt-0.5" />
        <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3]">
          Số liệu chỉ tính trên tài xế, xe và lịch hẹn thuộc doanh nghiệp của bạn.
          Trang tự làm mới mỗi 60 giây.
        </p>
      </div>

      {/* Lỗi khi làm mới ngầm: không xóa dữ liệu cũ, chỉ báo nhẹ */}
      {error && data && (
        <p className="flex items-center gap-2 text-[12px] font-bold text-[#f3727f]">
          <XCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
