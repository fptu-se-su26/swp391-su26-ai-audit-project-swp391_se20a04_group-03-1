"use client";

import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Loader2,
  Video,
  Car,
  Clock,
  Box,
  LayoutGrid,
  Settings,
  Save,
  X,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { VideoStream } from "@/components/ui/video-stream";

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

  const [occupiedSlotNames, setOccupiedSlotNames] = useState<string[]>([]);
  const [activities, setActivities] = useState<MockActivity[]>([]);

  // Edit info states
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editName, setEditName] = useState("");
  const [editCameraIp, setEditCameraIp] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      setEditName(yardData.name);
      setEditCameraIp(yardData.cameraIp);
    } catch (err: any) {
      toast.error(err.message || "Không tải được dữ liệu bãi đỗ");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading("Đang lưu thông tin...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yards/${id}/info`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, cameraIp: editCameraIp }),
        credentials: "include"
      });
      const data = await res.json();
      if (data.code === "success") {
        setYard(data.data);
        setIsEditingInfo(false);
        toast.success("Đã lưu thông tin bãi đỗ", { id: loadingToast });
      } else {
        toast.error(data.message || "Lỗi lưu thông tin", { id: loadingToast });
      }
    } catch (err: any) {
      toast.error("Lỗi lưu thông tin", { id: loadingToast });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:4000";
    const socket: Socket = io(backendUrl);

    socket.on("connect", () => {
      socket.emit("join_yard", id);
    });

    socket.on("yard_status_updated", (data: any) => {
      const newOccupiedSlots: string[] = data.occupied_slots;
      const timestamp: string = data.timestamp;

      setOccupiedSlotNames((prevOccupied) => {
        const newActivities: MockActivity[] = [];

        const enteredSlots = newOccupiedSlots.filter(
          (slot) => !prevOccupied.includes(slot),
        );
        enteredSlots.forEach((slot) => {
          newActivities.push({
            id: `act-in-${Date.now()}-${slot}`,
            truckPlate: "Xe vô danh",
            containerNo: "-",
            slotName: slot,
            timeIn: new Date(timestamp).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "In",
          });
        });

        const leftSlots = prevOccupied.filter(
          (slot) => !newOccupiedSlots.includes(slot),
        );
        leftSlots.forEach((slot) => {
          newActivities.push({
            id: `act-out-${Date.now()}-${slot}`,
            truckPlate: "Xe vừa rời đi",
            containerNo: "-",
            slotName: slot,
            timeIn: new Date().toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            status: "Out",
          });
        });

        if (newActivities.length > 0) {
          setActivities((prevActivities) => {
            return [...newActivities, ...prevActivities].slice(0, 50);
          });
        }

        return newOccupiedSlots;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

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

  const totalSlots = yard.slots?.length || 0;
  const occupiedSlotsCount = occupiedSlotNames.length;
  const emptySlotsCount = totalSlots - occupiedSlotsCount;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 w-full max-w-3xl">
          <Link href="/admin/yard">
            <Button
              variant="outline"
              size="icon"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-full shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          {isEditingInfo ? (
            <div className="space-y-3 flex-1">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Tên bãi đỗ..."
                className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
              />
              <Input
                value={editCameraIp}
                onChange={(e) => setEditCameraIp(e.target.value)}
                placeholder="RTSP Camera URL..."
                className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
              />
            </div>
          ) : (
            <div>
              <h1 className="text-[24px] md:text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
                {yard.name}
              </h1>
              <p className="text-[#666666] dark:text-[#999999] font-bold mt-1 flex items-center gap-1.5 break-all text-[12px] uppercase tracking-wider">
                <Video className="h-3.5 w-3.5 shrink-0 text-[#1ed760]" />
                Live: {yard.cameraIp}
              </p>
            </div>
          )}
        </div>

        <div>
          {isEditingInfo ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingInfo(false);
                  setEditName(yard.name);
                  setEditCameraIp(yard.cameraIp);
                }}
                className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6"
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveInfo}
                disabled={isSaving}
                className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-wider px-6 rounded-[500px]"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Lưu
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditingInfo(true)}
              className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6 gap-2"
            >
              <Settings className="h-4 w-4" />
              Cấu hình
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm flex items-center p-6 gap-4 border-l-4 border-l-[#00754A]">
          <div className="h-12 w-12 bg-[#f8f8f8] dark:bg-[#121212] rounded-full flex items-center justify-center border border-[#e5e5e5] dark:border-[#272727]">
            <LayoutGrid className="h-5 w-5 text-[#00754A]" />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">
              Tổng số ô đỗ
            </p>
            <h3 className="text-2xl font-black text-[#121212] dark:text-[#ffffff]">
              {totalSlots}
            </h3>
          </div>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm flex items-center p-6 gap-4 border-l-4 border-l-[#f3727f]">
          <div className="h-12 w-12 bg-[#f8f8f8] dark:bg-[#121212] rounded-full flex items-center justify-center border border-[#e5e5e5] dark:border-[#272727]">
            <Car className="h-5 w-5 text-[#f3727f]" />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">
              Đã chiếm
            </p>
            <h3 className="text-2xl font-black text-[#121212] dark:text-[#ffffff]">
              {occupiedSlotsCount}
            </h3>
          </div>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm flex items-center p-6 gap-4 border-l-4 border-l-[#1ed760]">
          <div className="h-12 w-12 bg-[#f8f8f8] dark:bg-[#121212] rounded-full flex items-center justify-center border border-[#e5e5e5] dark:border-[#272727]">
            <Box className="h-5 w-5 text-[#1ed760]" />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">
              Còn trống
            </p>
            <h3 className="text-2xl font-black text-[#121212] dark:text-[#ffffff]">
              {emptySlotsCount}
            </h3>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Video / Snapshot View */}
        <div className="lg:col-span-2">
          <VideoStream
            title={`Live Camera (AI Detection) — ${yard?.name || ""}`}
            cameraId={String(id).substring(0, 8).toUpperCase()}
            streamUrl={`${process.env.NEXT_PUBLIC_CV_URL || "http://localhost:5001"}/yard_feed?yard_id=${id}`}
          />
        </div>

        {/* Recent Activities List */}
        <div className="lg:col-span-1">
          <Card className="h-full bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm flex flex-col overflow-hidden">
            <CardHeader className="py-6 px-6 border-b border-[#e5e5e5] dark:border-[#272727] bg-[#f8f8f8] dark:bg-[#121212]">
              <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#1ed760]" />
                Hoạt động
              </CardTitle>
              <CardDescription className="text-[12px] font-bold text-[#666666] dark:text-[#999999] uppercase tracking-wider mt-1">
                Các lượt xe ra vào bãi đỗ
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-y-auto max-h-[400px]">
              {activities.length === 0 ? (
                <div className="p-8 text-center text-[#999999] font-bold text-[14px]">
                  Chưa có hoạt động nào.
                </div>
              ) : (
                <div className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="p-4 hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-bold text-[#121212] dark:text-[#ffffff] text-[14px] uppercase tracking-wider">
                          {act.truckPlate}
                        </span>
                        <span className="text-[10px] font-bold text-[#121212] dark:text-[#ffffff] bg-[#e5e5e5] dark:bg-[#272727] px-2 py-1 rounded-[4px] uppercase tracking-wider">
                          {act.timeIn}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[12px] font-bold">
                        <span
                          className={`flex items-center gap-1.5 uppercase tracking-wider ${
                            act.status === "In"
                              ? "text-[#f3727f]"
                              : "text-[#1ed760]"
                          }`}
                        >
                          <Car className="h-3.5 w-3.5" />
                          {act.status === "In"
                            ? `Vào ô ${act.slotName}`
                            : `Rời ô ${act.slotName}`}
                        </span>
                        <span className="flex items-center gap-1.5 text-[#666666] dark:text-[#999999] uppercase tracking-wider">
                          <Box className="h-3.5 w-3.5" />
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
