"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Video, Settings, AlertCircle, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
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
  snapshotUrl: string;
  slots: any[];
}

export default function YardPage() {
  const [yards, setYards] = useState<Yard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchYards();
  }, []);

  const fetchYards = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yards`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "error") throw new Error(data.message);
      setYards(data.data || []);
    } catch (err: any) {
      setError(err.message || "Không thể tải danh sách bãi đỗ.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYard = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/yards/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "error") throw new Error(data.message);
      
      fetchYards();
    } catch (err: any) {
      setError(err.message || "Lỗi khi xóa bãi đỗ.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Quản lý Bãi đỗ xe
          </h1>
          <p className="text-slate-600">
            Quản lý các bãi đỗ, kết nối Camera và cấu hình ô đỗ xe thông minh.
          </p>
        </div>
        <Link href="/admin/yard/create">
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md transition-all duration-200">
            <Plus className="h-4 w-4" />
            Tạo bãi đỗ mới
          </Button>
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200/50">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
          <p>Đang tải danh sách bãi đỗ...</p>
        </div>
      ) : yards.length === 0 ? (
        <Card className="border-dashed border-2 shadow-none bg-slate-50/50">
          <CardContent className="flex flex-col items-center justify-center py-12 text-slate-500">
            <Video className="h-12 w-12 text-slate-300 mb-2" />
            <p>Chưa có bãi đỗ nào được tạo.</p>
            <Link href="/admin/yard/create" className="mt-4">
              <Button variant="outline">Tạo bãi đỗ đầu tiên</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yards.map((yard) => (
            <Card
              key={yard._id}
              className="overflow-hidden hover:shadow-lg transition-shadow border-slate-200"
            >
              <div className="relative h-48 bg-slate-100">
                <img
                  src={`${process.env.NEXT_PUBLIC_CV_URL || 'http://localhost:5001'}/snapshot?rtsp_url=${encodeURIComponent(yard.cameraIp)}`}
                  onError={(e) => {
                    e.currentTarget.src = yard.snapshotUrl || 'https://placehold.co/600x400/png?text=No+Camera';
                  }}
                  alt={yard.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {yard.slots?.length || 0} ô đỗ
                </div>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">
                  <Link
                    href={`/admin/yard/${yard._id}`}
                    className="hover:text-blue-600 transition-colors"
                  >
                    {yard.name}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-1">
                  <Video className="h-3.5 w-3.5" />
                  {yard.cameraIp}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex justify-end gap-2">
                <Link href={`/admin/yard/${yard._id}`}>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2  text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    Xem chi tiết
                  </Button>
                </Link>
                <Link href={`/admin/yard/${yard._id}/config`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    <Settings className="h-4 w-4" />
                    Cấu hình
                  </Button>
                </Link>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Hành động này sẽ xóa bãi đỗ <strong>{yard.name}</strong>. Dữ liệu không thể khôi phục sau khi xóa.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteYard(yard._id)} className="bg-red-600 hover:bg-red-700">
                        Xác nhận xóa
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
