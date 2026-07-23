"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  Plus,
  ArrowRight,
  Boxes,
  Package,
  PackageOpen,
  Warehouse,
  Loader2,
  RefreshCw,
  Info,
  Clock,
  Tag,
  Calendar,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/**
 * Trang tổng quan của hãng tàu.
 *
 * Toàn bộ số liệu lấy từ GET /client/provider/dashboard/overview — backend đã
 * khoanh vùng theo hãng tàu đang đăng nhập, trang này không tự lọc gì thêm.
 */

const API = process.env.NEXT_PUBLIC_API_URL;
const REFRESH_MS = 60000;

interface TrendPoint {
  date: string;
  label: string;
  gateIn: number;
  gateOut: number;
  total: number;
}

interface ActivityItem {
  _id: string;
  at: string | null;
  direction: "in" | "out";
  containerNo: string | null;
  truckPlate: string | null;
  purpose: string | null;
  companyName: string | null;
  gateName: string | null;
  yardName: string | null;
  assignedSlot: string | null;
}

interface BicUsage {
  code: string;
  count: number;
  declared: boolean;
}

interface OverstayItem {
  _id: string;
  containerNo: string;
  checkInTime: string;
  hours: number | null;
  yardName: string | null;
  assignedSlot: string | null;
}

interface UpcomingItem {
  _id: string;
  containerNo: string;
  truckPlate: string;
  purpose: string;
  status: string;
  scheduledDate: string;
  timeSlot: string;
  companyName: string | null;
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
  provider: { name: string | null; code: string | null; bicCodes: string[] };
  kpis: {
    totalContainers: number;
    empty: number;
    laden: number;
    inPort: number;
    inYard: number;
    gateInToday: number;
    gateOutToday: number;
    overstay: number;
  };
  charts: {
    weeklyTrend: TrendPoint[];
    byPortStatus: { portStatus: string; count: number }[];
    byType: { type: string; count: number }[];
  };
  bic: { used: BicUsage[]; undeclared: BicUsage[]; unusedDeclared: string[] };
  recentActivity: ActivityItem[];
  overstayItems: OverstayItem[];
  upcomingAppointments: UpcomingItem[];
  alerts: AlertItem[];
}

const PORT_STATUS_COLOR: Record<string, string> = {
  "Chưa nhập cảng": "#999999",
  "Đã nhập cảng": "#f59e0b",
  "Đang lưu bãi": "#3b82f6",
  "Đã xuất cảng": "#1ed760",
};

const STATUS_STYLE: Record<string, string> = {
  Pending: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20",
  Confirmed: "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20",
};

const STATUS_LABEL: Record<string, string> = {
  Pending: "Chờ duyệt",
  Confirmed: "Đã duyệt",
};

const ALERT_STYLE = {
  error: { box: "bg-[#f3727f]/10 border-[#f3727f]/30", icon: "text-[#f3727f]" },
  warning: { box: "bg-[#f59e0b]/10 border-[#f59e0b]/30", icon: "text-[#f59e0b]" },
  info: { box: "bg-[#3b82f6]/10 border-[#3b82f6]/30", icon: "text-[#3b82f6]" },
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

function KpiCard({
  label,
  value,
  hint,
  icon: Icon,
  color,
  href,
}: {
  label: string;
  value: number;
  hint?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}) {
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

export default function ProviderDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const res = await fetch(`${API}/client/provider/dashboard/overview`, {
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

  const { kpis, charts } = data;
  const trendMax = Math.max(1, ...charts.weeklyTrend.map((d) => d.total));
  const portMax = Math.max(1, ...charts.byPortStatus.map((d) => d.count));
  const typeMax = Math.max(1, ...charts.byType.map((d) => d.count));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Tiêu đề + hành động chính */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Tổng quan Hãng Tàu
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-2">
            {data.provider.name || "Đội container của bạn"}
            {data.provider.code ? ` · Mã ${data.provider.code}` : ""} · Cập nhật{" "}
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
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <Link href="/client/provider/containers/create">
            <Button className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 py-6 gap-2 border-none transition-all duration-200 shadow-lg shadow-[#1ed760]/20">
              <Plus className="h-5 w-5" />
              Đăng ký Container mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Cảnh báo */}
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

      {/* KPI kho container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <KpiCard
          label="Tổng số Container"
          value={kpis.totalContainers}
          hint={`${kpis.laden} hàng · ${kpis.empty} rỗng`}
          icon={Boxes}
          color="#3b82f6"
          href="/client/provider/containers"
        />
        <KpiCard
          label="Đang trong cảng"
          value={kpis.inPort}
          hint={`${kpis.inYard} đang lưu bãi`}
          icon={Warehouse}
          color="#a855f7"
        />
        <KpiCard
          label="Container rỗng"
          value={kpis.empty}
          hint="Sẵn sàng cấp cho khách hàng"
          icon={PackageOpen}
          color="#1ed760"
          href="/client/provider/containers"
        />
        <KpiCard
          label="Lưu bãi quá hạn"
          value={kpis.overstay}
          hint="Còn trong bãi quá 48 giờ"
          icon={Clock}
          color="#f3727f"
          href="/client/provider/history"
        />
      </div>

      {/* KPI lưu lượng hôm nay */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KpiCard
          label="Lượt nhập hôm nay"
          value={kpis.gateInToday}
          hint="Container vào cảng"
          icon={ArrowDownToLine}
          color="#f59e0b"
          href="/client/provider/history"
        />
        <KpiCard
          label="Lượt xuất hôm nay"
          value={kpis.gateOutToday}
          hint="Container rời cảng"
          icon={ArrowUpFromLine}
          color="#1ed760"
          href="/client/provider/history"
        />
        <KpiCard
          label="Container có hàng"
          value={kpis.laden}
          hint="Đang chở hàng của khách"
          icon={Package}
          color="#6366f1"
          href="/client/provider/containers"
        />
      </div>

      {/* Biểu đồ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard
            title="Lưu lượng 7 ngày gần nhất"
            action={
              <div className="flex items-center gap-4 text-[11px] font-black uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-[#666666] dark:text-[#b3b3b3]">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#f59e0b]" /> Nhập
                </span>
                <span className="flex items-center gap-1.5 text-[#666666] dark:text-[#b3b3b3]">
                  <span className="h-2.5 w-2.5 rounded-[2px] bg-[#1ed760]" /> Xuất
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
                        className="w-1/2 max-w-[22px] bg-[#f59e0b] rounded-t-[4px] transition-all duration-500"
                        style={{
                          height: `${(d.gateIn / trendMax) * 100}%`,
                          minHeight: d.gateIn > 0 ? "4px" : "0",
                        }}
                        title={`${d.gateIn} lượt nhập`}
                      />
                      <div
                        className="w-1/2 max-w-[22px] bg-[#1ed760] rounded-t-[4px] transition-all duration-500"
                        style={{
                          height: `${(d.gateOut / trendMax) * 100}%`,
                          minHeight: d.gateOut > 0 ? "4px" : "0",
                        }}
                        title={`${d.gateOut} lượt xuất`}
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

        <SectionCard title="Trạng thái cảng">
          <div className="p-6 space-y-5">
            {charts.byPortStatus.every((s) => s.count === 0) ? (
              <EmptyRow text="Chưa có container nào." />
            ) : (
              charts.byPortStatus.map((s) => (
                <div key={s.portStatus} className="space-y-2">
                  <div className="flex items-center justify-between text-[12px] font-bold">
                    <span className="text-[#121212] dark:text-[#ffffff]">
                      {s.portStatus}
                    </span>
                    <span className="text-[#666666] dark:text-[#b3b3b3]">
                      {s.count}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-[500px] bg-[#f0f0f0] dark:bg-[#272727] overflow-hidden">
                    <div
                      className="h-full rounded-[500px] transition-all duration-500"
                      style={{
                        width: `${(s.count / portMax) * 100}%`,
                        backgroundColor: PORT_STATUS_COLOR[s.portStatus] || "#999999",
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      </div>

      {/* Loại container + mã BIC */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Loại container đang quản lý">
          {charts.byType.length === 0 ? (
            <EmptyRow text="Chưa có container nào." />
          ) : (
            <div className="p-6 space-y-5">
              {charts.byType.map((t) => (
                <div key={t.type} className="space-y-2">
                  <div className="flex items-center justify-between text-[12px] font-bold">
                    <span className="text-[#121212] dark:text-[#ffffff]">
                      {t.type}
                    </span>
                    <span className="text-[#666666] dark:text-[#b3b3b3]">
                      {t.count}
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-[500px] bg-[#f0f0f0] dark:bg-[#272727] overflow-hidden">
                    <div
                      className="h-full rounded-[500px] bg-[#3b82f6] transition-all duration-500"
                      style={{ width: `${(t.count / typeMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Mã BIC đang sử dụng"
          action={
            <Link href="/client/provider/settings">
              <Button
                variant="ghost"
                className="text-[#666666] hover:text-[#121212] dark:text-[#b3b3b3] dark:hover:text-[#ffffff] font-bold uppercase tracking-wider text-[12px] gap-2"
              >
                Cấu hình <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        >
          <div className="p-6 space-y-4">
            {data.bic.used.length === 0 ? (
              <EmptyRow text="Chưa có container nào để đối chiếu mã BIC." />
            ) : (
              <>
                <div className="flex flex-wrap gap-3">
                  {data.bic.used.map((u) => (
                    <div
                      key={u.code}
                      className={`flex items-center gap-2 px-4 py-2 rounded-[500px] border font-black text-[14px] ${
                        u.declared
                          ? "bg-[#1ed760]/10 border-[#1ed760]/20 text-[#1db954]"
                          : "bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]"
                      }`}
                      title={
                        u.declared
                          ? "Đã khai báo trong cài đặt"
                          : "Chưa khai báo trong cài đặt"
                      }
                    >
                      <Tag className="h-3.5 w-3.5" />
                      {u.code}
                      <span className="text-[12px] font-bold opacity-70">
                        {u.count}
                      </span>
                    </div>
                  ))}
                </div>
                {data.bic.unusedDeclared.length > 0 && (
                  <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3]">
                    Đã khai nhưng chưa dùng:{" "}
                    {data.bic.unusedDeclared.join(", ")}
                  </p>
                )}
                <p className="text-[12px] font-bold text-[#999999] dark:text-[#666666]">
                  Màu xanh: mã đã khai báo · Màu cam: mã container đang dùng nhưng
                  chưa có trong cài đặt.
                </p>
              </>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Hoạt động gần nhất + lịch hẹn sắp tới */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          title="Giao dịch gần đây"
          action={
            <Link href="/client/provider/history">
              <Button
                variant="ghost"
                className="text-[#666666] hover:text-[#121212] dark:text-[#b3b3b3] dark:hover:text-[#ffffff] font-bold uppercase tracking-wider text-[12px] gap-2"
              >
                Xem tất cả <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          }
        >
          {data.recentActivity.length === 0 ? (
            <EmptyRow text="Chưa có lượt ra vào cảng nào được ghi nhận." />
          ) : (
            <div className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
              {data.recentActivity.map((t) => (
                <div key={t._id} className="px-6 py-4 flex items-center gap-4">
                  <div
                    className={`h-10 w-10 rounded-[500px] flex items-center justify-center shrink-0 ${
                      t.direction === "in"
                        ? "bg-[#f59e0b]/10 text-[#f59e0b]"
                        : "bg-[#1ed760]/10 text-[#1db954]"
                    }`}
                  >
                    {t.direction === "in" ? (
                      <ArrowDownToLine className="h-5 w-5" />
                    ) : (
                      <ArrowUpFromLine className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[14px] text-[#121212] dark:text-[#ffffff] truncate">
                      {t.containerNo || "—"}
                    </p>
                    <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3] truncate">
                      {t.direction === "in" ? "Vào cảng" : "Rời cảng"}
                      {t.truckPlate ? ` · ${t.truckPlate}` : ""}
                      {t.companyName ? ` · ${t.companyName}` : ""}
                      {t.assignedSlot ? ` · Ô ${t.assignedSlot}` : ""}
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

        <SectionCard title="Lịch hẹn sắp tới với container của bạn">
          {data.upcomingAppointments.length === 0 ? (
            <EmptyRow text="Không có lịch hẹn nào sắp tới." />
          ) : (
            <div className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
              {data.upcomingAppointments.map((a) => (
                <div key={a._id} className="px-6 py-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-[500px] bg-[#3b82f6]/10 text-[#3b82f6] flex items-center justify-center shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[14px] text-[#121212] dark:text-[#ffffff] truncate">
                      {a.containerNo} · {a.purpose}
                    </p>
                    <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3] truncate">
                      {formatDate(a.scheduledDate)} · {a.timeSlot}
                      {a.companyName ? ` · ${a.companyName}` : ""}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border ${
                      STATUS_STYLE[a.status] || STATUS_STYLE.Pending
                    }`}
                  >
                    {STATUS_LABEL[a.status] || a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Container lưu bãi quá hạn */}
      {data.overstayItems.length > 0 && (
        <SectionCard title="Container lưu bãi quá hạn">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                <tr>
                  <th className="px-6 py-4 font-black">Số container</th>
                  <th className="px-6 py-4 font-black">Vào cảng lúc</th>
                  <th className="px-6 py-4 font-black">Đã lưu</th>
                  <th className="px-6 py-4 font-black">Vị trí</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                {data.overstayItems.map((o) => (
                  <tr
                    key={o._id}
                    className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                      {o.containerNo}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                      {formatTime(o.checkInTime)} · {formatDate(o.checkInTime)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border bg-[#f3727f]/10 text-[#f3727f] border-[#f3727f]/20">
                        {o.hours !== null ? `${o.hours} giờ` : "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                      {o.yardName || "—"}
                      {o.assignedSlot ? ` · Ô ${o.assignedSlot}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      <div className="flex items-start gap-3 p-4 rounded-[16px] bg-[#f8f8f8] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727]">
        <Info className="h-4 w-4 text-[#666666] dark:text-[#b3b3b3] shrink-0 mt-0.5" />
        <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3]">
          Số liệu chỉ tính trên container thuộc hãng tàu của bạn. Lượt qua cổng
          được đối chiếu theo số container mà camera đọc được. Trang tự làm mới
          mỗi 60 giây.
        </p>
      </div>

      {error && data && (
        <p className="flex items-center gap-2 text-[12px] font-bold text-[#f3727f]">
          <XCircle className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}
