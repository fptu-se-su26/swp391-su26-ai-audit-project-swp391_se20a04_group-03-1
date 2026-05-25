"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Spot } from "./parking-map";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371e3; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function SpotDetails({
  spot,
  onNavigate,
}: {
  spot: Spot;
  onNavigate: () => void;
}) {
  // attempt to get current position for distance estimate; fallback to null
  const [pos, setPos] = React.useState<{ lat: number; lon: number } | null>(
    null,
  );

  React.useEffect(() => {
    if (!navigator.geolocation) return;
    const id = setTimeout(() => {
      navigator.geolocation.getCurrentPosition(
        (p) => setPos({ lat: p.coords.latitude, lon: p.coords.longitude }),
        () => setPos(null),
        { timeout: 3000 },
      );
    }, 300);
    return () => clearTimeout(id as any);
  }, []);

  const distance = useMemo(() => {
    if (!pos || !spot.geo) return null;
    return Math.round(haversine(pos.lat, pos.lon, spot.geo.lat, spot.geo.lon));
  }, [pos, spot]);

  const eta = useMemo(() => {
    if (!distance) return "—";
    // assume 15 km/h inside port -> 4.167 m/s
    const speed = 15000 / 3600; // m/s
    const seconds = distance / speed;
    return `${Math.max(1, Math.round(seconds / 60))} phút`;
  }, [distance]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-amber-300">
            Bay {spot.id}
          </h2>
          <p className="text-sm text-slate-300">Khu: {spot.zone ?? "—"}</p>
        </div>
        <div className="rounded-md bg-emerald-600/90 px-3 py-1 text-xs font-semibold text-slate-900">
          READY
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-slate-700/20 p-3">
            <div className="text-xs text-slate-400">Distance</div>
            <div className="text-lg font-semibold">
              {distance ? `${distance} m` : "—"}
            </div>
          </div>
          <div className="rounded-md border border-slate-700/20 p-3">
            <div className="text-xs text-slate-400">Est. Time</div>
            <div className="text-lg font-semibold">{distance ? eta : "—"}</div>
          </div>
        </div>

        <div className="mt-4">
          <Button
            className="w-full bg-amber-400 text-slate-950 font-bold py-4"
            onClick={onNavigate}
          >
            <span className="mr-2">🧭</span> NAVIGATE TO SLOT
          </Button>
        </div>
      </div>
    </div>
  );
}
