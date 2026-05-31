"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoStream } from "@/components/ui/video-stream";
import {
  Plus,
  CheckCircle,
  Trash2,
  Edit2,
  Loader2,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Gate {
  _id: string;
  name: string;
  cameraIp: string;
  type: string;
}

const gateData = [
  {
    id: 1,
    plate: "XE-001",
    driver: "Nguyễn A",
    container: "CNT-001",
    checkInTime: "08:15",
    status: "Đã vào",
    action: "Check-out",
  },
  {
    id: 2,
    plate: "XE-002",
    driver: "Trần B",
    container: "CNT-002",
    checkInTime: "08:30",
    status: "Đã vào",
    action: "Check-out",
  },
  {
    id: 3,
    plate: "XE-003",
    driver: "Lê C",
    container: "CNT-003",
    checkInTime: "09:00",
    status: "Đã vào",
    action: "Check-out",
  },
];

export default function GatePage() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGate, setEditingGate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    cameraIp: "",
    type: "in",
  });
  
  const [activeIn, setActiveIn] = useState(0);
  const [activeOut, setActiveOut] = useState(0);
  const [gateLogs, setGateLogs] = useState<any[]>([]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "http://localhost:4000";
    const socket = io(socketUrl);
    
    socket.on("gate_scan_update", (data) => {
      setActiveIn(data.activeCount);
      setActiveOut(data.completedCount);
      setGateLogs((prev) => [{ ...data, id: Date.now() + Math.random() }, ...prev].slice(0, 50));
    });

    socket.on("gate_scan_error", (data) => {
      setError(`Lỗi quét biển số [${data.plate}]: ${data.message}`);
      // Tự động tắt thông báo lỗi sau 10 giây
      setTimeout(() => {
        setError(null);
      }, 10000);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchGates();
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace("/api", "") : "http://localhost:4000";
      const res = await fetch(`${apiUrl}/api/gate/logs`);
      const data = await res.json();
      if (data.code === "success") {
        setActiveIn(data.data.activeCount);
        setActiveOut(data.data.completedCount);
        setGateLogs(data.data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    }
  };

  const fetchGates = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gates`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        setGates(data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch gates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGate = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gates/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.code === "success") {
        fetchGates();
      }
    } catch (err) {
      console.error("Failed to delete gate:", err);
    }
  };

  const handleEditClick = (gate: Gate) => {
    setEditingGate(gate._id);
    setError(null);
    setEditForm({
      name: gate.name,
      cameraIp: gate.cameraIp,
      type: gate.type || "in",
    });
  };

  const handleUpdateGate = async (id: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gates/${id}/info`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editForm),
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.code === "success") {
        setEditingGate(null);
        setError(null);
        fetchGates();
      } else {
        setError(data.message || "Có lỗi xảy ra khi cập nhật");
      }
    } catch (err: any) {
      console.error("Failed to update gate:", err);
      setError(err.message || "Đã xảy ra lỗi khi cập nhật dữ liệu.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Quản lý cổng
          </h1>
          <p className="text-muted-foreground">
            Quản lý check-in/check-out xe và hệ thống camera
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCheckIn(!showCheckIn)}
            variant="outline"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Check-in thủ công
          </Button>
          <Link href="/admin/gate/create">
            <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md">
              <Plus className="h-4 w-4" />
              Tạo Camera Cổng
            </Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg dark:bg-red-900/10 dark:text-red-400 border border-red-200/50">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Check-in Form */}
      {showCheckIn && (
        <Card className="border-blue-100 shadow-md bg-blue-50/30">
          <CardHeader>
            <CardTitle>Check-in xe</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Biển số xe</label>
                  <Input placeholder="VN-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên tài xế</label>
                  <Input placeholder="Nguyễn A" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Số booking</label>
                  <Input placeholder="BK-001" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mã container</label>
                  <Input placeholder="CNT-001" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="button" className="bg-blue-600 hover:bg-blue-700">
                  Xác nhận
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCheckIn(false)}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Video Streaming Section */}
      <div>
        <h2 className="text-xl font-bold mb-4">Hệ thống Camera Giám Sát</h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-card rounded-xl shadow-sm border border-border">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
            <p>Đang tải danh sách camera cổng...</p>
          </div>
        ) : gates.length === 0 ? (
          <Card className="border-dashed border-2 shadow-none bg-muted/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="mb-4">Chưa có camera cổng nào được tạo.</p>
              <Link href="/admin/gate/create">
                <Button variant="outline">Tạo camera đầu tiên</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gates.map((gate) => (
              <Card
                key={gate._id}
                className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border-slate-200"
              >
                {editingGate === gate._id ? (
                  <CardHeader className="bg-muted/30 border-b border-border pb-4">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                          Tên Cổng
                        </label>
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                          RTSP / IP Camera
                        </label>
                        <Input
                          value={editForm.cameraIp}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              cameraIp: e.target.value,
                            })
                          }
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground mb-1 block">
                          Loại Cổng
                        </label>
                        <select
                          value={editForm.type}
                          onChange={(e) =>
                            setEditForm({ ...editForm, type: e.target.value })
                          }
                          className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="in">Cổng Vào (IN)</option>
                          <option value="out">Cổng Ra (OUT)</option>
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateGate(gate._id)}
                          className="bg-blue-600 hover:bg-blue-700 h-8"
                        >
                          <Save className="h-3.5 w-3.5 mr-1" /> Lưu
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingGate(null)}
                          className="h-8"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Hủy
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                ) : (
                  <CardHeader className="pb-3 pt-4 flex flex-row items-start justify-between border-b border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg font-bold">
                          {gate.name}
                        </CardTitle>
                        {gate.type === "in" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider border border-green-200">
                            Cổng Vào
                          </span>
                        ) : gate.type === "out" ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider border border-blue-200">
                            Cổng Ra
                          </span>
                        ) : null}
                      </div>
                      <CardDescription className="font-mono text-xs mt-1.5 text-muted-foreground bg-muted px-2 py-0.5 rounded inline-block">
                        {gate.cameraIp}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(gate)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Xóa camera cổng?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc chắn muốn xóa camera{" "}
                              <strong>{gate.name}</strong>? Hành động này không
                              thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteGate(gate._id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                )}
                <CardContent className="p-0">
                  <div className="p-2 bg-muted/50">
                    <VideoStream
                      title={gate.name}
                      cameraId={gate._id.substring(0, 8).toUpperCase()}
                      streamUrl={`http://localhost:5001/video_feed?rtsp_url=${encodeURIComponent(gate.cameraIp)}`}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Active Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
        <Card className="shadow-sm border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
              Xe đã vào
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold">{activeIn}</p>
              <p className="text-sm text-muted-foreground mb-1">hiện tại</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
              Xe đã ra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold">{activeOut}</p>
              <p className="text-sm text-muted-foreground mb-1">hôm nay</p>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-semibold uppercase tracking-wider">
              Xe đang chờ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-bold">6</p>
              <p className="text-sm text-muted-foreground mb-1">tại cổng</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gate Log */}
      <Card className="shadow-sm">
        <CardHeader className="border-b border-border bg-muted/20">
          <CardTitle>Nhật ký cổng</CardTitle>
          <CardDescription>
            Lịch check-in/check-out xe trong ngày
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Biển số
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Tài xế
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Container
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Giờ vào
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-muted-foreground">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {gateLogs.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-border hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold">{item.plate}</td>
                    <td className="py-3 px-4">{item.driverName || "-"}</td>
                    <td className="py-3 px-4">{item.containerNo || "-"}</td>
                    <td className="py-3 px-4 font-mono">{new Date(item.time).toLocaleTimeString()}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'in' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        <CheckCircle className="h-3.5 w-3.5" />
                        {item.status === "in" ? "Đã vào" : "Đã ra"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs font-semibold hover:bg-slate-100"
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
