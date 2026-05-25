"use client";

import React, { useMemo, useState } from "react";
import { Search, MapPinned, Radio } from "lucide-react";
import { Input } from "@/components/ui/input";
import ParkingMap, { type Spot } from "@/app/client/parking/parking-map";
import SpotDetails from "@/app/client/parking/spot-details";
import { useRealtimeSpots } from "../../../lib/use-realtime-spots";

export default function ParkingPage() {
  const { spots } = useRealtimeSpots();
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const selectedSpot = useMemo(
    () => spots.find((s: Spot) => s.id === selected) ?? null,
    [spots, selected],
  );

  const filteredSpots = useMemo(() => {
    if (!query.trim()) return spots;
    const q = query.toLowerCase();
    return spots.filter((spot) =>
      `${spot.id} ${spot.zone} ${spot.status}`.toLowerCase().includes(q),
    );
  }, [spots, query]);

  const freeCount = useMemo(
    () => filteredSpots.filter((s: Spot) => s.status === "free").length,
    [filteredSpots],
  );

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-5 md:py-6">
        <header className="space-y-4">
          <div className="flex items-center gap-3 rounded-[18px] border border-amber-300/25 bg-[#0f1a2a]/90 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
            <Search className="h-5 w-5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm bay (ví dụ: Khu B, B-12)"
              className="h-10 border-0 bg-transparent px-0 text-base text-slate-100 placeholder:text-slate-500 focus-visible:ring-0"
            />
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-100 md:text-4xl">
                Bãi đỗ xe
              </h1>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-slate-300">
                Khu 04 đang giám sát •{" "}
                <span className="text-emerald-400">{freeCount} ô trống</span>
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-700/40 bg-[#0b1624] px-3 py-2 text-xs text-slate-300">
              <Radio className="h-4 w-4 text-emerald-400" /> Thời gian thực
            </div>
          </div>
        </header>

        <section className="mt-4 space-y-4">
          <div className="rounded-[24px] border border-slate-700/30 bg-[#0f1a2a]/80 p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="rounded-full border border-amber-300/20 bg-[#0b1624] px-3 py-1 text-xs font-bold tracking-[0.2em] text-amber-200">
                KHU 04 / KHU BẮC
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block h-3 w-3 rounded bg-emerald-400" />{" "}
                Trống
                <span className="inline-block ml-2 h-3 w-3 rounded bg-slate-500" />{" "}
                Đã chiếm
                <span className="inline-block ml-2 h-3 w-3 rounded bg-amber-400" />{" "}
                Đã đặt
              </div>
            </div>
            <ParkingMap
              spots={filteredSpots}
              onSelect={(id: string) => setSelected(id)}
              selectedId={selected}
            />
          </div>

          <div className="rounded-[24px] border border-amber-300/25 bg-[#101b31]/95 p-4 md:p-5 shadow-[0_8px_30px_rgba(0,0,0,0.15)]">
            {selectedSpot ? (
              <SpotDetails
                spot={selectedSpot}
                onNavigate={() => {
                  const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.id}`;
                  window.open(url, "_blank");
                }}
              />
            ) : (
              <div className="space-y-3 py-4 text-slate-300">
                <div className="flex items-center gap-2 text-amber-200">
                  <MapPinned className="h-5 w-5" />
                  <span className="font-semibold">
                    Chọn một bay để xem khoảng cách, thời gian dự kiến và điều
                    hướng
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-400">
                  Sơ đồ bãi được chia theo các khu A/B/C/D để tài xế dễ nhìn, dễ
                  chạm và dễ xác định vị trí đỗ.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
