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
  const bg =
    spot.status === "free"
      ? "bg-emerald-500/80"
      : spot.status === "occupied"
        ? "bg-slate-700"
        : spot.status === "reserved"
          ? "bg-amber-400/90"
          : "bg-rose-500/80";

  return (
    <button
      onClick={onClick}
      className={`relative w-full h-full rounded-md p-2 text-left flex flex-col justify-between items-start transform transition ${selected ? "ring-2 ring-amber-400 shadow-lg" : "hover:scale-105"}`}
      aria-label={`Bay ${spot.id} ${spot.status}`}
    >
      <div
        className={`w-full rounded-md p-2 text-sm font-semibold text-slate-900 ${bg}`}
      >
        {spot.id}
      </div>
      <div className="text-xs text-slate-400">{spot.zone ?? "--"}</div>
      {selected && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
      )}
    </button>
  );
}
