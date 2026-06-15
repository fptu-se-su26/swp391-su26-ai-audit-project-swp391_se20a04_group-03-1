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
  Loader2,
  Camera,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface SlotRect {
  id: string; // temp id for UI
  slotName: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
}

export default function YardConfigPage() {
  const { id } = useParams();
  const router = useRouter();

  const [yard, setYard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isTakingSnapshot, setIsTakingSnapshot] = useState(false);

  const [slots, setSlots] = useState<SlotRect[]>([]);
  const [drawingRect, setDrawingRect] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [draggingNode, setDraggingNode] = useState<{
    id: string;
    pointIndex?: number;
    lastMouseX?: number;
    lastMouseY?: number;
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
          points: s.points && s.points.length === 4 ? s.points : [
             {x: s.x || 10, y: s.y || 10},
             {x: (s.x || 10) + (s.width || 20), y: s.y || 10},
             {x: (s.x || 10) + (s.width || 20), y: (s.y || 10) + (s.height || 20)},
             {x: s.x || 10, y: (s.y || 10) + (s.height || 20)}
          ],
          id: Math.random().toString(36).substr(2, 9),
        })) || [];
      setSlots(existingSlots);
    } catch (err: any) {
      toast.error(err.message || "Không thể tải cấu hình bãi đỗ.");
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



  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    if (!isDrawing && !draggingNode) return;

    const rect = containerRef.current.getBoundingClientRect();

    let currentX = ((e.clientX - rect.left) / rect.width) * 100;
    let currentY = ((e.clientY - rect.top) / rect.height) * 100;

    // Constrain to container
    currentX = Math.max(0, Math.min(100, currentX));
    currentY = Math.max(0, Math.min(100, currentY));

    if (draggingNode) {
      setSlots(
        slots.map((s) => {
          if (s.id === draggingNode.id) {
             if (draggingNode.pointIndex !== undefined) {
                 const newPoints = [...s.points!];
                 newPoints[draggingNode.pointIndex] = { x: currentX, y: currentY };
                 return { ...s, points: newPoints };
             } else {
                 const dx = currentX - draggingNode.lastMouseX!;
                 const dy = currentY - draggingNode.lastMouseY!;
                 const newPoints = s.points!.map(p => ({ x: p.x + dx, y: p.y + dy }));
                 return { ...s, points: newPoints };
             }
          }
          return s;
        })
      );
      setDraggingNode({...draggingNode, lastMouseX: currentX, lastMouseY: currentY});
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
    if (draggingNode) {
      setDraggingNode(null);
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
        x, y, width, height,
        points: [
           {x, y},
           {x: x+width, y},
           {x: x+width, y: y+height},
           {x, y: y+height}
        ]
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
    const loadingToast = toast.loading("Đang lưu cấu hình...");
    try {
      setSaving(true);
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

      toast.success("Đã lưu cấu hình ô đỗ thành công!", { id: loadingToast });
      router.push("/admin/yard");
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu cấu hình.", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const takeSnapshot = async () => {
    const loadingToast = toast.loading("Đang chụp ảnh...");
    try {
      setIsTakingSnapshot(true);
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
      toast.success("Chụp ảnh thành công!", { id: loadingToast });
    } catch (err: any) {
      toast.error(err.message || "Không thể chụp ảnh.", { id: loadingToast });
    } finally {
      setIsTakingSnapshot(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-[#ffffff] dark:bg-[#181818] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727]">
        <Loader2 className="h-10 w-10 animate-spin text-[#1ed760] mb-4" />
        <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">Đang tải dữ liệu bãi đỗ...</p>
      </div>
    );
  }

  if (!yard) {
    return <div>Không tìm thấy bãi đỗ.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/yard">
            <Button
              variant="outline"
              size="icon"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-full shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[24px] md:text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
              Cấu hình ô đỗ - {yard.name}
            </h1>
            <p className="text-[#666666] dark:text-[#999999] font-bold mt-1 flex items-center gap-1.5 text-[12px] uppercase tracking-wider">
              <LayoutDashboard className="h-3.5 w-3.5 shrink-0" />
              Kéo thả chuột trên hình ảnh để vẽ các ô đỗ xe.
            </p>
          </div>
        </div>
        <Button
          onClick={saveConfiguration}
          disabled={saving}
          className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-wider px-6 rounded-[500px]"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Lưu cấu hình
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Drawing Area */}
        <div className="xl:col-span-3">
          <Card className="h-full bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
            <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] py-4 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 text-[#121212] dark:text-[#ffffff]">
                Camera Snapshot
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={takeSnapshot}
                disabled={isTakingSnapshot || !yard.cameraIp}
                className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold text-[10px] uppercase tracking-wider h-8 px-4 transition-all duration-200"
              >
                {isTakingSnapshot ? (
                  <Loader2 className="h-3 w-3 animate-spin mr-2" />
                ) : (
                  <Camera className="h-3 w-3 mr-2" />
                )}
                Chụp ảnh mới
              </Button>
            </CardHeader>
            <CardContent className="p-0 bg-[#000000] relative aspect-video border-b border-[#e5e5e5] dark:border-[#272727]">
              <div
                ref={containerRef}
                className="relative w-full h-full overflow-hidden select-none cursor-crosshair"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <img
                  src={yard.snapshotUrl || 'https://placehold.co/1280x720/png?text=No+Camera'}
                  alt="Camera View"
                  className="block w-full h-full object-contain"
                  draggable={false}
                />

                {/* Render Existing Slots - Polygons */}
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
                  {slots.map(slot => {
                     if (!slot.points || slot.points.length < 4) return null;
                     const pts = slot.points.map(p => `${p.x},${p.y}`).join(' ');
                     return (
                        <polygon 
                           key={slot.id}
                           points={pts} 
                           fill="rgba(30, 215, 96, 0.2)" 
                           stroke="#1ed760" 
                           strokeWidth="2" 
                           vectorEffect="non-scaling-stroke"
                           className="cursor-move pointer-events-auto"
                           onMouseDown={(e) => {
                              e.stopPropagation();
                              if (!containerRef.current) return;
                              const rect = containerRef.current.getBoundingClientRect();
                              setDraggingNode({
                                id: slot.id,
                                lastMouseX: ((e.clientX - rect.left) / rect.width) * 100,
                                lastMouseY: ((e.clientY - rect.top) / rect.height) * 100,
                              });
                           }}
                        />
                     )
                  })}
                </svg>

                {/* Render Handles */}
                {slots.map(slot => slot.points?.map((p, i) => (
                  <div
                    key={`${slot.id}-${i}`}
                    className="absolute w-3 h-3 bg-white border-2 border-[#1ed760] rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, zIndex: 20 }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setDraggingNode({ id: slot.id, pointIndex: i });
                    }}
                  />
                )))}

                {/* Render Texts */}
                {slots.map(slot => {
                  if (!slot.points) return null;
                  const tx = Math.min(...slot.points.map(p => p.x));
                  const ty = Math.min(...slot.points.map(p => p.y));
                  return (
                    <div
                      key={`text-${slot.id}`}
                      className="absolute pointer-events-none"
                      style={{ left: `${tx}%`, top: `${ty}%`, transform: 'translateY(-100%)', zIndex: 10 }}
                    >
                      <span className="bg-[#121212]/80 text-[#ffffff] font-bold text-[10px] px-2 py-1 rounded-[4px] shadow-sm whitespace-nowrap uppercase tracking-wider backdrop-blur-sm">
                        {slot.slotName}
                      </span>
                    </div>
                  )
                })}

                {/* Render Drawing Rectangle */}
                {drawingRect && (
                  <div
                    className="absolute border-2 border-dashed border-[#00754A] bg-[#00754A]/20 pointer-events-none"
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
          <Card className="h-full max-h-[700px] flex flex-col bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
            <CardHeader className="py-6 px-6 border-b border-[#e5e5e5] dark:border-[#272727] bg-[#f8f8f8] dark:bg-[#121212]">
              <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-2">
                Danh sách ô đỗ ({slots.length})
              </CardTitle>
              <CardDescription className="text-[12px] font-bold text-[#666666] dark:text-[#999999] uppercase tracking-wider mt-1">
                Sửa tên hoặc xóa ô đã vẽ
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
              {slots.length === 0 ? (
                <div className="text-center py-10 text-[#999999] font-bold text-[14px]">
                  Chưa có ô đỗ nào.
                  <br /> Hãy vẽ trên hình!
                </div>
              ) : (
                slots.map((slot, index) => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-3 bg-[#f8f8f8] dark:bg-[#121212] p-3 rounded-[8px] border border-[#e5e5e5] dark:border-[#272727]"
                  >
                    <div className="flex-1">
                      <Input
                        value={slot.slotName}
                        onChange={(e) =>
                          updateSlotName(slot.id, e.target.value)
                        }
                        className="h-10 text-[12px] uppercase font-bold bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A]"
                        placeholder="Tên ô đỗ..."
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 text-[#f3727f] hover:text-[#f3727f] hover:bg-[#f3727f]/10 rounded-[8px]"
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
