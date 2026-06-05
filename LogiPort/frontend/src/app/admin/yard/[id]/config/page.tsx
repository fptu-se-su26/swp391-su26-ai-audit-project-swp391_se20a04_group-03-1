"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Save,
  Trash2,
  LayoutDashboard,
  AlertCircle,
  Loader2,
  Camera,
} from "lucide-react";
import Link from "next/link";

interface SlotRect {
  id: string; // temp id for UI
  slotName: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function YardConfigPage() {
  const { id } = useParams();
  const router = useRouter();

  const [yard, setYard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);

  const [slots, setSlots] = useState<SlotRect[]>([]);
  const [drawingRect, setDrawingRect] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [draggingSlot, setDraggingSlot] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);

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

      setYard(data.data);
      // Map existing slots with temporary IDs for UI
      const existingSlots =
        data.data.slots?.map((s: any) => ({
          ...s,
          id: Math.random().toString(36).substr(2, 9),
        })) || [];
      setSlots(existingSlots);
    } catch (err: any) {
      setError(err.message || "Không thể tải cấu hình bãi đỗ.");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Calculate percentage coordinates
    const startX = ((e.clientX - rect.left) / rect.width) * 100;
    const startY = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setDrawingRect({
      startX,
      startY,
      currentX: startX,
      currentY: startY,
    });
  };

  const handleSlotMouseDown = (
    e: React.MouseEvent<HTMLDivElement>,
    slot: SlotRect,
  ) => {
    e.stopPropagation(); // Prevent triggering drawing
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    setDraggingSlot({
      id: slot.id,
      offsetX: clickX - slot.x,
      offsetY: clickY - slot.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    if (!isDrawing && !draggingSlot) return;

    const rect = containerRef.current.getBoundingClientRect();

    let currentX = ((e.clientX - rect.left) / rect.width) * 100;
    let currentY = ((e.clientY - rect.top) / rect.height) * 100;

    // Constrain to container
    currentX = Math.max(0, Math.min(100, currentX));
    currentY = Math.max(0, Math.min(100, currentY));

    if (draggingSlot) {
      setSlots(
        slots.map((s) => {
          if (s.id === draggingSlot.id) {
            let newX = currentX - draggingSlot.offsetX;
            let newY = currentY - draggingSlot.offsetY;

            newX = Math.max(0, Math.min(100 - s.width, newX));
            newY = Math.max(0, Math.min(100 - s.height, newY));

            return { ...s, x: newX, y: newY };
          }
          return s;
        }),
      );
      return;
    }

    if (isDrawing && drawingRect) {
      setDrawingRect({
        ...drawingRect,
        currentX,
        currentY,
      });
    }
  };

  const handleMouseUp = () => {
    if (draggingSlot) {
      setDraggingSlot(null);
      return;
    }

    if (!isDrawing || !drawingRect) return;

    const x = Math.min(drawingRect.startX, drawingRect.currentX);
    const y = Math.min(drawingRect.startY, drawingRect.currentY);
    const width = Math.abs(drawingRect.currentX - drawingRect.startX);
    const height = Math.abs(drawingRect.currentY - drawingRect.startY);

    // Only add if it has some dimension
    if (width > 1 && height > 1) {
      const newSlot: SlotRect = {
        id: Math.random().toString(36).substr(2, 9),
        slotName: `Slot ${slots.length + 1}`,
        x,
        y,
        width,
        height,
      };
      setSlots([...slots, newSlot]);
    }

    setIsDrawing(false);
    setDrawingRect(null);
  };

  const updateSlotName = (id: string, name: string) => {
    setSlots(slots.map((s) => (s.id === id ? { ...s, slotName: name } : s)));
  };

  const deleteSlot = (id: string) => {
    setSlots(slots.filter((s) => s.id !== id));
  };

  const saveConfiguration = async () => {
    try {
      setSaving(true);
      setError(null);
      // Clean up temp IDs before sending
      const payload = {
        slots: slots.map(({ id, ...rest }) => rest),
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/yards/${id}/slots`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          credentials: "include",
        },
      );
      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi lưu cấu hình.");
      }

      router.push("/admin/yard");
    } catch (err: any) {
      setError(err.message || "Không thể lưu cấu hình.");
      setSaving(false);
    }
  };

  const takeSnapshot = async () => {
    try {
      setIsTakingSnapshot(true);
      setError(null);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/yards/${id}/snapshot`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi chụp ảnh.");
      }
      setYard({ ...yard, snapshotUrl: result.data.snapshotUrl });
    } catch (err: any) {
      setError(err.message || "Không thể chụp ảnh.");
    } finally {
      setIsTakingSnapshot(false);
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/yard">
            <Button variant="outline" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Cấu hình ô đỗ - {yard.name}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-1">
              <LayoutDashboard className="h-3 w-3" />
              Kéo thả chuột trên hình ảnh để vẽ các ô đỗ xe.
            </p>
          </div>
        </div>
        <Button
          onClick={saveConfiguration}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Đang lưu..." : "Lưu cấu hình"}
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200/50">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Drawing Area */}
        <div className="xl:col-span-3">
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Camera Snapshot</CardTitle>
              <Button
                variant="secondary"
                size="sm"
                onClick={takeSnapshot}
                disabled={isTakingSnapshot || !yard.cameraIp}
                className="border-[1px] rounded-[10px] border-[#585756] cursor-pointer"
              >
                {isTakingSnapshot ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Camera className="h-4 w-4 mr-2" />
                )}
                Chụp ảnh từ Camera
              </Button>
            </CardHeader>
            <CardContent className="p-0 border-t">
              <div
                ref={containerRef}
                className="relative w-full overflow-hidden select-none bg-slate-900 cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={yard.snapshotUrl}
                  alt="Camera View"
                  className="block w-full h-auto"
                  draggable={false}
                />

                {/* Render Existing Slots */}
                {slots.map((slot) => (
                  <div
                    key={slot.id}
                    className="absolute border-2 border-green-500 bg-green-500/20 flex flex-col items-center justify-center cursor-move"
                    onMouseDown={(e) => handleSlotMouseDown(e, slot)}
                    style={{
                      left: `${slot.x}%`,
                      top: `${slot.y}%`,
                      width: `${slot.width}%`,
                      height: `${slot.height}%`,
                    }}
                  >
                    <span className="bg-black/70 text-white text-xs px-1.5 py-0.5 rounded shadow whitespace-nowrap">
                      {slot.slotName}
                    </span>
                  </div>
                ))}

                {/* Render Drawing Rectangle */}
                {drawingRect && (
                  <div
                    className="absolute border-2 border-dashed border-blue-400 bg-blue-400/20 pointer-events-none"
                    style={{
                      left: `${Math.min(drawingRect.startX, drawingRect.currentX)}%`,
                      top: `${Math.min(drawingRect.startY, drawingRect.currentY)}%`,
                      width: `${Math.abs(drawingRect.currentX - drawingRect.startX)}%`,
                      height: `${Math.abs(drawingRect.currentY - drawingRect.startY)}%`,
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slots List Sidebar */}
        <div className="xl:col-span-1">
          <Card className="h-full max-h-[700px] flex flex-col">
            <CardHeader className="py-4">
              <CardTitle className="text-base">
                Danh sách ô đỗ ({slots.length})
              </CardTitle>
              <CardDescription>Sửa tên hoặc xóa ô đã vẽ</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-3">
              {slots.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  Chưa có ô đỗ nào.
                  <br /> Hãy vẽ trên hình!
                </div>
              ) : (
                slots.map((slot, index) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-md border border-slate-200 dark:border-slate-800"
                  >
                    <div className="flex-1">
                      <Input
                        value={slot.slotName}
                        onChange={(e) =>
                          updateSlotName(slot.id, e.target.value)
                        }
                        className="h-8 text-sm bg-white"
                        placeholder="Tên ô đỗ..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => deleteSlot(slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
