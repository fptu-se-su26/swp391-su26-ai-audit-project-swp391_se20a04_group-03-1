"use client";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoStream } from "@/components/ui/video-stream";
import { CustomSelect } from "@/components/CustomSelect";
import {
  Plus,
  CheckCircle,
  Trash2,
  Edit2,
  Loader2,
  Save,
  X,
  Search,
  Calendar,
  Eye,
  LogOut,
  Camera,
  Activity,
  History,
} from "lucide-react";
import JustValidate from "just-validate";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
import toast from "react-hot-toast";

interface Gate {
  _id: string;
  name: string;
  cameraIp: string;
  type: string;
}

export default function GatePage() {
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showCreateGate, setShowCreateGate] = useState(false);
  const [createType, setCreateType] = useState("in");

  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingGate, setEditingGate] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    cameraIp: "",
    type: "in",
  });

  const [activeIn, setActiveIn] = useState(0);
  const [activeOut, setActiveOut] = useState(0);
  const [gateLogs, setGateLogs] = useState<any[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const statusFilterRef = useRef(statusFilter);
  useEffect(() => {
    statusFilterRef.current = statusFilter;
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, statusFilter, startDate, endDate]);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:4000";
    const socket = io(socketUrl);

    socket.on("gate_scan_update", (data) => {
      setActiveIn(data.activeCount);
      setActiveOut(data.completedCount);
      setGateLogs((prev) => {
        const currentFilter = statusFilterRef.current;
        const existsIndex = prev.findIndex((log) => log._id === data._id);

        if (existsIndex >= 0) {
          if (currentFilter === "in" && data.status === "out") {
            const newLogs = [...prev];
            newLogs.splice(existsIndex, 1);
            return newLogs;
          }
          const newLogs = [...prev];
          newLogs[existsIndex] = { ...prev[existsIndex], ...data };
          return newLogs;
        }

        if (currentFilter === "ALL" || currentFilter === data.status) {
          return [data, ...prev].slice(0, 50);
        }
        return prev;
      });
    });

    socket.on("gate_scan_error", (data) => {
      toast.error(`Lỗi quét biển số [${data.plate}]: ${data.message}`, {
        id: "scan-error",
      });
    });

    socket.on("gate_scan_success", (data) => {
      toast.success(`[${data.plate}]: ${data.message}`, { id: "scan-success" });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearchQuery) params.append("search", debouncedSearchQuery);
      if (statusFilter && statusFilter !== "ALL")
        params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      params.append("page", currentPage.toString());
      params.append("limit", ITEMS_PER_PAGE.toString());

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scan/logs/paginated?${params.toString()}`,
        { credentials: "include" },
      );
      const data = await res.json();
      if (data.code === "success") {
        if (data.stats) {
          setActiveIn(data.stats.activeCount);
          setActiveOut(data.stats.completedCount);
        }
        setGateLogs(data.data || []);
        if (data.pagination) setTotalPages(data.pagination.totalPages);
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

  useEffect(() => {
    fetchGates();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [debouncedSearchQuery, statusFilter, startDate, endDate, currentPage]);

  const handleSoftDeleteLog = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scan/logs/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã xóa nhật ký vào thùng rác.", { id: loadingToast });
        fetchLogs();
      } else {
        throw new Error(data.message || "Lỗi xóa nhật ký");
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleManualCheckout = async (id: string) => {
    const loadingToast = toast.loading("Đang check-out...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/scan/logs/${id}/checkout`,
        {
          method: "PATCH",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.code === "success") {
        toast.success("Đã check-out thủ công thành công.", {
          id: loadingToast,
        });
        fetchLogs();
      } else {
        throw new Error(data.message || "Lỗi check-out thủ công");
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleDeleteGate = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa camera cổng...");
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
        toast.success("Đã xóa camera cổng.", { id: loadingToast });
        fetchGates();
      } else {
        throw new Error(data.message || "Lỗi khi xóa");
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleEditClick = (gate: Gate) => {
    setEditingGate(gate._id);
    setEditForm({
      name: gate.name,
      cameraIp: gate.cameraIp,
      type: gate.type || "in",
    });
  };

  const handleUpdateGate = async (id: string) => {
    const loadingToast = toast.loading("Đang cập nhật camera...");
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
        toast.success("Cập nhật camera thành công.", { id: loadingToast });
        setEditingGate(null);
        fetchGates();
      } else {
        throw new Error(data.message || "Có lỗi xảy ra khi cập nhật");
      }
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  // Create Gate Form Validator
  const createFormRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  useEffect(() => {
    if (!showCreateGate || !createFormRef.current) {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
      return;
    }

    const validator = new JustValidate(createFormRef.current, {
      errorFieldCssClass:
        "border-[#f3727f] focus:ring-[#f3727f] focus:border-[#f3727f]",
      errorLabelCssClass:
        "text-[#f3727f] text-[12px] font-bold uppercase tracking-wider mt-1 block",
    });

    validatorRef.current = validator;

    validator
      .addField("#name", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .addField("#cameraIp", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .addField("#type", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(createFormRef.current!);
        const payload = {
          name: formData.get("name")?.toString().trim(),
          cameraIp: formData.get("cameraIp")?.toString().trim(),
          type: formData.get("type")?.toString(),
        };

        const loadingToast = toast.loading("Đang lưu camera cổng...");
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/gates/create`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );
          const result = await res.json();
          if (result.code !== "success") {
            throw new Error(result.message || "Lỗi khi tạo camera cổng.");
          }
          toast.success("Tạo camera cổng thành công!", { id: loadingToast });
          setShowCreateGate(false);
          fetchGates();
        } catch (err: any) {
          toast.error(err.message, { id: loadingToast });
        }
      });

    return () => {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
    };
  }, [showCreateGate]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Quản lý Hệ Thống Cổng
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Giám sát camera AI và quản lý xe ra vào
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setShowCheckIn(!showCheckIn)}
            variant="outline"
            className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#1ed760] dark:hover:border-[#1ed760] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
          >
            <Activity className="h-4 w-4" />
            Check-in thủ công
          </Button>
          <Button
            onClick={() => setShowCreateGate(!showCreateGate)}
            className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 gap-2 border-none transition-all duration-200"
          >
            <Camera className="h-5 w-5" />
            Thêm Camera
          </Button>
          <Link href="/admin/gate/trash">
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#f3727f] dark:hover:border-[#f3727f] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <Trash2 className="h-4 w-4 text-[#f3727f]" />
              Thùng rác Cổng
            </Button>
          </Link>
        </div>
      </div>

      {/* Manual Check-in Form Overlay */}
      {showCheckIn && (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Check-in xe thủ công
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Biển số xe
                  </Label>
                  <Input
                    placeholder="VN-001"
                    className="uppercase bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Tên tài xế
                  </Label>
                  <Input
                    placeholder="Nguyễn A"
                    className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Số booking
                  </Label>
                  <Input
                    placeholder="BK-001"
                    className="uppercase bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Mã container
                  </Label>
                  <Input
                    placeholder="CNT-001"
                    className="uppercase bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCheckIn(false)}
                  variant="outline"
                  className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-8"
                >
                  Hủy
                </Button>
                <Button
                  type="button"
                  className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] px-8 rounded-[500px]"
                >
                  Xác nhận
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Create Gate Form */}
      {showCreateGate && (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Thêm camera cổng
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form ref={createFormRef} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Tên camera cổng
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Camera Cổng A - Vào"
                    className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="cameraIp"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    RTSP / IP Camera
                  </Label>
                  <Input
                    id="cameraIp"
                    name="cameraIp"
                    placeholder="rtsp://192.168.1.100/stream"
                    className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="type"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Loại cổng
                  </Label>
                  <CustomSelect
                    id="type"
                    name="type"
                    value={createType}
                    onChange={setCreateType}
                    options={[
                      { value: "in", label: "Cổng Vào (IN)" },
                      { value: "out", label: "Cổng Ra (OUT)" },
                    ]}
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateGate(false)}
                  variant="outline"
                  className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-8"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] px-8 rounded-[500px]"
                >
                  Lưu hệ thống
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Video Streaming Section */}
      <div>
        <h2 className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider mb-6">
          Camera Giám Sát
        </h2>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-[#ffffff] dark:bg-[#181818] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727]">
            <Loader2 className="h-10 w-10 animate-spin text-[#1ed760] mb-4" />
            <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">
              Đang kết nối camera...
            </p>
          </div>
        ) : gates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-[#ffffff] dark:bg-[#181818] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727]">
            <Camera className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4" />
            <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px] mb-6">
              Hệ thống chưa có camera nào.
            </p>
            <Button
              onClick={() => setShowCreateGate(true)}
              className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 border-none"
            >
              Thiết lập Camera
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {gates.map((gate) => (
              <Card
                key={gate._id}
                className="overflow-hidden bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#00754A] transition-colors group"
              >
                {editingGate === gate._id ? (
                  <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-[12px] font-bold uppercase tracking-wider text-[#121212] dark:text-[#ffffff] mb-2 block">
                          Tên Cổng
                        </label>
                        <Input
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-bold uppercase tracking-wider text-[#121212] dark:text-[#ffffff] mb-2 block">
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
                          className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[12px] font-bold uppercase tracking-wider text-[#121212] dark:text-[#ffffff] mb-2 block">
                          Loại Cổng
                        </label>
                        <CustomSelect
                          value={editForm.type}
                          onChange={(val) =>
                            setEditForm({ ...editForm, type: val })
                          }
                          options={[
                            { value: "in", label: "Cổng Vào (IN)" },
                            { value: "out", label: "Cổng Ra (OUT)" },
                          ]}
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          onClick={() => handleUpdateGate(gate._id)}
                          className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-bold uppercase tracking-wider px-6 h-9"
                        >
                          Lưu
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingGate(null)}
                          className="rounded-[500px] font-bold uppercase tracking-wider px-6 h-9 bg-transparent border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727]"
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                ) : (
                  <CardHeader className="bg-[#ffffff] dark:bg-[#181818] border-b border-[#e5e5e5] dark:border-[#272727] p-4 flex flex-row items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
                          {gate.name}
                        </CardTitle>
                        {gate.type === "in" ? (
                          <span className="px-2 py-1 rounded-[4px] text-[10px] font-black bg-[#1ed760]/10 text-[#1db954] uppercase tracking-wider border border-[#1ed760]/20">
                            Cổng Vào
                          </span>
                        ) : gate.type === "out" ? (
                          <span className="px-2 py-1 rounded-[4px] text-[10px] font-black bg-[#3b82f6]/10 text-[#3b82f6] uppercase tracking-wider border border-[#3b82f6]/20">
                            Cổng Ra
                          </span>
                        ) : null}
                      </div>
                      <CardDescription className="font-bold text-[12px] mt-1 text-[#666666] dark:text-[#999999]">
                        {gate.cameraIp}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(gate)}
                        className="h-8 w-8 p-0 text-[#121212] dark:text-[#ffffff] hover:bg-[#eeeeee] dark:hover:bg-[#272727] rounded-[500px]"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-[#f3727f] hover:bg-[#f3727f]/10 rounded-[500px]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff]">
                              Xóa camera cổng?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                              Bạn có chắc chắn muốn xóa camera{" "}
                              <strong className="text-[#121212] dark:text-[#ffffff]">
                                {gate.name}
                              </strong>
                              ? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider">
                              Hủy
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteGate(gate._id)}
                              className="bg-[#f3727f] hover:bg-[#d85663] text-white rounded-[500px] font-black uppercase tracking-wider border-none"
                            >
                              Xóa
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardHeader>
                )}
                <CardContent className="p-4 bg-[#f8f8f8] dark:bg-[#121212]">
                  <VideoStream
                    title={gate.name}
                    cameraId={gate._id.substring(0, 8).toUpperCase()}
                    streamUrl={`${process.env.NEXT_PUBLIC_CV_URL || "http://localhost:5001"}/video_feed?rtsp_url=${encodeURIComponent(gate.cameraIp)}`}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Active Vehicles Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm border-l-[6px] border-l-[#1ed760]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[12px] text-[#666666] dark:text-[#999999] font-black uppercase tracking-[2px]">
              Xe đã vào
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <p className="text-[48px] leading-none font-black text-[#121212] dark:text-[#ffffff]">
                {activeIn}
              </p>
              <p className="text-[14px] text-[#666666] dark:text-[#999999] font-bold mb-2 uppercase tracking-wider">
                hiện tại
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm border-l-[6px] border-l-[#3b82f6]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[12px] text-[#666666] dark:text-[#999999] font-black uppercase tracking-[2px]">
              Xe đã ra
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <p className="text-[48px] leading-none font-black text-[#121212] dark:text-[#ffffff]">
                {activeOut}
              </p>
              <p className="text-[14px] text-[#666666] dark:text-[#999999] font-bold mb-2 uppercase tracking-wider">
                hôm nay
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm border-l-[6px] border-l-[#f59e0b]">
          <CardHeader className="pb-2">
            <CardTitle className="text-[12px] text-[#666666] dark:text-[#999999] font-black uppercase tracking-[2px]">
              Xe đang chờ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <p className="text-[48px] leading-none font-black text-[#121212] dark:text-[#ffffff]">
                0
              </p>
              <p className="text-[14px] text-[#666666] dark:text-[#999999] font-bold mb-2 uppercase tracking-wider">
                tại cổng
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gate Log Table */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-visible">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider flex items-center gap-2">
              <History className="w-6 h-6 text-[#1db954]" /> Nhật ký cổng
            </CardTitle>
            <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px] mt-1">
              Lịch sử quét xe ra vào tại các cổng
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
              <Input
                placeholder="Tìm biển số..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
              />
            </div>

            <div className="relative z-10 w-[200px]">
              <CustomSelect
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "ALL", label: "Tất cả trạng thái" },
                  { value: "in", label: "Đã vào" },
                  { value: "out", label: "Đã ra" },
                ]}
              />
            </div>

            <div className="flex items-center gap-2 bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[500px] h-10 px-4 hover:border-[#00754A] dark:hover:border-[#00754A] transition-colors focus-within:border-[#00754A] focus-within:ring-1 focus-within:ring-[#00754A]">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onClick={(e) => (e.target as any).showPicker?.()}
                className="bg-transparent text-[14px] font-bold text-[#121212] dark:text-[#ffffff] focus:outline-none dark:[color-scheme:dark] cursor-pointer"
              />
              <span className="text-[#999999]">-</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onClick={(e) => (e.target as any).showPicker?.()}
                className="bg-transparent text-[14px] font-bold text-[#121212] dark:text-[#ffffff] focus:outline-none dark:[color-scheme:dark] cursor-pointer"
              />
            </div>

            <Link href="/admin/gate/logs/trash">
              <Button
                variant="outline"
                className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:border-[#f3727f] rounded-[500px] font-bold uppercase tracking-wider h-10 px-4 gap-2"
              >
                <Trash2 className="h-4 w-4 text-[#f3727f]" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                <tr>
                  <th className="px-6 py-4 font-black">Biển số</th>
                  <th className="px-6 py-4 font-black">Tài xế</th>
                  <th className="px-6 py-4 font-black">Container</th>
                  <th className="px-6 py-4 font-black">Giờ lưu</th>
                  <th className="px-6 py-4 font-black">Trạng thái</th>
                  <th className="px-6 py-4 font-black text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                {gateLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-20 text-[#666666] dark:text-[#999999] font-bold text-[14px]"
                    >
                      Không có dữ liệu nhật ký
                    </td>
                  </tr>
                ) : (
                  gateLogs.map((item) => (
                    <tr
                      key={item._id}
                      className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group"
                    >
                      <td className="px-6 py-4 font-black text-[#121212] dark:text-[#ffffff]">
                        {item.actualTruckPlate}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                        {item.appointmentId?.driverId?.driverName || "-"}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {item.actualContainerNo || "-"}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {new Date(
                          item.status === "in"
                            ? item.checkInTime
                            : item.checkOutTime,
                        ).toLocaleString("vi-VN")}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-[10px] font-black uppercase tracking-wider border ${item.status === "in" ? "bg-[#1ed760]/10 text-[#1db954] border-[#1ed760]/20" : "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20"}`}
                        >
                          <CheckCircle className="h-3 w-3" />
                          {item.status === "in" ? "Đã vào" : "Đã ra"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/gate/logs/${item._id}`}>
                            <Button
                              variant="ghost"
                              className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#1ed760] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                              title="Chi tiết"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          {item.status === "in" && (
                            <Button
                              onClick={() => handleManualCheckout(item._id)}
                              className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#f59e0b] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                              title="Checkout"
                            >
                              <LogOut className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#f3727f] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors"
                                title="Xóa"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff]">
                                  Xóa nhật ký?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                                  Nhật ký của xe{" "}
                                  <strong className="text-[#121212] dark:text-[#ffffff]">
                                    {item.actualTruckPlate}
                                  </strong>{" "}
                                  sẽ bị đưa vào thùng rác.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider">
                                  Hủy
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleSoftDeleteLog(item._id)}
                                  className="bg-[#f3727f] hover:bg-[#d85663] text-white rounded-[500px] font-black uppercase tracking-wider border-none"
                                >
                                  Đồng ý
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-4 border-t border-[#e5e5e5] dark:border-[#272727] flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className={`rounded-[500px] font-bold ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727]"}`}
                    />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setCurrentPage(i + 1)}
                        isActive={currentPage === i + 1}
                        className={`rounded-[500px] font-bold cursor-pointer ${currentPage === i + 1 ? "bg-[#1ed760] text-[#121212] border-none hover:bg-[#1db954]" : "text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727]"}`}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className={`rounded-[500px] font-bold ${currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727]"}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
