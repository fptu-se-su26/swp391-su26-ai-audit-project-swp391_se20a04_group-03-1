"use client";

import React, { useMemo, useState } from "react";
import ParkingMap, { type Spot } from "@/app/client/parking/parking-map";
import SpotDetails from "@/app/client/parking/spot-details";
import { useRealtimeSpots } from "../../../lib/use-realtime-spots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ParkingPage() {
  const { spots } = useRealtimeSpots();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedSpot = useMemo(
    () => spots.find((s: Spot) => s.id === selected) ?? null,
    [spots, selected],
  );

  const freeCount = useMemo(
    () => spots.filter((s: Spot) => s.status === "free").length,
    [spots],
  );

  return (
    <main className="min-h-screen bg-[#07111f] text-slate-100">
      <div className="mx-auto w-full max-w-4xl px-4 py-6">
        <header className="mb-3">
          <div className="mb-3">
            <Input placeholder="Search Slot (e.g. Zone-4, Bay B-12)" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-black">Staging Yard</h1>
              <p className="text-sm text-slate-300">
                ZONE 4 ACTIVE MONITORING •{" "}
                <span className="text-emerald-400">Available</span>{" "}
                <span className="text-slate-500 ml-2">Occupied</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="h-10">
                Tìm ô gần nhất
              </Button>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="rounded-lg border border-slate-700/30 bg-[#0f1a2a]/80 p-4">
            <ParkingMap
              spots={spots}
              onSelect={(id: string) => setSelected(id)}
              selectedId={selected}
            />
          </div>

          <div className="rounded-lg border border-slate-700/30 bg-[#0b1624]/95 p-4">
            {selectedSpot ? (
              <SpotDetails
                spot={selectedSpot}
                onNavigate={() => {
                  if (selectedSpot?.geo) {
                    const { lat, lon } = selectedSpot.geo;
                    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
                    window.open(url, "_blank");
                  }
                }}
              />
            ) : (
              <div className="p-6 text-center text-slate-300">
                Chọn một ô để xem chi tiết và điều hướng
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
