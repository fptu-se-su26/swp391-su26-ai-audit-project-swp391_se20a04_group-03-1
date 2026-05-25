"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Spot } from "@/app/client/parking/parking-map";

function calcDistance(spot: Spot) {
  const base = spot.zone === "A" || spot.zone === "B" ? 120 : 145;
  const rank = parseInt(spot.id.split("-")[1] ?? "1", 10);
  return base + rank * 18;
}

export default function SpotDetails({
  spot,
  onNavigate,
}: {
  spot: Spot;
  onNavigate: () => void;
}) {
  const distance = useMemo(() => calcDistance(spot), [spot]);
  const eta = useMemo(
    () => `${Math.max(1, Math.round(distance / 70))} min`,
    [distance],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Vị trí đã chọn
          </p>
          <h2 className="mt-1 text-3xl font-black text-amber-300">
            Ô {spot.id}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            Khu {spot.zone} •{" "}
            {spot.status === "free"
              ? "trống"
              : spot.status === "occupied"
                ? "đã chiếm"
                : spot.status === "reserved"
                  ? "đã đặt"
                  : "lỗi"}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/15 px-3 py-2 text-sm font-bold text-emerald-300">
          SẴN SÀNG
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-amber-300/20 bg-[#101b31] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Khoảng cách
          </p>
          <p className="mt-2 text-[2rem] font-black leading-none text-slate-100 md:text-3xl">
            {distance}m
          </p>
        </div>
        <div className="rounded-2xl border border-amber-300/20 bg-[#101b31] p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            Thời gian dự kiến
          </p>
          <p className="mt-2 text-[2rem] font-black leading-none text-slate-100 md:text-3xl">
            {eta}
          </p>
        </div>
      </div>

      <Button
        onClick={onNavigate}
        className="h-14 w-full rounded-2xl bg-amber-300 text-slate-950 text-base font-extrabold shadow-lg transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]"
      >
        Bắt đầu điều hướng
      </Button>
    </div>
  );
}
