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

import { Button } from "../../ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "../../ui/card";
import { Input } from "../../ui/input";
import { useSSE } from "../../../lib/use-sse";

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
    time: "01:12",
    type: "appointment",
    status: "cancelled",
    appointmentId: "slot-07",
  },
  {
    id: "a2",
    title: "Hệ thống: Bảo trì",
    body: "Hệ thống sẽ bảo trì vào 02:00 - 03:00. Một số tính năng có thể bị gián đoạn.",
    time: "03:00",
    type: "system",
    status: "unread",
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

  // Confirm dialog / snackbar state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [pendingAction, setPendingAction] = useState<{
    type: "cancel" | "mark";
    alertId: string;
    appointmentId?: string;
    prevStatus?: AlertStatus;
  } | null>(null);

  const [snack, setSnack] = useState<{
    open: boolean;
    message: string;
    undo?: () => void;
  }>({ open: false, message: "" });

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

  // markAsRead flow is triggered via pendingAction from UI buttons

  function cancelAppointment(appointmentId?: string) {
    if (!appointmentId) return;
    // find related alert id(s) and prompt confirm
    const related = alerts.find((a) => a.appointmentId === appointmentId);
    const alertId = related?.id;
    setPendingAction({ type: "cancel", alertId: alertId ?? "", appointmentId });
    setConfirmMessage(
      "Bạn có chắc muốn hủy lịch? Bạn có thể hoàn tác trong vài giây.",
    );
    setConfirmOpen(true);
  }

  function performPendingAction() {
    if (!pendingAction) return;
    const { type, alertId, appointmentId, prevStatus } = pendingAction;
    if (type === "mark") {
      // change unread -> read
      setAlerts((s) =>
        s.map((a) => (a.id === alertId ? { ...a, status: "read" } : a)),
      );
      // show snackbar with undo
      setSnack({
        open: true,
        message: "Đã đánh dấu là đã đọc",
        undo: () => {
          setAlerts((s) =>
            s.map((a) =>
              a.id === alertId
                ? { ...a, status: (prevStatus as AlertStatus) ?? "unread" }
                : a,
            ),
          );
          setSnack({ open: false, message: "" });
        },
      });
    }

    if (type === "cancel") {
      // capture previous statuses for related alerts so undo can restore them
      const prev = alerts
        .filter((a) => a.appointmentId === appointmentId)
        .map((a) => ({ id: a.id, status: a.status }));

      setAlerts((s) =>
        s.map((a) =>
          a.appointmentId === appointmentId ? { ...a, status: "cancelled" } : a,
        ),
      );
      setSnack({
        open: true,
        message: "Đã hủy lịch",
        undo: () => {
          setAlerts((s) =>
            s.map((a) => {
              const p = prev.find((x) => x.id === a.id);
              return p ? { ...a, status: p.status } : a;
            }),
          );
          setSnack({ open: false, message: "" });
        },
      });
    }

    setPendingAction(null);
    setConfirmOpen(false);
    // auto-hide snackbar after 4s if not undone
    setTimeout(() => setSnack((s) => ({ ...s, open: false })), 4000);
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
                          setPendingAction({
                            type: "mark",
                            alertId: a.id,
                            prevStatus: a.status,
                          });
                          setConfirmMessage(
                            "Bạn có chắc muốn đánh dấu thông báo là đã đọc?",
                          );
                          setConfirmOpen(true);
                        }}
                      >
                        <Check className="mr-2 h-4 w-4" /> Đánh dấu
                      </Button>
                      {a.type === "appointment" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPendingAction({
                              type: "cancel",
                              alertId: a.id,
                              appointmentId: a.appointmentId,
                            });
                            setConfirmMessage(
                              "Bạn có chắc muốn hủy lịch? Bạn có thể hoàn tác trong vài giây.",
                            );
                            setConfirmOpen(true);
                          }}
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
        {/* Confirm dialog */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg border bg-[#0f1a2a]/95 p-6">
              <h3 className="text-lg font-bold">Xác nhận</h3>
              <p className="mt-2 text-sm text-slate-300">{confirmMessage}</p>
              <div className="mt-4 flex justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setConfirmOpen(false);
                    setPendingAction(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => performPendingAction()}
                >
                  Xác nhận
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Snackbar / Undo */}
        {snack.open && (
          <div className="fixed left-1/2 bottom-6 z-50 w-full max-w-md -translate-x-1/2">
            <div className="mx-4 flex items-center justify-between gap-4 rounded-lg border bg-[#101b31]/95 p-3 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center text-amber-300">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold">{snack.message}</p>
                  <p className="text-xs text-slate-400">
                    Hoàn tác sẽ khôi phục trạng thái trước đó.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {snack.undo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (snack.undo) {
                        snack.undo();
                      }
                    }}
                  >
                    Hoàn tác
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSnack({ open: false, message: "" })}
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
