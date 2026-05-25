"use client";

import React from "react";
import SpotTile from "@/app/client/parking/spot-tile";

export type Spot = {
  id: string;
  zone?: string;
  x: number;
  y: number;
  status: "free" | "occupied" | "reserved" | "fault";
  geo?: { lat: number; lon: number };
};

const zoneOrder = ["A", "B", "C", "D"] as const;

export default function ParkingMap({
  spots,
  onSelect,
  selectedId,
}: {
  spots: Spot[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
}) {
  const zones = zoneOrder.map((zone) => ({
    zone,
    spots: spots.filter((spot) => spot.zone === zone),
  }));

  const freeCount = spots.filter((s) => s.status === "free").length;
  const occupiedCount = spots.filter((s) => s.status === "occupied").length;
  const reservedCount = spots.filter((s) => s.status === "reserved").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-slate-300">Sơ đồ bãi theo từng khu</p>
          <p className="text-xs text-slate-500">
            Dữ liệu IoT thời gian thực • trống / đã chiếm / đã đặt / lỗi
          </p>
        </div>
        <div className="rounded-full border border-slate-700/40 bg-[#09111d] px-3 py-2 text-xs text-slate-300">
          <span className="text-emerald-400">{freeCount}</span> trống •{" "}
          <span className="text-slate-400">{occupiedCount}</span> đã chiếm •{" "}
          <span className="text-amber-400">{reservedCount}</span> đã đặt
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] gap-4 rounded-[24px] border border-amber-300/20 bg-[radial-gradient(circle_at_50%_0%,rgba(250,185,84,0.10),transparent_30%),linear-gradient(180deg,#0f1a2a_0%,#0b1624_100%)] p-4 md:p-5">
        <div className="space-y-4">
          {zones.slice(0, 2).map((zone) => (
            <ZoneBlock
              key={zone.zone}
              zone={zone.zone}
              spots={zone.spots}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>

        <div className="relative flex min-h-140 min-w-27.5 items-center justify-center rounded-[22px] border border-dashed border-amber-300/20 bg-[#09111d]/55">
          <div className="absolute top-4 rounded-full border border-amber-300/20 bg-[#0b1624] px-4 py-1 text-[10px] font-bold tracking-[0.35em] text-amber-200">
            LÀN CHÍNH
          </div>
          <div className="text-center text-amber-300">
            <div className="text-3xl">🚚</div>
            <div className="mt-2 text-xs font-bold tracking-[0.24em]">
              VỊ TRÍ XE CỦA BẠN
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {zones.slice(2, 4).map((zone) => (
            <ZoneBlock
              key={zone.zone}
              zone={zone.zone}
              spots={zone.spots}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      <div className="text-xs text-slate-500">
        Khu A/B nằm bên trái, khu C/D nằm bên phải để tài xế nhìn nhanh theo
        từng khối.
      </div>
    </div>
  );
}

function ZoneBlock({
  zone,
  spots,
  selectedId,
  onSelect,
}: {
  zone: string;
  spots: Spot[];
  selectedId?: string | null;
  onSelect: (id: string) => void;
}) {
  const ordered = [...spots].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <section className="rounded-[20px] border border-slate-700/40 bg-[#08111d]/75 p-3 shadow-inner">
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-full border border-amber-300/20 bg-[#0c1728] px-3 py-1 text-[11px] font-extrabold tracking-[0.24em] text-amber-200">
          KHU {zone}
        </div>
        <div className="text-[11px] text-slate-500">4 vị trí</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ordered.map((spot) => (
          <div key={spot.id} className="h-24">
            <SpotTile
              spot={spot}
              selected={selectedId === spot.id}
              onClick={() => onSelect(spot.id)}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
