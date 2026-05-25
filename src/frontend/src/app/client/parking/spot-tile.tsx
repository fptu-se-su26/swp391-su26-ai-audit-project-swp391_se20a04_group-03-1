"use client";

import React from "react";
import { Spot } from "./parking-map";

export default function SpotTile({
  spot,
  onClick,
  selected,
}: {
  spot: Spot;
  onClick: () => void;
  selected?: boolean;
}) {
  const stateClass =
    spot.status === "free"
      ? "bg-emerald-400 text-slate-950"
      : spot.status === "occupied"
        ? "bg-slate-700 text-slate-100"
        : spot.status === "reserved"
          ? "bg-amber-400 text-slate-950"
          : "bg-rose-500 text-slate-950";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Vị trí ${spot.id} ${spot.status}`}
      aria-pressed={selected ? "true" : "false"}
      className={`relative flex h-full w-full flex-col justify-between rounded-xl border p-3 text-left transition-all duration-150 ${
        selected
          ? "border-amber-300 shadow-[0_0_0_2px_rgba(250,185,84,0.25)] scale-[1.02]"
          : "border-slate-700/40 hover:-translate-y-0.5 hover:border-amber-300/50"
      } ${stateClass}`}
    >
      <div className="text-[10px] font-bold uppercase tracking-[0.28em] opacity-80">
        {spot.zone}
      </div>
      <div className="text-xl font-black tracking-wide">{spot.id}</div>
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.2em] opacity-80">
        <span>
          {spot.status === "free"
            ? "trống"
            : spot.status === "occupied"
              ? "đã chiếm"
              : spot.status === "reserved"
                ? "đã đặt"
                : "lỗi"}
        </span>
        {selected ? (
          <span className="h-2.5 w-2.5 rounded-full bg-amber-100 animate-pulse" />
        ) : (
          <span />
        )}
      </div>
    </button>
  );
}
