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
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Video
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
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchYards = useCallback(async () => {
    setLoading(true);
    setError(null);
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
      setError(err.message || "Đã xảy ra lỗi khi tải danh sách thùng rác.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchYards();
  }, [fetchYards]);

  const handleRestoreYard = async (id: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yards/${id}/restore`, {
        method: "PATCH",
        credentials: "include",
      });

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi khôi phục bãi đỗ.");
      }

      setSuccessMsg("Khôi phục bãi đỗ thành công.");
      fetchYards();
    } catch (err: any) {
      setError(err.message || "Không thể khôi phục bãi đỗ.");
    }
  };

  const handleHardDeleteYard = async (id: string) => {
    try {
      setError(null);
      setSuccessMsg(null);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yards/${id}/force`, {
        method: "DELETE",
        credentials: "include",
      });

      const result = await res.json();
      if (!res.ok || result.code === "error") {
        throw new Error(result.message || "Lỗi khi xóa vĩnh viễn.");
      }

      setSuccessMsg("Đã xóa vĩnh viễn bãi đỗ.");
      fetchYards();
    } catch (err: any) {
      setError(err.message || "Không thể xóa vĩnh viễn bãi đỗ.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Thùng rác Bãi đỗ
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Các camera bãi đỗ đã bị xóa. Bạn có thể khôi phục hoặc xóa vĩnh viễn.
          </p>
        </div>
        <Link href="/admin/yard">
          <Button variant="outline" className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 dark:bg-red-900/10 dark:text-red-400 rounded-lg border border-red-200/50 dark:border-red-900/50">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 p-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/10 dark:text-green-400 rounded-lg border border-green-200/50 dark:border-green-900/50">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : yards.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none bg-slate-50/50 dark:bg-slate-900 dark:border-slate-800">
          <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500 dark:text-slate-400">
            <Trash2 className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-2" />
            <p>Thùng rác trống.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yards.map((yard) => (
            <Card key={yard._id} className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-sm opacity-75">
              <div className="relative h-40 bg-slate-100 dark:bg-slate-800 grayscale">
                <img
                  src={yard.snapshotUrl || 'https://placehold.co/600x400/png?text=No+Camera'}
                  onError={(e) => {
                    e.currentTarget.src = 'https://placehold.co/600x400/png?text=No+Camera';
                  }}
                  alt={yard.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {yard.slots?.length || 0} ô đỗ
                </div>
              </div>
              <CardHeader className="pb-4 bg-slate-50 dark:bg-slate-900">
                <CardTitle className="text-xl text-slate-700 dark:text-slate-200">{yard.name}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <Video className="h-3.5 w-3.5" />
                  {yard.cameraIp}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 flex gap-2 justify-end bg-white dark:bg-slate-950">
                <Button
                  onClick={() => handleRestoreYard(yard._id)}
                  variant="outline"
                  className="gap-2 flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-900/50 dark:text-blue-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Khôi phục
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="gap-2 flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 dark:hover:text-red-300">
                      <Trash2 className="h-4 w-4" />
                      Xóa vĩnh viễn
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bạn có chắc chắn muốn xóa vĩnh viễn?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Dữ liệu của bãi đỗ "{yard.name}" sẽ bị xóa vĩnh viễn khỏi hệ thống.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleHardDeleteYard(yard._id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
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
