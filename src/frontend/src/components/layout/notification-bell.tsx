"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import {
  Bell,
  CheckCheck,
  Truck,
  Warehouse,
  Calendar,
  Box,
  Info,
} from "lucide-react";

interface NotificationItem {
  _id: string;
  type: "gate" | "yard" | "appointment" | "container" | "system";
  severity: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  isRead: boolean;
}

const API = process.env.NEXT_PUBLIC_API_URL;

const TYPE_ICON = {
  gate: Truck,
  yard: Warehouse,
  appointment: Calendar,
  container: Box,
  system: Info,
} as const;

// Màu theo mức độ — dùng chung cho chấm tròn và nền icon.
const SEVERITY_STYLE = {
  error: "bg-[#f3727f]/15 text-[#f3727f]",
  warning: "bg-[#f59e0b]/15 text-[#f59e0b]",
  success: "bg-[#1ed760]/15 text-[#1db954]",
  info: "bg-[#00D4FF]/15 text-[#0891b2]",
} as const;

/** "3 phút trước", "2 giờ trước"... đủ dùng, không cần thư viện ngày tháng. */
const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString("vi-VN");
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const load = async () => {
    try {
      const res = await fetch(`${API}/notifications?limit=20`, {
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") {
        setItems(json.data || []);
        setUnread(json.unreadCount || 0);
      }
    } catch {
      // Mất mạng/backend — giữ nguyên danh sách cũ, không làm vỡ header.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Realtime: backend phát "notification" mỗi khi có sự kiện vận hành mới.
  useEffect(() => {
    if (!API) return;
    const socketUrl = API.replace(/\/api\/?$/, "");
    const socket: Socket = io(socketUrl);

    socket.on("notification", (n: Omit<NotificationItem, "isRead">) => {
      setItems((prev) => [{ ...n, isRead: false }, ...prev].slice(0, 20));
      setUnread((c) => c + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Đóng panel khi bấm ra ngoài hoặc nhấn Esc.
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const markRead = async (id: string) => {
    // Cập nhật lạc quan trước để bấm vào là thấy đổi ngay.
    setItems((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnread((c) => Math.max(c - 1, 0));
    try {
      const res = await fetch(`${API}/notifications/${id}/read`, {
        method: "PATCH",
        credentials: "include",
      });
      const json = await res.json();
      if (json.code === "success") setUnread(json.unreadCount ?? 0);
    } catch {
      // Bỏ qua: lần load sau sẽ đồng bộ lại trạng thái thật.
    }
  };

  const markAllRead = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await fetch(`${API}/notifications/read-all`, {
        method: "PATCH",
        credentials: "include",
      });
    } catch {
      // Bỏ qua như trên.
    }
  };

  const onItemClick = (n: NotificationItem) => {
    if (!n.isRead) markRead(n._id);
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Thông báo"
        aria-expanded={open}
        className="relative p-2.5 bg-[#f8f8f8] dark:bg-[#121212] hover:bg-[#e5e5e5] dark:hover:bg-[#272727] rounded-[500px] text-[#121212] dark:text-[#ffffff] transition-all duration-300 active:scale-95 cursor-pointer shadow-sm"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-[500px] bg-[#f3727f] text-[#ffffff] text-[10px] font-black">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[380px] max-w-[calc(100vw-2rem)] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727] bg-[#ffffff] dark:bg-[#181818] shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#e5e5e5] dark:border-[#272727]">
            <div>
              <p className="font-black uppercase tracking-wider text-[13px] text-[#121212] dark:text-[#ffffff]">
                Thông báo
              </p>
              <p className="text-[11px] font-bold text-[#666666] dark:text-[#b3b3b3] mt-0.5">
                {unread > 0 ? `${unread} chưa đọc` : "Đã đọc tất cả"}
              </p>
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#1db954] hover:text-[#1ed760] transition-colors cursor-pointer"
              >
                <CheckCheck className="h-4 w-4" />
                Đọc hết
              </button>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <p className="px-5 py-10 text-center text-[13px] font-bold text-[#666666] dark:text-[#b3b3b3]">
                Đang tải...
              </p>
            ) : items.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <Bell className="h-8 w-8 mx-auto text-[#cccccc] dark:text-[#444444]" />
                <p className="mt-3 text-[13px] font-bold text-[#666666] dark:text-[#b3b3b3]">
                  Chưa có thông báo nào
                </p>
              </div>
            ) : (
              items.map((n) => {
                const Icon = TYPE_ICON[n.type] || Info;
                return (
                  <button
                    key={n._id}
                    onClick={() => onItemClick(n)}
                    className={`w-full text-left flex gap-3 px-5 py-4 border-b border-[#f0f0f0] dark:border-[#222222] last:border-0 hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors cursor-pointer ${
                      n.isRead ? "" : "bg-[#1ed760]/[0.04]"
                    }`}
                  >
                    <div
                      className={`shrink-0 h-9 w-9 rounded-[500px] flex items-center justify-center ${
                        SEVERITY_STYLE[n.severity]
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <p className="font-bold text-[13px] text-[#121212] dark:text-[#ffffff] flex-1">
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="mt-1.5 shrink-0 h-2 w-2 rounded-[500px] bg-[#1ed760]" />
                        )}
                      </div>
                      <p className="text-[12px] text-[#666666] dark:text-[#b3b3b3] mt-1 break-words">
                        {n.message}
                      </p>
                      <p className="text-[11px] font-bold text-[#999999] dark:text-[#666666] mt-1.5">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
