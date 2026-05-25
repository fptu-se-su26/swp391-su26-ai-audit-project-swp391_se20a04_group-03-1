"use client";

import { useEffect, useState } from "react";
import { Spot } from "@/app/client/parking/parking-map";

// Mock initial spots
const initial: Spot[] = [];
for (let x = 0; x < 6; x++) {
  for (let y = 0; y < 4; y++) {
    const id = `B-${x}-${y}`;
    initial.push({
      id,
      zone: `B${Math.floor(x / 2) + 1}`,
      x,
      y,
      status: Math.random() > 0.6 ? "occupied" : "free",
      geo: { lat: 10.762913 + x * 0.0002, lon: 106.682195 + y * 0.0002 },
    });
  }
}

export function useRealtimeSpots() {
  const [spots, setSpots] = useState<Spot[]>(initial);

  useEffect(() => {
    // mock realtime updates: randomly toggle a spot every 3s
    const t = setInterval(() => {
      setSpots((s) => {
        const copy = [...s];
        const i = Math.floor(Math.random() * copy.length);
        const cur = copy[i];
        if (!cur) return copy;
        // toggle between free and occupied occasionally
        const r = Math.random();
        if (r > 0.85) cur.status = cur.status === "free" ? "occupied" : "free";
        // 10% become reserved
        if (r > 0.95) cur.status = "reserved";
        copy[i] = { ...cur };
        return copy;
      });
    }, 3000);
    return () => clearInterval(t);
  }, []);

  return { spots, setSpots } as const;
}
