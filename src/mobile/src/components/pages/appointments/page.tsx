"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Ban,
  Bell,
  CalendarClock,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  MapPin,
  PhoneCall,
  Plus,
  RefreshCcw,
  ScanLine,
  Truck,
  Waypoints,
  Navigation2,
  FilePlus2,
  TicketCheck,
} from "lucide-react";

import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "../../ui/card";
import { Input } from "../../ui/input";

type SlotStatus = "confirmed" | "pending" | "late" | "cancelled" | "completed";

type SlotItem = {
  id: string;
  label: string;
  time: string;
  window: string;
  date: string;
  gate: string;
  container: string;
  service: string;
  status: SlotStatus;
  note: string;
  route: string;
};

const slotTabs = [
  { id: "today", label: "Hôm nay" },
  { id: "upcoming", label: "Sắp tới" },
  { id: "history", label: "Lịch sử" },
] as const;

const slotGroups: Record<(typeof slotTabs)[number]["id"], SlotItem[]> = {
  today: [
    {
      id: "slot-01",
      label: "Lịch gần nhất",
      time: "08:00 - 10:00",
      window: "Còn 25 phút",
      date: "24/10/2023",
      gate: "04",
      container: "MSCU-884210-9",
      service: "Import Pick-up",
      status: "confirmed",
      note: "Đã xác nhận, chờ quét QR tại cổng.",
      route: "Đi thẳng cổng 04, sau đó vào khu kiểm tra giấy tờ.",
    },
    {
      id: "slot-02",
      label: "Khung giờ trưa",
      time: "13:30 - 15:30",
      window: "Còn 2 giờ 10 phút",
      date: "24/10/2023",
      gate: "--",
      container: "TGHU-110294-0",
      service: "Empty Return",
      status: "pending",
      note: "Đang chờ vào cổng, có thể đổi khung nếu bị trễ.",
      route: "Theo dõi điều phối để vào cổng khi tới lượt.",
    },
    {
      id: "slot-03",
      label: "Lịch chiều",
      time: "16:10 - 18:10",
      window: "Trễ 15 phút",
      date: "24/10/2023",
      gate: "12",
      container: "CMAU-552109-2",
      service: "Full Drop-off",
      status: "late",
      note: "Bạn đã trễ giờ. Nên đổi lịch hoặc tạo lịch mới ngay.",
      route: "Xin chuyển sang khung gần nhất để tránh mất lượt.",
    },
  ],
  upcoming: [
    {
      id: "slot-04",
      label: "Lượt mai",
      time: "07:30 - 09:00",
      window: "Sáng mai",
      date: "25/10/2023",
      gate: "08",
      container: "SEGU-778201-1",
      service: "Import Pick-up",
      status: "pending",
      note: "Khung giờ còn trống, có thể điều chỉnh trước khi vào cổng.",
      route: "Nên xác nhận sớm để tránh dồn xe giờ cao điểm.",
    },
    {
      id: "slot-05",
      label: "Lượt dự phòng",
      time: "10:00 - 12:00",
      window: "Đề xuất",
      date: "25/10/2023",
      gate: "06",
      container: "MSKU-420991-7",
      service: "Empty Return",
      status: "confirmed",
      note: "Hệ thống đề xuất để thay thế nếu tài xế cần dời lịch.",
      route: "Tốt cho trường hợp tài xế bị kẹt đường hoặc đổi chuyến.",
    },
  ],
  history: [
    {
      id: "slot-06",
      label: "Đã hoàn tất",
      time: "06:00 - 08:00",
      window: "Hoàn tất 07:12",
      date: "23/10/2023",
      gate: "12",
      container: "CMAU-552109-2",
      service: "Full Drop-off",
      status: "completed",
      note: "Lượt vào cổng đã xong, có thể xem lại chi tiết khi cần đối soát.",
      route: "Dùng cho tra cứu nhanh và đối chiếu lịch sử.",
    },
    {
      id: "slot-07",
      label: "Đã hủy",
      time: "14:00 - 16:00",
      window: "Hủy do trễ",
      date: "22/10/2023",
      gate: "--",
      container: "HLCU-991203-4",
      service: "Import Pick-up",
      status: "cancelled",
      note: "Chuyến trước đã hủy, có thể tạo lịch đặt chuyến mới ngay.",
      route: "Tạo lịch mới để tránh phải chờ lại từ đầu.",
    },
  ],
};

const statusMeta: Record<
  SlotStatus,
  { label: string; tone: string; pill: string; icon: typeof CircleCheckBig }
> = {
  confirmed: {
    label: "Đã xác nhận",
    tone: "text-emerald-100",
    pill: "bg-emerald-400/15 text-emerald-100 border-emerald-300/25",
    icon: CircleCheckBig,
  },
  pending: {
    label: "Chờ xử lý",
    tone: "text-amber-100",
    pill: "bg-amber-400/15 text-amber-100 border-amber-300/25",
    icon: Clock3,
  },
  late: {
    label: "Đã trễ",
    tone: "text-orange-100",
    pill: "bg-orange-400/15 text-orange-100 border-orange-300/25",
    icon: CircleAlert,
  },
  cancelled: {
    label: "Đã hủy",
    tone: "text-rose-100",
    pill: "bg-rose-400/15 text-rose-100 border-rose-300/25",
    icon: Ban,
  },
  completed: {
    label: "Hoàn tất",
    tone: "text-slate-100",
    pill: "bg-slate-400/15 text-slate-100 border-slate-300/20",
    icon: TicketCheck,
  },
};

function SlotActionButton({
  icon: Icon,
  label,
  variant = "outline",
}: {
  icon: typeof ScanLine;
  label: string;
  variant?: "default" | "outline" | "ghost";
}) {
  return (
    <Button
      type="button"
      variant={variant}
      className="h-11 rounded-2xl px-4 text-sm font-semibold"
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

export default function SlotsPage() {
  const [activeTab, setActiveTab] =
    useState<(typeof slotTabs)[number]["id"]>("today");
  const [selectedId, setSelectedId] = useState<string>(slotGroups.today[0].id);
  const [newDate, setNewDate] = useState("25/10/2023");
  const [newWindow, setNewWindow] = useState("10:00 - 12:00");
  const [newContainer, setNewContainer] = useState("MSKU-420991-7");
  const [newNote, setNewNote] = useState(
    "Xin tạo lịch mới do bị trễ chuyến cũ.",
  );

  const visibleSlots = slotGroups[activeTab];

  const selectedSlot = useMemo(() => {
    const candidate = visibleSlots.find((item) => item.id === selectedId);
    return candidate ?? visibleSlots[0];
  }, [selectedId, visibleSlots]);

  const trendCard = useMemo(() => {
    if (selectedSlot.status === "late") {
      return {
        title: "Bạn đang trễ giờ",
        description:
          "Nên đổi sang khung gần nhất hoặc tạo lịch mới để tránh mất lượt vào cổng.",
        tone: "border-orange-300/25 bg-orange-400/10 text-orange-100",
      };
    }

    if (selectedSlot.status === "cancelled") {
      return {
        title: "Lịch đã hủy",
        description:
          "Bạn có thể tạo lịch đỗ xe mới hoặc đặt chuyến mới ngay tại đây.",
        tone: "border-rose-300/25 bg-rose-400/10 text-rose-100",
      };
    }

    if (selectedSlot.status === "pending") {
      return {
        title: "Cần theo dõi giờ vào",
        description:
          "Nếu kẹt đường hoặc đến muộn, tài xế có thể đổi khung giờ trước khi hết hạn.",
        tone: "border-amber-300/25 bg-amber-400/10 text-amber-100",
      };
    }

    if (selectedSlot.status === "completed") {
      return {
        title: "Lượt đã hoàn tất",
        description:
          "Dùng để đối soát, xem lại hành trình hoặc tạo lịch tiếp theo nếu cần.",
        tone: "border-slate-300/20 bg-slate-400/10 text-slate-100",
      };
    }

    return {
      title: "Lịch đã xác nhận",
      description:
        "Mọi thông tin đã sẵn sàng, chỉ cần vào cổng đúng giờ và quét QR khi đến lượt.",
      tone: "border-emerald-300/25 bg-emerald-400/10 text-emerald-100",
    };
  }, [selectedSlot.status]);

  return (
    <main
      className="min-h-screen overflow-hidden bg-[#07111f] text-slate-100"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 0%, rgba(247, 184, 102, 0.09), transparent 30%), radial-gradient(circle at 80% 10%, rgba(78, 214, 167, 0.08), transparent 25%), linear-gradient(180deg, #08101d 0%, #050b14 100%)",
      }}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 pb-28 pt-4 sm:px-6 lg:px-8">
        <header className="mb-5 rounded-[28px] border border-amber-300/25 bg-[#101b31]/95 p-4 shadow-[0_0_0_1px_rgba(247,184,102,0.08),0_24px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between gap-3 border-b border-amber-300/15 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-300/30 bg-amber-400/15 text-amber-200 shadow-lg shadow-amber-500/10">
                <Waypoints className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold tracking-[0.32em] text-amber-200/80">
                  PORT DRIVER
                </p>
                <h1 className="text-xl font-black tracking-tight text-slate-100 sm:text-2xl">
                  Lịch hẹn của tôi
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 text-emerald-200 sm:flex">
              <CircleCheckBig className="h-4 w-4" />
              <span className="text-xs font-semibold tracking-[0.2em]">
                SẴN SÀNG XỬ LÝ
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              {
                label: "Lượt hôm nay",
                value: "03",
                helper: "1 xác nhận, 1 chờ, 1 trễ",
              },
              {
                label: "Có thể đổi ngay",
                value: "02",
                helper: "Đổi giờ hoặc tạo lịch mới",
              },
              {
                label: "Chuyến đã xong",
                value: "12",
                helper: "Xem lại lịch sử bất cứ lúc nào",
              },
            ].map((item) => (
              <Card
                key={item.label}
                className="border border-slate-500/15 bg-[#101b31]/95 text-slate-100"
              >
                <CardContent className="space-y-1 p-4">
                  <CardDescription className="text-[11px] font-bold tracking-[0.3em] text-slate-300">
                    {item.label}
                  </CardDescription>
                  <p className="text-3xl font-black text-slate-50">
                    {item.value}
                  </p>
                  <p className="text-xs leading-5 text-slate-300">
                    {item.helper}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </header>

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {slotTabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              variant={activeTab === tab.id ? "default" : "outline"}
              className={`h-11 rounded-2xl px-5 text-sm font-semibold ${
                activeTab === tab.id
                  ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                  : "border border-amber-300/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedId(slotGroups[tab.id][0]?.id ?? selectedId);
              }}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.65fr)]">
          <section className="space-y-4">
            <Card className="border border-amber-300/25 bg-[#101b31]/95 text-slate-100 shadow-[0_0_0_1px_rgba(247,184,102,0.08),0_24px_60px_rgba(0,0,0,0.35)]">
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardDescription className="text-[11px] font-bold tracking-[0.3em] text-amber-200/80">
                      LỊCH ĐANG CHỌN
                    </CardDescription>
                    <CardTitle className="mt-2 text-2xl font-black tracking-tight text-slate-50 sm:text-3xl">
                      {selectedSlot.time}
                    </CardTitle>
                    <p className="mt-1 text-sm text-slate-300">
                      {selectedSlot.label}
                    </p>
                  </div>

                  <div
                    className={`rounded-2xl border px-3 py-2 text-xs font-semibold ${statusMeta[selectedSlot.status].pill}`}
                  >
                    {statusMeta[selectedSlot.status].label}
                  </div>
                </div>

                <div className={`rounded-[22px] border p-4 ${trendCard.tone}`}>
                  <div className="flex items-center gap-2 font-bold">
                    {selectedSlot.status === "late" ? (
                      <CircleAlert className="h-4 w-4" />
                    ) : selectedSlot.status === "cancelled" ? (
                      <Ban className="h-4 w-4" />
                    ) : selectedSlot.status === "completed" ? (
                      <TicketCheck className="h-4 w-4" />
                    ) : (
                      <CircleCheckBig className="h-4 w-4" />
                    )}
                    <span>{trendCard.title}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 opacity-90">
                    {trendCard.description}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    { label: "Cổng", value: `GATE ${selectedSlot.gate}` },
                    { label: "Ngày", value: selectedSlot.date },
                    { label: "Container", value: selectedSlot.container },
                    { label: "Dịch vụ", value: selectedSlot.service },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-slate-500/15 bg-white/5 p-3"
                    >
                      <p className="text-[11px] font-bold tracking-[0.28em] text-slate-300">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-slate-100">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <SlotActionButton icon={ScanLine} label="Quét QR" />
                  <SlotActionButton icon={RefreshCcw} label="Đổi khung giờ" />
                  <SlotActionButton
                    icon={Ban}
                    label="Hủy lịch"
                    variant="outline"
                  />
                  <SlotActionButton
                    icon={Plus}
                    label="Tạo lịch mới"
                    variant="default"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-3">
              {visibleSlots.map((slot) => {
                const meta = statusMeta[slot.status];
                const Icon = meta.icon;

                return (
                  <Card
                    key={slot.id}
                    className={`border border-slate-500/15 bg-[#101b31]/95 text-slate-100 transition-all shadow-[0_0_0_1px_rgba(247,184,102,0.08),0_24px_60px_rgba(0,0,0,0.35)] ${
                      selectedId === slot.id
                        ? "ring-2 ring-amber-300/70"
                        : "hover:border-amber-300/25"
                    }`}
                  >
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <div className="rounded-2xl border border-amber-300/20 bg-slate-950/70 px-3 py-2 text-white">
                              <p className="text-[10px] font-bold tracking-[0.3em] text-amber-300">
                                {slot.label.toUpperCase()}
                              </p>
                              <p className="mt-1 text-lg font-black tracking-tight">
                                GATE {slot.gate}
                              </p>
                            </div>

                            <div
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${meta.pill}`}
                            >
                              <Icon className="h-4 w-4" />
                              {meta.label}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-2xl font-black tracking-tight text-slate-50">
                              {slot.time}
                            </h3>
                            <p className="mt-1 text-sm text-slate-300">
                              {slot.window} • {slot.date}
                            </p>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-2">
                            <div>
                              <p className="text-[11px] font-bold tracking-[0.28em] text-slate-300">
                                CONTAINER ID
                              </p>
                              <p className="mt-1 font-mono text-sm text-slate-100">
                                {slot.container}
                              </p>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold tracking-[0.28em] text-slate-300">
                                SERVICE
                              </p>
                              <p className="mt-1 text-sm text-slate-100">
                                {slot.service}
                              </p>
                            </div>
                          </div>

                          <p className="text-sm leading-6 text-slate-300">
                            {slot.note}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 lg:min-w-50 lg:items-end">
                          <Button
                            type="button"
                            className="h-11 rounded-2xl bg-amber-400 px-4 text-sm font-semibold text-slate-950 hover:bg-amber-300"
                            onClick={() => setSelectedId(slot.id)}
                          >
                            Xem chi tiết
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 rounded-2xl border-emerald-300/20 bg-white/5 px-4 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white"
                          >
                            {slot.status === "late"
                              ? "Đổi sang khung gần nhất"
                              : slot.status === "cancelled"
                                ? "Tạo chuyến mới"
                                : slot.status === "completed"
                                  ? "Xem lại lịch sử"
                                  : "Xử lý nhanh"}
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-500/15 bg-slate-950/45 px-4 py-3 text-sm text-slate-300">
                        <div className="flex items-center gap-2">
                          <Navigation2 className="h-4 w-4 text-emerald-300" />
                          <span>{slot.route}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          className="h-9 rounded-full px-3 text-slate-200 hover:bg-white/10 hover:text-white"
                        >
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Mở thao tác
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-4 xl:self-start">
            <Card className="border border-amber-300/25 bg-[#101b31]/95 text-slate-100 shadow-[0_0_0_1px_rgba(247,184,102,0.08),0_24px_60px_rgba(0,0,0,0.35)]">
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="flex items-center gap-2 text-slate-100">
                  <CalendarClock className="h-5 w-5 text-amber-200" />
                  <h2 className="text-lg font-bold tracking-tight">
                    Tạo lịch mới
                  </h2>
                </div>

                <p className="text-sm leading-6 text-slate-300">
                  Dành cho trường hợp tài xế bị trễ, hủy chuyến cũ hoặc muốn tạo
                  lịch đỗ xe / chuyến mới ngay trong trang này.
                </p>

                <div className="space-y-3">
                  <div>
                    <p className="mb-2 text-[11px] font-bold tracking-[0.28em] text-slate-300">
                      NGÀY
                    </p>
                    <Input
                      value={newDate}
                      onChange={(event) => setNewDate(event.target.value)}
                      placeholder="dd/mm/yyyy"
                      className="h-11 rounded-2xl border-white/10 bg-slate-950/60 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-bold tracking-[0.28em] text-slate-300">
                      KHUNG GIỜ
                    </p>
                    <Input
                      value={newWindow}
                      onChange={(event) => setNewWindow(event.target.value)}
                      placeholder="08:00 - 10:00"
                      className="h-11 rounded-2xl border-white/10 bg-slate-950/60 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-bold tracking-[0.28em] text-slate-300">
                      CONTAINER / CHUYẾN
                    </p>
                    <Input
                      value={newContainer}
                      onChange={(event) => setNewContainer(event.target.value)}
                      placeholder="MSKU-..."
                      className="h-11 rounded-2xl border-white/10 bg-slate-950/60 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-[11px] font-bold tracking-[0.28em] text-slate-300">
                      GHI CHÚ
                    </p>
                    <Input
                      value={newNote}
                      onChange={(event) => setNewNote(event.target.value)}
                      placeholder="Lý do đổi / hủy / tạo mới"
                      className="h-11 rounded-2xl border-white/10 bg-slate-950/60 text-slate-100 placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    className="h-11 rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300"
                  >
                    <FilePlus2 className="mr-2 h-4 w-4" />
                    Tạo lịch mới
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-2xl border-emerald-300/20 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Tạo chuyến mới
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-slate-500/15 bg-[#101b31]/95 text-slate-100 shadow-[0_0_0_1px_rgba(247,184,102,0.08),0_24px_60px_rgba(0,0,0,0.35)]">
              <CardContent className="space-y-4 p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-amber-200" />
                    <h2 className="text-lg font-bold tracking-tight">
                      Xử lý nhanh
                    </h2>
                  </div>
                  <span className="rounded-full border border-amber-300/20 bg-amber-400/10 px-3 py-1 text-[10px] font-semibold tracking-[0.24em] text-amber-200">
                    1 CHẠM
                  </span>
                </div>

                <div className="space-y-3 text-sm leading-6 text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    Nếu đến trễ, bấm{" "}
                    <span className="font-semibold text-amber-200">
                      Đổi khung giờ
                    </span>{" "}
                    để lấy lịch gần nhất còn trống.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    Nếu hủy chuyến, chọn{" "}
                    <span className="font-semibold text-amber-200">
                      Tạo chuyến mới
                    </span>{" "}
                    hoặc tạo lịch đỗ xe mới ngay.
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    Nếu lịch đã xác nhận, chỉ cần{" "}
                    <span className="font-semibold text-amber-200">
                      Quét QR
                    </span>{" "}
                    khi vào cổng.
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    className="h-11 rounded-2xl bg-amber-400 text-slate-950 hover:bg-amber-300"
                  >
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Gọi điều phối
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11 rounded-2xl border-white/15 bg-transparent text-slate-100 hover:bg-white/10 hover:text-white"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Xem cổng
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="border-t border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-300 sm:px-5">
                Lịch mới sẽ được ưu tiên đề xuất theo khung giờ gần nhất và tình
                trạng cổng hiện tại.
              </CardFooter>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
