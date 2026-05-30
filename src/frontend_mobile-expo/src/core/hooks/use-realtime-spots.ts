/**
 * useRealtimeSpots — Real-time Yard Spot Simulation Hook
 *
 * Simulates real-time status changes on yard spots for development.
 * In production, this will be replaced with SSE/WebSocket integration.
 */
import { useEffect, useState } from 'react';
import type { Spot } from '@/core/types';

const initial: Spot[] = [
  { id: 'A-01', zone: 'A', x: 0, y: 0, status: 'free', geo: { lat: 10.7629, lon: 106.6821 } },
  { id: 'A-02', zone: 'A', x: 1, y: 0, status: 'occupied', geo: { lat: 10.763, lon: 106.6822 } },
  { id: 'A-03', zone: 'A', x: 0, y: 1, status: 'reserved', geo: { lat: 10.7631, lon: 106.6823 } },
  { id: 'A-04', zone: 'A', x: 1, y: 1, status: 'free', geo: { lat: 10.7632, lon: 106.6824 } },
  { id: 'B-01', zone: 'B', x: 0, y: 0, status: 'occupied', geo: { lat: 10.7633, lon: 106.6825 } },
  { id: 'B-02', zone: 'B', x: 1, y: 0, status: 'free', geo: { lat: 10.7634, lon: 106.6826 } },
  { id: 'B-03', zone: 'B', x: 0, y: 1, status: 'free', geo: { lat: 10.7635, lon: 106.6827 } },
  { id: 'B-04', zone: 'B', x: 1, y: 1, status: 'occupied', geo: { lat: 10.7636, lon: 106.6828 } },
  { id: 'C-01', zone: 'C', x: 0, y: 0, status: 'free', geo: { lat: 10.7637, lon: 106.6829 } },
  { id: 'C-02', zone: 'C', x: 1, y: 0, status: 'reserved', geo: { lat: 10.7638, lon: 106.683 } },
  { id: 'C-03', zone: 'C', x: 0, y: 1, status: 'occupied', geo: { lat: 10.7639, lon: 106.6831 } },
  { id: 'C-04', zone: 'C', x: 1, y: 1, status: 'free', geo: { lat: 10.764, lon: 106.6832 } },
  { id: 'D-01', zone: 'D', x: 0, y: 0, status: 'free', geo: { lat: 10.7641, lon: 106.6833 } },
  { id: 'D-02', zone: 'D', x: 1, y: 0, status: 'occupied', geo: { lat: 10.7642, lon: 106.6834 } },
  { id: 'D-03', zone: 'D', x: 0, y: 1, status: 'free', geo: { lat: 10.7643, lon: 106.6835 } },
  { id: 'D-04', zone: 'D', x: 1, y: 1, status: 'reserved', geo: { lat: 10.7644, lon: 106.6836 } },
];

/**
 * Simulates real-time spot status changes every 3 seconds.
 * Returns the current spot state and a setter for manual overrides.
 */
export function useRealtimeSpots() {
  const [spots, setSpots] = useState<Spot[]>(initial);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpots((prev) => {
        const copy = [...prev];
        const i = Math.floor(Math.random() * copy.length);
        const cur = copy[i];
        if (!cur) return copy;

        const r = Math.random();
        if (r > 0.86) cur.status = cur.status === 'free' ? 'occupied' : 'free';
        if (r > 0.95) cur.status = 'reserved';
        if (r > 0.985) cur.status = 'fault';

        copy[i] = { ...cur };
        return copy;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { spots, setSpots } as const;
}
