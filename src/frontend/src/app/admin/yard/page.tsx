"use client";

import { useEffect, useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Plus,
  Video,
  Settings,
  AlertCircle,
  Loader2,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import JustValidate from "just-validate";

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
  const [showCreateForm, setShowCreateForm] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

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
      toast.error(err.message || "Không thể tải danh sách bãi đỗ.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYard = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa bãi đỗ...");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/yards/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = await res.json();
      if (data.code === "error") throw new Error(data.message);

      toast.success("Đã xóa bãi đỗ.", { id: loadingToast });
      fetchYards();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi xóa bãi đỗ.", { id: loadingToast });
    }
  };

  useEffect(() => {
    if (!showCreateForm || !formRef.current) {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
      return;
    }

    const validator = new JustValidate(formRef.current, {
      errorFieldCssClass:
        "border-[#f3727f] focus:ring-[#f3727f] focus:border-[#f3727f]",
      errorLabelCssClass:
        "text-[#f3727f] text-[12px] font-bold uppercase tracking-wider mt-1 block",
    });

    validatorRef.current = validator;

    validator
      .addField("#name", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .addField("#cameraIp", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .onSuccess(async (event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const payload = {
          name: formData.get("name")?.toString().trim(),
          cameraIp: formData.get("cameraIp")?.toString().trim(),
        };

        const loadingToast = toast.loading("Đang lưu bãi đỗ...");
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/yards/create`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
              credentials: "include",
            },
          );
          const result = await res.json();
          if (result.code !== "success") {
            throw new Error(result.message || "Lỗi khi tạo bãi đỗ.");
          }
          toast.success("Tạo bãi đỗ thành công!", { id: loadingToast });
          setShowCreateForm(false);
          fetchYards();
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
  }, [showCreateForm]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Quản lý Bãi đỗ xe
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Quản lý các bãi đỗ, kết nối Camera và cấu hình ô đỗ xe thông minh.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 gap-2 border-none transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            Thêm Bãi đỗ
          </Button>
          <Link href="/admin/yard/trash">
            <Button
              variant="outline"
              className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:text-[#121212] dark:hover:text-[#ffffff] hover:border-[#f3727f] dark:hover:border-[#f3727f] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2"
            >
              <Trash2 className="h-4 w-4 text-[#f3727f]" />
              Thùng rác Bãi đỗ
            </Button>
          </Link>
        </div>
      </div>

      {showCreateForm && (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Thêm bãi đỗ mới
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form ref={formRef} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Tên bãi đỗ
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Ví dụ: Bãi chờ Container A"
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
                    placeholder="Ví dụ: rtsp://192.168.1.100/stream"
                    className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-8"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] font-black uppercase tracking-[1.5px] px-8 rounded-[500px]"
                >
                  Lưu
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-[#ffffff] dark:bg-[#181818] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727]">
          <Loader2 className="h-10 w-10 animate-spin text-[#1ed760] mb-4" />
          <p className="font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider text-[12px]">
            Đang tải dữ liệu...
          </p>
        </div>
      ) : yards.length === 0 ? (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-20 text-[#666666] dark:text-[#b3b3b3]">
            <Video className="h-16 w-16 text-[#e5e5e5] dark:text-[#272727] mb-4" />
            <p className="font-bold text-[14px]">
              Chưa có bãi đỗ nào được tạo.
            </p>
            <Button
              variant="outline"
              onClick={() => setShowCreateForm(true)}
              className="mt-6 bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-[500px] font-bold uppercase tracking-wider"
            >
              Tạo bãi đỗ đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {yards.map((yard) => (
            <Card
              key={yard._id}
              className="group overflow-hidden bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm hover:shadow-lg transition-all duration-200"
            >
              <div className="relative h-48 bg-[#f8f8f8] dark:bg-[#121212]">
                <img
                  src={
                    yard.snapshotUrl ||
                    "https://placehold.co/600x400/png?text=No+Camera"
                  }
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://placehold.co/600x400/png?text=No+Camera";
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
                  <Link
                    href={`/admin/yard/${yard._id}`}
                    className="hover:text-[#00754A] dark:hover:text-[#1ed760] transition-colors"
                  >
                    {yard.name}
                  </Link>
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-2 font-bold text-[#666666] dark:text-[#999999] truncate text-[12px]">
                  <Video className="h-4 w-4 shrink-0" />
                  {yard.cameraIp}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 flex justify-end gap-2 border-t border-[#e5e5e5] dark:border-[#272727] p-4 bg-[#f8f8f8] dark:bg-[#121212]">
                <Link href={`/admin/yard/${yard._id}`}>
                  <Button
                    variant="outline"
                    className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#1ed760] hover:border-[#1ed760] hover:text-[#121212] rounded-[500px] font-bold text-[12px] uppercase tracking-wider h-9 px-4 transition-all duration-200"
                  >
                    Xem chi tiết
                  </Button>
                </Link>
                <Link href={`/admin/yard/${yard._id}/config`}>
                  <Button
                    variant="outline"
                    className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#1ed760] hover:border-[#1ed760] hover:text-[#121212] rounded-[500px] font-bold text-[12px] uppercase tracking-wider h-9 px-4 transition-all duration-200 gap-2"
                  >
                    <Settings className="h-3 w-3" />
                    Cấu hình
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] hover:bg-[#f3727f] hover:border-[#f3727f] hover:text-[#ffffff] rounded-[500px] font-bold text-[12px] uppercase tracking-wider h-9 px-3 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase">
                        Xác nhận xóa
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
                        Bạn có chắc chắn muốn xóa bãi đỗ{" "}
                        <span className="text-[#121212] dark:text-[#ffffff]">
                          {yard.name}
                        </span>
                        ? Hành động này sẽ chuyển bãi đỗ vào thùng rác.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 gap-3">
                      <AlertDialogCancel className="bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6">
                        Hủy
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteYard(yard._id)}
                        className="bg-[#f3727f] hover:bg-[#d95b66] text-[#ffffff] font-black uppercase tracking-wider px-6 rounded-[500px] border-none"
                      >
                        Xóa bãi đỗ
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
