"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CalendarClock,
  Trash2,
  Check,
  MoreHorizontal,
  Info,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSSE } from "@/lib/use-sse";

type AlertType = "info" | "appointment" | "system";
type AlertStatus = "unread" | "read" | "important" | "cancelled" | "confirmed";

type AlertItem = {
  id: string;
  title: string;
  body: string;
  time: string;
  type: AlertType;
  status: AlertStatus;
  appointmentId?: string;
};

const mockAlerts: AlertItem[] = [
  {
    id: "a1",
    title: "Nhắc: Check-in trước 15 phút",
    body: "Hãy check-in bằng QR hoặc GPS tối thiểu 15 phút trước cửa để tránh phạt.",
    time: "08:02",
    type: "system",
    status: "unread",
  },
  {
    id: "a2",
    title: "Lịch: MSCU-884210-9 — 08:00-10:00",
    body: "Lịch xác nhận tại Gate 04. Nhấn xem để mở pass và quét QR.",
    time: "07:40",
    type: "appointment",
    status: "confirmed",
    appointmentId: "slot-01",
  },
  {
    id: "a3",
    title: "Cảnh báo: Trễ giờ 15 phút",
    body: "Bạn đang trễ khung 16:10-18:10. Có thể đổi khung hoặc tạo lịch mới.",
    time: "06:20",
    type: "appointment",
    status: "important",
    appointmentId: "slot-03",
  },
  {
    id: "a4",
    title: "Hủy: Lượt 22/10",
    body: "Lượt đã bị hủy do trễ. Bạn có thể đặt lại lịch.",
    time: "01:12",
    type: "appointment",
    status: "cancelled",
    appointmentId: "slot-07",
  },
];

const filters = [
  { id: "all", label: "Tất cả" },
  { id: "unread", label: "Chưa đọc" },
  { id: "important", label: "Quan trọng" },
  { id: "appointment", label: "Lịch hẹn" },
];

export default function AlertsPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [alerts, setAlerts] = useState<AlertItem[]>(mockAlerts);
  const [selected, setSelected] = useState<AlertItem | null>(null);

  const unreadCount = useMemo(
    () => alerts.filter((a) => a.status === "unread").length,
    [alerts],
  );

  function applyFilter(items: AlertItem[]) {
    let res = items;
    if (activeFilter === "unread")
      res = res.filter((i) => i.status === "unread");
    if (activeFilter === "important")
      res = res.filter((i) => i.status === "important");
    if (activeFilter === "appointment")
      res = res.filter((i) => i.type === "appointment");
    if (query.trim())
      res = res.filter((i) =>
        `${i.title} ${i.body}`.toLowerCase().includes(query.toLowerCase()),
      );
    return res;
  }

  function markAsRead(id: string) {
    setAlerts((s) =>
      s.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "unread" ? "read" : a.status }
          : a,
      ),
    );
  }

  function cancelAppointment(appointmentId?: string) {
    if (!appointmentId) return;
    // mock: update any alert that relates to this appointment to cancelled
    setAlerts((s) =>
      s.map((a) =>
        a.appointmentId === appointmentId ? { ...a, status: "cancelled" } : a,
      ),
    );
  }

  const visible = applyFilter(alerts);
  // SSE handler: receive { type: 'new_alert'|'update_alert', payload }
  type SseMessage = { type: "new_alert" | "update_alert"; payload?: AlertItem };

  const handleSseMessage = (msg: unknown) => {
    const m = msg as SseMessage | null;
    if (!m) return;
    if (m.type === "new_alert" && m.payload) {
      const payload = m.payload as AlertItem;
      setAlerts((s) => [payload, ...s]);
    } else if (m.type === "update_alert" && m.payload) {
      const payload = m.payload as AlertItem;
      setAlerts((s) =>
        s.map((a) => (a.id === payload.id ? { ...a, ...payload } : a)),
      );
    }
  };

  // call the hook at top level so React rules of hooks are respected
  useSSE("/api/alerts/stream", handleSseMessage);

  return (
    <main
      className="min-h-screen bg-[#07111f] text-slate-100"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(247, 184, 102, 0.06), transparent 30%), radial-gradient(circle at 80% 10%, rgba(78, 214, 167, 0.04), transparent 25%), linear-gradient(180deg, #08101d 0%, #050b14 100%)",
      }}
    >
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <header className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">Thông báo</h1>
            <p className="text-sm text-slate-300">
              Các thông báo liên quan chuyến đi và lịch hẹn của bạn
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-amber-400/10 px-3 py-1 text-amber-200">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {unreadCount} chưa đọc
              </span>
            </div>
            <Button variant="outline" className="h-10">
              <CalendarClock className="mr-2 h-4 w-4" /> Lọc
            </Button>
          </div>
        </header>

        <div className="mb-4 flex items-center gap-3">
          <Input
            placeholder="Tìm thông báo, container, id..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {filters.map((f) => (
            <Button
              key={f.id}
              type="button"
              variant={activeFilter === f.id ? "default" : "outline"}
              className={`h-10 rounded-2xl px-4 text-sm font-semibold ${
                activeFilter === f.id
                  ? "bg-amber-400 text-slate-950"
                  : "bg-white/5"
              }`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
        </div>

        <section className="space-y-3">
          {visible.length === 0 && (
            <Card className="border border-slate-700/30 bg-[#0f1a2a]/80 text-slate-300">
              <CardContent className="p-4">
                <CardTitle>Không tìm thấy thông báo</CardTitle>
                <CardDescription>
                  Không có thông báo phù hợp với bộ lọc hoặc tìm kiếm của bạn.
                </CardDescription>
              </CardContent>
            </Card>
          )}

          {visible.map((a) => (
            <Card
              key={a.id}
              className={`border ${a.status === "unread" ? "border-amber-300/30" : "border-slate-700/20"} bg-[#101b31]/95`}
            >
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg border bg-white/5">
                    {a.type === "system" ? (
                      <Info className="h-5 w-5 text-amber-300" />
                    ) : a.type === "appointment" ? (
                      <CalendarClock className="h-5 w-5 text-emerald-300" />
                    ) : (
                      <Bell className="h-5 w-5 text-slate-300" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        className={`text-sm font-semibold ${a.status === "unread" ? "text-slate-50" : "text-slate-200"}`}
                      >
                        {a.title}
                      </h3>
                      <span className="ml-2 text-xs text-slate-400">
                        {a.time}
                      </span>
                      <span
                        className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          a.status === "important"
                            ? "bg-rose-500/20 text-rose-300"
                            : a.status === "cancelled"
                              ? "bg-slate-600/30 text-slate-200"
                              : a.status === "confirmed"
                                ? "bg-emerald-500/20 text-emerald-200"
                                : "bg-slate-600/10 text-slate-300"
                        }`}
                      >
                        {a.status === "important"
                          ? "Quan trọng"
                          : a.status === "cancelled"
                            ? "Đã hủy"
                            : a.status === "confirmed"
                              ? "Đã xác nhận"
                              : a.status === "unread"
                                ? "Chưa đọc"
                                : "Đã đọc"}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300 max-w-xl">
                      {a.body}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          markAsRead(a.id);
                        }}
                      >
                        <Check className="mr-2 h-4 w-4" /> Đánh dấu
                      </Button>
                      {a.type === "appointment" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelAppointment(a.appointmentId)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Hủy lịch
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => setSelected(a)}
                      >
                        <MoreHorizontal className="mr-2 h-4 w-4" /> Chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>

        {selected && (
          <aside className="fixed right-4 top-16 z-50 w-full max-w-md rounded-xl border bg-[#0b1624]/95 p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold">{selected.title}</h3>
                <p className="mt-1 text-sm text-slate-300">{selected.body}</p>
                <p className="mt-2 text-xs text-slate-400">
                  Thời gian: {selected.time}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Button variant="ghost" onClick={() => setSelected(null)}>
                  Đóng
                </Button>
                {selected.type === "appointment" && (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      cancelAppointment(selected.appointmentId);
                      setSelected(null);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Hủy lịch
                  </Button>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>
    </main>
  );
}
