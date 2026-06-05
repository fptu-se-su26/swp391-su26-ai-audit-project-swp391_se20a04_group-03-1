"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Trash2,
  RefreshCcw,
  Loader2,
  ArrowLeft,
  Video,
  Camera
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
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
  status: string;
  isDeleted: boolean;
}

export default function TrashGatesPage() {
  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gates/trash/list`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data && data.code === "error") {
        throw new Error(data.message || "Lỗi từ máy chủ backend.");
      }

      setGates(data.data || []);
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải danh sách thùng rác.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGates();
  }, [fetchGates]);

  const handleRestoreGate = async (id: string) => {
    const loadingToast = toast.loading("Đang khôi phục...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gates/${id}/restore`, {
        method: "PATCH",
        credentials: "include",
      });

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi khôi phục cổng.");
      }

      toast.success("Khôi phục cổng thành công.", { id: loadingToast });
      fetchGates();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const handleHardDeleteGate = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa vĩnh viễn...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/gates/${id}/force`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi xóa vĩnh viễn.");
      }

      toast.success("Đã xóa vĩnh viễn cổng.", { id: loadingToast });
      fetchGates();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
            Thùng rác - Camera Cổng
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Các camera cổng đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/gate">
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại hệ thống
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#ffffff] dark:bg-[#181818] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727]">
          <Loader2 className="h-10 w-10 animate-spin text-[#f3727f] mb-4" />
          <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">Đang tải dữ liệu...</p>
        </div>
      ) : gates.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-[#ffffff] dark:bg-[#181818] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727]">
          <Trash2 className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4" />
          <p className="font-bold text-[#666666] dark:text-[#b3b3b3] text-[16px] mb-2">Thùng rác camera trống.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gates.map((gate) => (
            <Card key={gate._id} className="overflow-hidden bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:border-[#f3727f] transition-colors group opacity-80 hover:opacity-100 flex flex-col">
              <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-5">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-[18px] font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider line-clamp-1">{gate.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1.5 mt-2 font-bold text-[#666666] dark:text-[#999999] text-[12px]">
                      <Video className="h-3.5 w-3.5" />
                      {gate.cameraIp}
                    </CardDescription>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wider border whitespace-nowrap ${
                      gate.type === "in"
                        ? "bg-[#1ed760]/10 text-[#1db954] border-[#1ed760]/20"
                        : "bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20"
                    }`}
                  >
                    {gate.type === "in" ? "Camera Vào" : "Camera Ra"}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-5 flex gap-3 mt-auto bg-[#ffffff] dark:bg-[#181818]">
                <Button
                  onClick={() => handleRestoreGate(gate._id)}
                  className="gap-2 flex-1 bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212] rounded-[500px] font-bold uppercase tracking-wider text-[11px] border-none transition-colors"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                  Khôi phục
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button className="gap-2 flex-1 bg-[#f3727f]/10 hover:bg-[#f3727f] text-[#f3727f] hover:text-[#121212] rounded-[500px] font-bold uppercase tracking-wider text-[11px] border-none transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                      Xóa vĩnh viễn
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff]">Bạn có chắc chắn muốn xóa vĩnh viễn?</AlertDialogTitle>
                      <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                        Hành động này không thể hoàn tác. Dữ liệu của camera cổng <strong className="text-[#121212] dark:text-[#ffffff]">{gate.name}</strong> sẽ bị xóa vĩnh viễn.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider">Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleHardDeleteGate(gate._id)}
                        className="bg-[#f3727f] hover:bg-[#d85663] text-white rounded-[500px] font-black uppercase tracking-wider border-none"
                      >
                        Xóa vĩnh viễn
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
