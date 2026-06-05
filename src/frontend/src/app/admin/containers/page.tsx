"use client";

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
import { Plus, Edit2, Trash2, Box, Archive, LayoutGrid } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import JustValidate from "just-validate";
import toast from "react-hot-toast";
import { CustomSelect } from "@/components/CustomSelect";
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

const initialContainers = [
  {
    id: 1,
    number: "CNT-001",
    type: "20ft",
    status: "Hàng",
    location: "A-01-1-1",
    inDate: "2026-05-15",
    outDate: null,
    fee: 0,
  },
  {
    id: 2,
    number: "CNT-002",
    type: "40ft",
    status: "Rỗng",
    location: "A-01-1-2",
    inDate: "2026-05-16",
    outDate: null,
    fee: 0,
  },
  {
    id: 3,
    number: "CNT-003",
    type: "20ft",
    status: "Hàng",
    location: "B-02-2-1",
    inDate: "2026-05-14",
    outDate: null,
    fee: 0,
  },
  {
    id: 4,
    number: "CNT-004",
    type: "40ft",
    status: "Rỗng",
    location: "C-03-1-2",
    inDate: "2026-05-12",
    outDate: "2026-05-18",
    fee: 450000,
  },
];

export default function ContainersPage() {
  const [containers, setContainers] = useState(initialContainers);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState("20ft");
  const [statusFilter, setStatusFilter] = useState("Hàng");

  const formRef = useRef<HTMLFormElement>(null);
  const validatorRef = useRef<JustValidate | null>(null);

  useEffect(() => {
    if (!showForm || !formRef.current) {
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
      .addField("#number", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .addField("#location", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .addField("#inDate", [{ rule: "required", errorMessage: "Bắt buộc." }])
      .onSuccess((event: any) => {
        event.preventDefault();
        const formData = new FormData(formRef.current!);
        const newContainer = {
          id: Date.now(),
          number: formData.get("number")?.toString() || "",
          type: typeFilter,
          status: statusFilter,
          location: formData.get("location")?.toString() || "",
          inDate: formData.get("inDate")?.toString() || "",
          outDate: null,
          fee: 0,
        };

        const loadingToast = toast.loading("Đang thêm container...");
        setTimeout(() => {
          setContainers([newContainer, ...containers]);
          toast.success("Thêm container thành công!", { id: loadingToast });
          setShowForm(false);
        }, 800);
      });

    return () => {
      if (validatorRef.current) {
        validatorRef.current.destroy();
        validatorRef.current = null;
      }
    };
  }, [showForm, typeFilter, statusFilter, containers]);

  const handleDelete = (id: number) => {
    const loadingToast = toast.loading("Đang xóa container...");
    setTimeout(() => {
      setContainers(containers.filter((c) => c.id !== id));
      toast.success("Đã xóa container.", { id: loadingToast });
    }, 600);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Quản lý container
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1 uppercase tracking-wider text-[12px]">
            Quản lý thông tin container trong bãi
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 gap-2 border-none transition-all duration-200"
        >
          <Plus className="h-5 w-5" />
          Thêm container
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm animate-in fade-in slide-in-from-top-4 duration-200">
          <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6 rounded-t-[16px]">
            <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Thêm container mới
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form ref={formRef} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <Label
                    htmlFor="number"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Số container
                  </Label>
                  <Input
                    id="number"
                    name="number"
                    placeholder="CNT-001"
                    className="uppercase bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Loại
                  </Label>
                  <CustomSelect
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={[
                      { value: "20ft", label: "20ft" },
                      { value: "40ft", label: "40ft" },
                    ]}
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]">
                    Trạng thái
                  </Label>
                  <CustomSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={[
                      { value: "Hàng", label: "Hàng" },
                      { value: "Rỗng", label: "Rỗng" },
                    ]}
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="location"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Vị trí
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="A-01-1-1"
                    className="uppercase bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors"
                  />
                </div>
                <div className="space-y-3">
                  <Label
                    htmlFor="inDate"
                    className="text-[12px] font-bold uppercase tracking-[1.5px] text-[#121212] dark:text-[#ffffff]"
                  >
                    Ngày vào
                  </Label>
                  <Input
                    id="inDate"
                    name="inDate"
                    type="date"
                    onClick={(e) => (e.target as any).showPicker?.()}
                    className="bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 px-4 rounded-[8px] focus-visible:border-[#00754A] dark:focus-visible:border-[#00754A] focus-visible:ring-1 focus-visible:ring-[#00754A] dark:focus-visible:ring-[#00754A] transition-colors cursor-pointer dark:[color-scheme:dark]"
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-end pt-4">
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm flex items-center p-6 gap-4 border-l-4 border-l-[#121212] dark:border-l-[#ffffff]">
          <div className="h-12 w-12 bg-[#f8f8f8] dark:bg-[#121212] rounded-full flex items-center justify-center border border-[#e5e5e5] dark:border-[#272727]">
            <Box className="h-5 w-5 text-[#121212] dark:text-[#ffffff]" />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">
              Tổng container
            </p>
            <h3 className="text-2xl font-black text-[#121212] dark:text-[#ffffff]">
              1,240
            </h3>
          </div>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm flex items-center p-6 gap-4 border-l-4 border-l-[#00754A]">
          <div className="h-12 w-12 bg-[#f8f8f8] dark:bg-[#121212] rounded-full flex items-center justify-center border border-[#e5e5e5] dark:border-[#272727]">
            <LayoutGrid className="h-5 w-5 text-[#00754A]" />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">
              Đang lưu
            </p>
            <h3 className="text-2xl font-black text-[#121212] dark:text-[#ffffff]">
              1,180
            </h3>
          </div>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm flex items-center p-6 gap-4 border-l-4 border-l-[#3b82f6]">
          <div className="h-12 w-12 bg-[#f8f8f8] dark:bg-[#121212] rounded-full flex items-center justify-center border border-[#e5e5e5] dark:border-[#272727]">
            <Archive className="h-5 w-5 text-[#3b82f6]" />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">
              20ft
            </p>
            <h3 className="text-2xl font-black text-[#121212] dark:text-[#ffffff]">
              620
            </h3>
          </div>
        </Card>

        <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm flex items-center p-6 gap-4 border-l-4 border-l-[#a855f7]">
          <div className="h-12 w-12 bg-[#f8f8f8] dark:bg-[#121212] rounded-full flex items-center justify-center border border-[#e5e5e5] dark:border-[#272727]">
            <Archive className="h-5 w-5 text-[#a855f7]" />
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#666666] dark:text-[#999999]">
              40ft
            </p>
            <h3 className="text-2xl font-black text-[#121212] dark:text-[#ffffff]">
              620
            </h3>
          </div>
        </Card>
      </div>

      {/* Container List */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <CardTitle className="text-xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
            Danh sách container
          </CardTitle>
          <CardDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px] uppercase tracking-wider mt-1">
            Tất cả container trong bãi
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-[#666666] dark:text-[#999999] uppercase tracking-wider bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                <tr>
                  <th className="px-6 py-4 font-black">Số container</th>
                  <th className="px-6 py-4 font-black">Loại</th>
                  <th className="px-6 py-4 font-black">Trạng thái</th>
                  <th className="px-6 py-4 font-black">Vị trí</th>
                  <th className="px-6 py-4 font-black">Ngày vào</th>
                  <th className="px-6 py-4 font-black text-right w-32">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                {containers.map((container) => (
                  <tr
                    key={container.id}
                    className="group bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff] uppercase">
                      {container.number}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3] uppercase">
                      {container.type}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-[4px] text-[10px] font-black uppercase tracking-wider ${
                          container.status === "Hàng"
                            ? "bg-[#00754A]/10 text-[#00754A] dark:bg-[#1ed760]/10 dark:text-[#1ed760]"
                            : "bg-[#e5e5e5] text-[#121212] dark:bg-[#272727] dark:text-[#ffffff]"
                        }`}
                      >
                        {container.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3] uppercase">
                      {container.location}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                      {container.inDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-[#666666] dark:text-[#b3b3b3] hover:text-[#121212] dark:hover:text-[#ffffff] hover:bg-[#e5e5e5] dark:hover:bg-[#272727] rounded-full"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-[#f3727f] hover:text-[#ffffff] hover:bg-[#f3727f] rounded-full"
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
                                Bạn có chắc chắn muốn xóa container{" "}
                                <span className="text-[#121212] dark:text-[#ffffff]">
                                  {container.number}
                                </span>
                                ?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="mt-6 gap-3">
                              <AlertDialogCancel className="bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6">
                                Hủy
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(container.id)}
                                className="bg-[#f3727f] hover:bg-[#d95b66] text-[#ffffff] font-black uppercase tracking-wider px-6 rounded-[500px] border-none"
                              >
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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
