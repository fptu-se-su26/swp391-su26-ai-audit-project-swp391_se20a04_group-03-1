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
  Video
} from "lucide-react";
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
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Yard {
  _id: string;
  name: string;
  cameraIp: string;
  slots: any[];
  snapshotUrl?: string;
  isDeleted: boolean;
}

export default function TrashYardsPage() {
  const [yards, setYards] = useState<Yard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchYards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yards/trash/list`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data && data.code === "error") {
        throw new Error(data.message || "Lỗi từ máy chủ backend.");
      }

      setYards(data.data || []);
    } catch (err: any) {
      toast.error(err.message || "Đã xảy ra lỗi khi tải danh sách thùng rác.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchYards();
  }, [fetchYards]);

  const handleRestoreYard = async (id: string) => {
    const loadingToast = toast.loading("Đang khôi phục...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yards/${id}/restore`, {
        method: "PATCH",
        credentials: "include",
      });

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi khôi phục bãi đỗ.");
      }

      toast.success("Khôi phục bãi đỗ thành công.", { id: loadingToast });
      fetchYards();
    } catch (err: any) {
      toast.error(err.message || "Không thể khôi phục bãi đỗ.", { id: loadingToast });
    }
  };

  const handleHardDeleteYard = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa vĩnh viễn...");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yards/${id}/force`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi xóa vĩnh viễn.");
      }

      toast.success("Đã xóa vĩnh viễn bãi đỗ.", { id: loadingToast });
      fetchYards();
    } catch (err: any) {
      toast.error(err.message || "Không thể xóa vĩnh viễn bãi đỗ.", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/yard">
            <Button
              variant="outline"
              size="icon"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-full"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight">
              Thùng rác Bãi đỗ
            </h1>
            <p className="text-[#f3727f] font-bold mt-1 uppercase tracking-wider text-[12px]">
              Các bãi đỗ đã bị xóa
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#ffffff] dark:bg-[#181818] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727]">
          <Loader2 className="h-10 w-10 animate-spin text-[#1ed760] mb-4" />
          <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">Đang tải dữ liệu...</p>
        </div>
      ) : yards.length === 0 ? (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-[#666666] dark:text-[#b3b3b3]">
            <Trash2 className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4" />
            <p className="font-bold text-[14px]">Thùng rác trống.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yards.map((yard) => (
            <Card key={yard._id} className="overflow-hidden bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm opacity-75 grayscale hover:grayscale-0 transition-all duration-200">
              <div className="relative h-40 bg-[#f8f8f8] dark:bg-[#121212]">
                <img
                  src={yard.snapshotUrl || 'https://placehold.co/600x400/png?text=No+Camera'}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/png?text=No+Camera';
                  }}
                  alt={yard.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3 bg-[#121212]/80 text-[#ffffff] font-bold text-[10px] px-3 py-1.5 rounded-[4px] uppercase tracking-wider backdrop-blur-sm">
                  {yard.slots?.length || 0} ô đỗ
                </div>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider truncate">
                  {yard.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-2 font-bold text-[#666666] dark:text-[#999999] truncate text-[12px]">
                  <Video className="h-4 w-4 shrink-0" />
                  {yard.cameraIp}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex gap-2 justify-end bg-[#f8f8f8] dark:bg-[#121212] border-t border-[#e5e5e5] dark:border-[#272727]">
                <Button
                  onClick={() => handleRestoreYard(yard._id)}
                  variant="outline"
                  className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#1ed760] hover:border-[#1ed760] hover:text-[#121212] rounded-[500px] font-bold text-[12px] uppercase tracking-wider h-9 px-4 transition-all duration-200 flex-1"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Khôi phục
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f3727f] hover:border-[#f3727f] hover:text-[#ffffff] rounded-[500px] font-bold text-[12px] uppercase tracking-wider h-9 px-4 transition-all duration-200 flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa vĩnh viễn
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase">
                        Xác nhận xóa vĩnh viễn
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
                        Bạn có chắc chắn muốn xóa vĩnh viễn bãi đỗ <span className="text-[#121212] dark:text-[#ffffff]">{yard.name}</span>? Dữ liệu sẽ không thể khôi phục.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3">
                      <AlertDialogCancel className="bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6">
                        Hủy
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleHardDeleteYard(yard._id)}
                        className="bg-[#f3727f] hover:bg-[#d95b66] text-[#ffffff] font-black uppercase tracking-wider px-6 rounded-[500px] border-none"
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
