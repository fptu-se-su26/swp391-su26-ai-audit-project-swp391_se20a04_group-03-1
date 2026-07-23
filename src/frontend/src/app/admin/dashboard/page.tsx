"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RequirePermission } from "@/lib/permissions";
import {
  Truck,
  Container as ContainerIcon,
  ParkingCircle,
  AlertTriangle,
  Clock,
  Box,
  Loader2,
  LogIn,
  LogOut,
  Calendar,
  Building2,
  IdCard,
  DoorOpen,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL;

interface DashboardData {
  generatedAt: string;
  kpis: {
    activeVehicles: number;
    checkInsToday: { value: number; delta: number | null };
    checkOutsToday: number;
    appointmentsToday: {
      total: number;
      pending: number;
      confirmed: number;
      completed: number;
      cancelled: number;
    };
    yardUtilization: {
      pct: number;
      occupied: number;
      totalSlots: number;
      free: number;
    };
    alertCount: number;
  };
  charts: {
    trafficByHour: { checkIn: number[]; checkOut: number[] };
    weeklyCheckIns: { date: string; count: number }[];
    containerByPortStatus: {
      total: number;
      items: { label: string; count: number; pct: number }[];
    };
  };
  yards: {
    _id: string;
    name: string;
    totalSlots: number;
    occupied: number;
    free: number;
    pct: number;
  }[];
  recentActivity: {
    _id: string;
    plate: string | null;
    containerNo: string | null;
    status: string | null;
    gateName: string | null;
    purpose: string | null;
    assignedSlot: string | null;
    ocrConfidence: number | null;
    at: string | null;
  }[];
  upcomingAppointments: {
    _id: string;
    truckPlate: string;
    containerNo: string;
    timeSlot: string;
    purpose: string;
    status: string;
    driverName: string | null;
  }[];
  alerts: {
    key: string;
    severity: "high" | "medium" | "low";
    message: string;
    count: number;
    link?: string;
  }[];
  totals: {
    companies: number;
    drivers: number;
    gates: number;
    containers: number;
  };
}

// Màu thanh tiến trình theo trạng thái cảng của container.
const PORT_STATUS_COLORS: Record<string, string> = {
  "Chưa nhập cảng": "bg-[#999999]",
  "Đã nhập cảng": "bg-[#00D4FF]",
  "Đang lưu bãi": "bg-[#f59e0b]",
  "Đã xuất cảng": "bg-[#1ed760]",
};

const hhmm = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const dayLabel = (isoDate: string) => {
  const d = new Date(`${isoDate}T00:00:00+07:00`);
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

/** % thay đổi so với hôm qua. null = hôm qua không có dữ liệu để so sánh. */
function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) {
    return (
      <span className="text-[10px] font-bold uppercase tracking-wider text-[#999999] dark:text-[#666666]">
        Chưa có nền so sánh
      </span>
    );
  }
  const up = delta >= 0;
  return (
    <span
      className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-[500px] ${
        up ? "bg-[#1ed760]/10 text-[#1db954]" : "bg-[#f3727f]/10 text-[#f3727f]"
      }`}
    >
      {up ? "↑" : "↓"} {Math.abs(delta)}% so hôm qua
    </span>
  );
}

const cardClass =
  "bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]";
const cardHeaderClass =
  "bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]";
const cardTitleClass =
  "text-[14px] font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider";

function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Chống dội: nhiều sự kiện cổng bắn liên tiếp chỉ gọi lại API 1 lần.
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    try {
      const res = await fetch(`${API}/dashboard/overview`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        setData(json.data);
        setError(null);
      } else {
        setError(json.message || "Không thể tải dữ liệu");
      }
    } catch {
      setError("Không kết nối được máy chủ");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Tự làm mới mỗi 60 giây để số liệu không bị cũ khi mở màn hình trực ca.
  useEffect(() => {
    const id = setInterval(() => load(true), 60000);
    return () => clearInterval(id);
  }, [load]);

  // Realtime: có xe qua cổng hoặc có thông báo mới thì nạp lại ngay.
  useEffect(() => {
    if (!API) return;
    const socket: Socket = io(API.replace(/\/api\/?$/, ""));

    const scheduleRefetch = () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      refetchTimer.current = setTimeout(() => load(true), 1500);
    };

    socket.on("gate_scan_update", scheduleRefetch);
    socket.on("notification", scheduleRefetch);

    return () => {
      if (refetchTimer.current) clearTimeout(refetchTimer.current);
      socket.disconnect();
    };
  }, [load]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-[#1ed760]" />
        <p className="mt-3 font-bold uppercase tracking-wider text-[12px] text-[#666666] dark:text-[#b3b3b3]">
          Đang tải bảng điều khiển...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="py-32 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-[#f3727f]" />
        <p className="mt-4 font-black uppercase tracking-wider text-[#f3727f]">
          {error || "Không có dữ liệu"}
        </p>
        <button
          onClick={() => load()}
          className="mt-6 inline-flex items-center gap-2 rounded-[500px] bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] text-[12px] px-6 py-3 transition-colors cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" /> Thử lại
        </button>
      </div>
    );
  }

  const { kpis, charts, yards, recentActivity, upcomingAppointments, alerts, totals } =
    data;

  const trafficIn = charts.trafficByHour.checkIn;
  const trafficOut = charts.trafficByHour.checkOut;
  const maxTraffic = Math.max(1, ...trafficIn, ...trafficOut);
  const maxWeekly = Math.max(1, ...charts.weeklyCheckIns.map((d) => d.count));

  const kpiCards = [
    {
      title: "Xe đang trong cảng",
      value: kpis.activeVehicles,
      icon: Truck,
      color: "bg-[#1ed760] text-[#121212]",
      sub: `${kpis.checkOutsToday} lượt đã rời cảng hôm nay`,
    },
    {
      title: "Check-in hôm nay",
      value: kpis.checkInsToday.value,
      icon: LogIn,
      color: "bg-[#00D4FF] text-[#121212]",
      delta: kpis.checkInsToday.delta,
    },
    {
      title: "Sử dụng bãi",
      value: `${kpis.yardUtilization.pct}%`,
      icon: ParkingCircle,
      color: "bg-[#f59e0b] text-[#121212]",
      sub: `${kpis.yardUtilization.occupied}/${kpis.yardUtilization.totalSlots} ô đang dùng`,
    },
    {
      title: "Lịch hẹn hôm nay",
      value: kpis.appointmentsToday.total,
      icon: Calendar,
      color: "bg-[#a78bfa] text-[#121212]",
      sub: `${kpis.appointmentsToday.pending} chờ duyệt · ${kpis.appointmentsToday.completed} hoàn thành`,
    },
    {
      title: "Cảnh báo",
      value: kpis.alertCount,
      icon: AlertTriangle,
      color:
        kpis.alertCount > 0
          ? "bg-[#f3727f] text-[#121212]"
          : "bg-[#e5e5e5] dark:bg-[#272727] text-[#666666]",
      sub: kpis.alertCount > 0 ? "Cần xử lý" : "Không có cảnh báo",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Tổng quan trạng thái
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1 uppercase tracking-wider text-[12px]">
            Cập nhật lúc {hhmm(data.generatedAt)} · tự làm mới mỗi phút
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="self-start inline-flex items-center gap-2 rounded-[500px] bg-[#f8f8f8] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] hover:border-[#1ed760] text-[#121212] dark:text-[#ffffff] font-black uppercase tracking-[1.5px] text-[12px] px-5 py-2.5 transition-colors cursor-pointer disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin text-[#1ed760]" : ""}`}
          />
          Làm mới
        </button>
      </div>

      {/* Cảnh báo cần xử lý */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((a) => (
            <Link
              key={a.key}
              href={a.link || "#"}
              className={`flex items-center gap-4 p-4 rounded-[16px] border transition-colors group ${
                a.severity === "high"
                  ? "bg-[#f3727f]/[0.06] border-[#f3727f]/40 hover:border-[#f3727f]"
                  : "bg-[#f59e0b]/[0.06] border-[#f59e0b]/40 hover:border-[#f59e0b]"
              }`}
            >
              <AlertTriangle
                className={`h-5 w-5 shrink-0 ${
                  a.severity === "high" ? "text-[#f3727f]" : "text-[#f59e0b]"
                }`}
              />
              <p className="flex-1 font-bold text-[14px] text-[#121212] dark:text-[#ffffff]">
                {a.message}
              </p>
              <ArrowRight className="h-4 w-4 text-[#666666] dark:text-[#b3b3b3] group-hover:translate-x-1 transition-transform" />
            </Link>
          ))}
        </div>
      )}

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-6">
        {kpiCards.map((k) => {
          const Icon = k.icon;
          return (
            <Card
              key={k.title}
              className={`${cardClass} hover:border-[#1ed760] transition-colors duration-300`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#b3b3b3]">
                  {k.title}
                </CardTitle>
                <div className={`${k.color} rounded-[500px] p-2.5 shadow-sm`}>
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-black text-[#121212] dark:text-[#ffffff]">
                  {k.value}
                </div>
                <div className="mt-2">
                  {"delta" in k ? (
                    <DeltaBadge delta={k.delta as number | null} />
                  ) : (
                    <p className="text-[11px] font-bold text-[#666666] dark:text-[#999999]">
                      {k.sub}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Lưu lượng theo giờ + xu hướng 7 ngày */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className={`xl:col-span-2 ${cardClass}`}>
          <CardHeader className={cardHeaderClass}>
            <CardTitle className={cardTitleClass}>
              Lưu lượng qua cổng hôm nay
            </CardTitle>
            <div className="flex items-center gap-5 mt-3">
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#b3b3b3]">
                <span className="h-3 w-3 rounded-[3px] bg-[#1ed760]" /> Xe vào
              </span>
              <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#b3b3b3]">
                <span className="h-3 w-3 rounded-[3px] bg-[#00D4FF]" /> Xe ra
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-56 flex items-end justify-around gap-1">
              {trafficIn.map((inCount, hour) => {
                const outCount = trafficOut[hour] || 0;
                return (
                  <div
                    key={hour}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                    <div className="w-full flex items-end justify-center gap-[2px] h-[180px]">
                      <div
                        className="w-1/2 bg-[#1ed760] rounded-t-[3px] min-h-[2px] transition-all relative"
                        style={{ height: `${(inCount / maxTraffic) * 100}%` }}
                      >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-[#121212] text-[#ffffff] text-[10px] font-bold px-2 py-1 rounded-[4px] pointer-events-none whitespace-nowrap transition-opacity">
                          {hour}h: {inCount} vào · {outCount} ra
                        </span>
                      </div>
                      <div
                        className="w-1/2 bg-[#00D4FF] rounded-t-[3px] min-h-[2px] transition-all"
                        style={{ height: `${(outCount / maxTraffic) * 100}%` }}
                      />
                    </div>
                    {hour % 3 === 0 && (
                      <span className="text-[9px] font-bold text-[#666666] dark:text-[#999999]">
                        {hour}h
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className={cardHeaderClass}>
            <CardTitle className={cardTitleClass}>Xe vào 7 ngày qua</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-56 flex items-end justify-around gap-2">
              {charts.weeklyCheckIns.map((d, idx) => {
                const isToday = idx === charts.weeklyCheckIns.length - 1;
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center gap-2 group"
                  >
                    <span className="text-[11px] font-black text-[#121212] dark:text-[#ffffff]">
                      {d.count}
                    </span>
                    <div
                      className={`w-full rounded-t-[4px] min-h-[2px] transition-colors ${
                        isToday
                          ? "bg-[#1ed760]"
                          : "bg-[#e5e5e5] dark:bg-[#272727] group-hover:bg-[#1ed760]"
                      }`}
                      style={{ height: `${(d.count / maxWeekly) * 150}px` }}
                    />
                    <span
                      className={`text-[9px] font-bold ${
                        isToday
                          ? "text-[#1db954]"
                          : "text-[#666666] dark:text-[#999999]"
                      }`}
                    >
                      {dayLabel(d.date)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hoạt động gần đây + lịch hẹn sắp tới */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className={`xl:col-span-2 ${cardClass}`}>
          <CardHeader className={cardHeaderClass}>
            <div className="flex items-center justify-between">
              <CardTitle className={cardTitleClass}>Hoạt động mới nhất</CardTitle>
              <Link
                href="/admin/gate/logs"
                className="text-[11px] font-black uppercase tracking-wider text-[#1db954] hover:text-[#1ed760] transition-colors"
              >
                Xem tất cả
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {recentActivity.length === 0 ? (
              <p className="text-center py-10 text-[#666666] dark:text-[#999999] font-bold uppercase tracking-wider text-[12px]">
                Chưa có lượt xe nào qua cổng
              </p>
            ) : (
              <div className="space-y-0">
                {recentActivity.map((a) => {
                  const isOut = a.status === "out";
                  return (
                    <Link
                      key={a._id}
                      href={`/admin/gate/logs/${a._id}`}
                      className="flex items-center justify-between gap-4 py-3.5 border-b border-[#e5e5e5] dark:border-[#272727] last:border-0 group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-[500px] flex items-center justify-center shrink-0 ${
                            isOut
                              ? "bg-[#00D4FF]/15 text-[#0891b2]"
                              : "bg-[#1ed760]/15 text-[#1db954]"
                          }`}
                        >
                          {isOut ? (
                            <LogOut className="h-4 w-4" />
                          ) : (
                            <LogIn className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[14px] text-[#121212] dark:text-[#ffffff] group-hover:text-[#1ed760] transition-colors truncate">
                            {a.plate || "Không rõ biển số"}
                            {a.containerNo && (
                              <span className="text-[#666666] dark:text-[#999999] font-normal">
                                {" "}
                                · {a.containerNo}
                              </span>
                            )}
                          </p>
                          <p className="text-[12px] text-[#666666] dark:text-[#999999] mt-0.5 truncate">
                            {isOut ? "Rời cảng" : "Vào cảng"}
                            {a.gateName ? ` qua ${a.gateName}` : ""}
                            {a.assignedSlot ? ` · ô ${a.assignedSlot}` : ""}
                            {a.purpose ? ` · ${a.purpose}` : ""}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 flex items-center gap-1.5 text-[12px] font-bold text-[#666666] dark:text-[#999999]">
                        <Clock className="h-3.5 w-3.5" />
                        {hhmm(a.at)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className={cardHeaderClass}>
            <div className="flex items-center justify-between">
              <CardTitle className={cardTitleClass}>Lịch hẹn hôm nay</CardTitle>
              <Link
                href="/admin/appointments"
                className="text-[11px] font-black uppercase tracking-wider text-[#1db954] hover:text-[#1ed760] transition-colors"
              >
                Quản lý
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {upcomingAppointments.length === 0 ? (
              <p className="text-center py-10 text-[#666666] dark:text-[#999999] font-bold uppercase tracking-wider text-[12px]">
                Không còn lịch hẹn nào chờ xử lý
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAppointments.map((ap) => (
                  <div
                    key={ap._id}
                    className="p-4 rounded-[12px] bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-black text-[13px] text-[#121212] dark:text-[#ffffff] truncate">
                        {ap.truckPlate}
                      </p>
                      <span
                        className={`shrink-0 text-[10px] px-2.5 py-0.5 font-black uppercase tracking-wider rounded-[500px] ${
                          ap.status === "Pending"
                            ? "bg-[#f59e0b]/15 text-[#f59e0b]"
                            : "bg-[#1ed760]/15 text-[#1db954]"
                        }`}
                      >
                        {ap.status === "Pending" ? "Chờ duyệt" : "Đã duyệt"}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#666666] dark:text-[#999999] mt-1.5 truncate">
                      {ap.timeSlot} · {ap.purpose}
                    </p>
                    <p className="text-[12px] text-[#666666] dark:text-[#999999] truncate">
                      {ap.containerNo}
                      {ap.driverName ? ` · ${ap.driverName}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bãi + container */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className={`xl:col-span-2 ${cardClass}`}>
          <CardHeader className={cardHeaderClass}>
            <div className="flex items-center justify-between">
              <CardTitle className={cardTitleClass}>Sức chứa từng bãi</CardTitle>
              <Link
                href="/admin/yard"
                className="text-[11px] font-black uppercase tracking-wider text-[#1db954] hover:text-[#1ed760] transition-colors"
              >
                Xem bãi
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {yards.length === 0 ? (
              <p className="text-center py-10 text-[#666666] dark:text-[#999999] font-bold uppercase tracking-wider text-[12px]">
                Chưa khai báo bãi nào
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {yards.map((y) => (
                  <Link
                    key={y._id}
                    href={`/admin/yard/${y._id}`}
                    className="p-5 bg-[#f8f8f8] dark:bg-[#121212] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727] hover:border-[#1ed760] transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-[500px] bg-[#ffffff] dark:bg-[#181818] flex items-center justify-center shadow-sm shrink-0">
                        <Box className="h-4 w-4 text-[#121212] dark:text-[#ffffff]" />
                      </div>
                      <p className="font-bold text-[14px] text-[#121212] dark:text-[#ffffff] truncate">
                        {y.name}
                      </p>
                    </div>
                    <div className="w-full bg-[#e5e5e5] dark:bg-[#272727] rounded-[500px] h-3 mb-3 overflow-hidden">
                      <div
                        className={`h-full rounded-[500px] transition-all duration-700 ${
                          y.pct >= 90
                            ? "bg-[#f3727f]"
                            : y.pct >= 70
                              ? "bg-[#f59e0b]"
                              : "bg-[#1ed760]"
                        }`}
                        style={{ width: `${Math.min(y.pct, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[12px] font-bold">
                      <span className="text-[#666666] dark:text-[#999999]">
                        {y.occupied}/{y.totalSlots} ô · còn trống {y.free}
                      </span>
                      <span
                        className={
                          y.pct >= 90
                            ? "text-[#f3727f]"
                            : "text-[#121212] dark:text-[#ffffff]"
                        }
                      >
                        {y.pct}%
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={cardClass}>
          <CardHeader className={cardHeaderClass}>
            <CardTitle className={cardTitleClass}>
              Container theo trạng thái
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {charts.containerByPortStatus.total === 0 ? (
              <p className="text-center py-10 text-[#666666] dark:text-[#999999] font-bold uppercase tracking-wider text-[12px]">
                Chưa có container nào
              </p>
            ) : (
              <div className="space-y-5">
                {charts.containerByPortStatus.items.map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[12px] font-bold mb-2">
                      <span className="text-[#666666] dark:text-[#999999]">
                        {item.label}
                      </span>
                      <span className="text-[#121212] dark:text-[#ffffff]">
                        {item.count} ({item.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#f8f8f8] dark:bg-[#121212] rounded-[500px] h-3 border border-[#e5e5e5] dark:border-[#272727] overflow-hidden">
                      <div
                        className={`${PORT_STATUS_COLORS[item.label] || "bg-[#1ed760]"} h-full rounded-[500px] transition-all duration-500`}
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

      {/* Quy mô hệ thống */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Công ty",
            value: totals.companies,
            icon: Building2,
            href: "/admin/companies",
          },
          {
            label: "Tài xế",
            value: totals.drivers,
            icon: IdCard,
            href: "/admin/drivers",
          },
          {
            label: "Cổng",
            value: totals.gates,
            icon: DoorOpen,
            href: "/admin/gate",
          },
          {
            label: "Container",
            value: totals.containers,
            icon: ContainerIcon,
            href: "/admin/containers",
          },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <Link key={t.label} href={t.href}>
              <Card
                className={`${cardClass} hover:border-[#1ed760] transition-colors h-full`}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 rounded-[500px] bg-[#f8f8f8] dark:bg-[#272727] text-[#666666] dark:text-[#b3b3b3] shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[1.5px] text-[#666666] dark:text-[#b3b3b3]">
                      {t.label}
                    </p>
                    <p className="text-2xl font-black text-[#121212] dark:text-[#ffffff]">
                      {t.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequirePermission resource="dashboard" action="view">
      <DashboardContent />
    </RequirePermission>
  );
}
