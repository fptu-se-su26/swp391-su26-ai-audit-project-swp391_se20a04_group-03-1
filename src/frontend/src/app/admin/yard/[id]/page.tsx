"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Video,
  Car,
  Clock,
  Box,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";

interface SlotRect {
  _id: string;
  slotName: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface MockActivity {
  id: string;
  truckPlate: string;
  containerNo: string;
  slotName: string;
  timeIn: string;
  status: "In" | "Out";
}

export default function YardDetailPage() {
  const { id } = useParams();
  const [yard, setYard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data states
  const [occupiedSlotNames, setOccupiedSlotNames] = useState<string[]>([]);
  const [activities, setActivities] = useState<MockActivity[]>([]);

  useEffect(() => {
    fetchYard();
  }, [id]);

  const fetchYard = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/yards/${id}`,
        {
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.code === "error") throw new Error(data.message);

      const yardData = data.data;
      setYard(yardData);

      // Generate mock data based on yard's slots
      generateMockData(yardData.slots || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (slots: SlotRect[]) => {
    if (slots.length === 0) return;

    // Randomly select some slots as occupied (about 40-60%)
    const occupiedCount = Math.floor(
      slots.length * (0.4 + Math.random() * 0.2),
    );
    const shuffledSlots = [...slots].sort(() => 0.5 - Math.random());
    const selectedOccupied = shuffledSlots
      .slice(0, occupiedCount)
      .map((s) => s.slotName);

    setOccupiedSlotNames(selectedOccupied);

    // Generate mock activities for these occupied slots
    const mockActivities: MockActivity[] = selectedOccupied.map(
      (slotName, i) => {
        // Mock plates and containers
        const plates = [
          "29C-123.45",
          "51D-987.65",
          "60C-342.11",
          "15C-555.22",
          "34C-999.00",
        ];
        const containers = [
          "MSCU1234567",
          "CMAU7654321",
          "TLLU1122334",
          "ZIMU9988776",
        ];

        const pastTime = new Date();
        pastTime.setMinutes(
          pastTime.getMinutes() - Math.floor(Math.random() * 120),
        ); // random within last 2 hours

        return {
          id: `mock-act-${i}`,
          truckPlate: plates[Math.floor(Math.random() * plates.length)],
          containerNo:
            containers[Math.floor(Math.random() * containers.length)],
          slotName: slotName,
          timeIn: pastTime.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "In",
        };
      },
    );

    setActivities(mockActivities);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Đang tải dữ liệu bãi đỗ...</p>
      </div>
    );
  }

  if (!yard) {
    return <div>Không tìm thấy bãi đỗ.</div>;
  }

  const totalSlots = yard.slots?.length || 0;
  const occupiedSlotsCount = occupiedSlotNames.length;
  const emptySlotsCount = totalSlots - occupiedSlotsCount;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/yard">
          <Button variant="outline" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Giám sát bãi đỗ: {yard.name}
          </h1>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <Video className="h-3 w-3" />
            Live Stream: {yard.cameraIp}
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border-blue-100 dark:border-blue-900/30 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Tổng số ô đỗ
              </p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {totalSlots}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border-red-100 dark:border-red-900/30 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Đã chiếm
              </p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {occupiedSlotsCount}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-100 dark:border-green-900/30 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <Box className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Còn trống
              </p>
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                {emptySlotsCount}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Video / Snapshot View */}
        <div className="lg:col-span-2">
          <Card className="h-full border-slate-200 dark:border-slate-800 overflow-hidden shadow-md">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b dark:border-slate-800 py-3 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                Live Camera (AI Detection)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 bg-slate-900 relative aspect-video">
              <img
                src={`http://localhost:5001/yard_feed?yard_id=${id}`}
                alt="Live AI Stream"
                className="w-full h-full object-cover"
              />
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities List */}
        <div className="lg:col-span-1">
          <Card className="h-full border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
            <CardHeader className="py-4 border-b dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                Hoạt động gần đây
              </CardTitle>
              <CardDescription>Các lượt xe ra vào bãi đỗ</CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
              {activities.length === 0 ? (
                <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-sm">
                  Chưa có hoạt động nào.
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {act.truckPlate}
                        </span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {act.timeIn}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                          <Car className="h-3 w-3" />
                          Vào ô {act.slotName}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Box className="h-3 w-3 text-slate-400 dark:text-slate-500" />
                          {act.containerNo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
