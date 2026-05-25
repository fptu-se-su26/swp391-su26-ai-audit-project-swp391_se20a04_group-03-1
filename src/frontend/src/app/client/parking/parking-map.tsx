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

export default function ParkingMap({
  spots,
  onSelect,
  selectedId,
}: {
  spots: Spot[];
  onSelect: (id: string) => void;
  selectedId?: string | null;
}) {
  // determine grid size
  const maxX = Math.max(...spots.map((s) => s.x), 4);
  const maxY = Math.max(...spots.map((s) => s.y), 6);

  const columns = maxX + 1;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-slate-300">Sơ đồ bãi (chạm để chọn ô)</div>
        <div className="text-xs text-slate-400">
          Tình trạng: <span className="text-emerald-400">Trống</span> •{" "}
          <span className="text-slate-500">Đã chiếm</span> •{" "}
          <span className="text-amber-400">Đã đặt</span>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-3 top-3 flex flex-col gap-2 z-20">
          <button className="w-10 h-10 rounded-md bg-[#0b1624] border border-slate-700/30 text-amber-300">
            +
          </button>
          <button className="w-10 h-10 rounded-md bg-[#0b1624] border border-slate-700/30 text-amber-300">
            -
          </button>
        </div>

        <div
          className="grid gap-2 p-6"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(60px, 1fr))`,
          }}
        >
          {Array.from({ length: (maxY + 1) * columns }).map((_, idx) => {
            const col = idx % columns;
            const row = Math.floor(idx / columns);
            const spot = spots.find((s) => s.x === col && s.y === row);
            return (
              <div key={idx} className="h-20">
                {spot ? (
                  <SpotTile
                    spot={spot}
                    selected={selectedId === spot.id}
                    onClick={() => onSelect(spot.id)}
                  />
                ) : (
                  <div className="h-full rounded-md border border-dashed border-slate-700/20 bg-[#071018]/40" />
                )}
              </div>
            );
          })}
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-1">
            <div className="text-amber-300">🚚</div>
            <div className="text-xs text-amber-200">YOUR POSITION</div>
          </div>
        </div>
      </div>
    </div>
  );
}
