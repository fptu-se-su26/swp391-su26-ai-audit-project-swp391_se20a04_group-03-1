"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import Link from "next/link";
import toast from "react-hot-toast";
import { RequirePermission, Can, usePermissions } from "@/lib/permissions";
import { ACTION_LABELS, type Action } from "@/config/rbac";
import { AuditCell, AuditFields } from "@/components/ui/audit-cell";

interface ResourceDef {
  key: string;
  label: string;
  actions: Action[];
}
interface Permission {
  resource: string;
  actions: string[];
}
interface Role extends AuditFields {
  _id: string;
  roleCode: string;
  roleName: string;
  description: string;
  permissions: Permission[];
  isSystem: boolean;
  status: string;
  userCount?: number;
}

const API = process.env.NEXT_PUBLIC_API_URL;

function RolesInner() {
  const { refresh } = usePermissions();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Catalog resource/action (nguồn chân lý từ backend).
  const [resources, setResources] = useState<ResourceDef[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);

  const [roleCode, setRoleCode] = useState("");
  const [roleName, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  // permMap: resourceKey -> danh sách action đã chọn.
  const [permMap, setPermMap] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const t = setTimeout(() => {
      setDebounced(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchCatalog = async () => {
    try {
      const res = await fetch(`${API}/settings/roles/catalog`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") setResources(data.data.resources);
    } catch {
      /* ignore */
    }
  };

  const fetchRoles = async (page = 1) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(debounced && { search: debounced }),
      });
      const res = await fetch(`${API}/settings/roles?${qs}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        setRoles(data.data);
        setCurrentPage(data.pagination.currentPage);
        setTotalPages(data.pagination.totalPages);
      }
    } catch {
      toast.error("Không thể tải danh sách vai trò");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);
  useEffect(() => {
    fetchRoles(currentPage);
  }, [currentPage, debounced]);

  const openCreate = () => {
    setEditing(null);
    setRoleCode("");
    setRoleName("");
    setDescription("");
    setPermMap({});
    setShowForm(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setRoleCode(role.roleCode);
    setRoleName(role.roleName);
    setDescription(role.description || "");
    const map: Record<string, string[]> = {};
    role.permissions.forEach((p) => (map[p.resource] = [...p.actions]));
    setPermMap(map);
    setShowForm(true);
  };

  const toggleAction = (resource: string, action: string) => {
    setPermMap((prev) => {
      const current = new Set(prev[resource] || []);
      if (current.has(action)) current.delete(action);
      else current.add(action);
      return { ...prev, [resource]: Array.from(current) };
    });
  };

  const toggleAllForResource = (r: ResourceDef) => {
    setPermMap((prev) => {
      const hasAll = (prev[r.key] || []).length === r.actions.length;
      return { ...prev, [r.key]: hasAll ? [] : [...r.actions] };
    });
  };

  const isChecked = (resource: string, action: string) =>
    (permMap[resource] || []).includes(action);

  const handleSubmit = async () => {
    if (!roleCode || !roleName) {
      toast.error("Vui lòng nhập Mã và Tên vai trò.");
      return;
    }
    const permissions = Object.entries(permMap)
      .map(([resource, actions]) => ({ resource, actions }))
      .filter((p) => p.actions.length > 0);

    setSaving(true);
    const loadingToast = toast.loading("Đang lưu...");
    try {
      const url = editing
        ? `${API}/settings/roles/${editing._id}`
        : `${API}/settings/roles`;
      const res = await fetch(url, {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleCode, roleName, description, permissions }),
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.message, { id: loadingToast });
        setShowForm(false);
        fetchRoles(currentPage);
        refresh(); // cập nhật lại quyền của chính mình (nếu tự sửa role đang dùng)
      } else {
        toast.error(data.message, { id: loadingToast });
      }
    } catch {
      toast.error("Lỗi kết nối server", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (role: Role) => {
    const newStatus = role.status === "Active" ? "Inactive" : "Active";
    const loadingToast = toast.loading("Đang cập nhật...");
    try {
      const res = await fetch(`${API}/settings/roles/${role._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newStatus }),
        credentials: "include",
      });
      const data = await res.json();
      data.code === "success"
        ? (toast.success(data.message, { id: loadingToast }), fetchRoles(currentPage))
        : toast.error(data.message, { id: loadingToast });
    } catch {
      toast.error("Không thể cập nhật trạng thái", { id: loadingToast });
    }
  };

  const handleDelete = async (id: string) => {
    const loadingToast = toast.loading("Đang xóa...");
    try {
      const res = await fetch(`${API}/settings/roles/${id}/delete`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (data.code === "success") {
        toast.success(data.message, { id: loadingToast });
        if (roles.length === 1 && currentPage > 1) setCurrentPage(currentPage - 1);
        else fetchRoles(currentPage);
      } else {
        toast.error(data.message, { id: loadingToast });
      }
    } catch {
      toast.error("Không thể xóa vai trò", { id: loadingToast });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/settings">
          <Button variant="outline" size="icon" className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] rounded-full transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-[32px] font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
            Vai trò & Phân quyền
          </h1>
          <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-1">
            Tạo vai trò và cấp quyền truy cập từng trang cùng thao tác CRUD.
          </p>
        </div>
        <div className="ml-auto flex gap-3">
          <Link href="/admin/settings/roles/trash">
            <Button variant="outline" className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] hover:bg-[#f8f8f8] dark:hover:bg-[#272727] hover:border-[#f3727f] rounded-[500px] font-bold uppercase tracking-wider transition-colors gap-2">
              <Trash2 className="h-4 w-4 text-[#f3727f]" />
              Thùng rác
            </Button>
          </Link>
          <Can resource="settings.roles" action="create">
            <Button onClick={openCreate} className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-6 gap-2 border-none transition-all duration-200">
              <Plus className="h-5 w-5" />
              Thêm vai trò
            </Button>
          </Can>
        </div>
      </div>

      {/* Table */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
        <CardHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              Danh sách vai trò
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
              <Input
                placeholder="Tìm mã, tên vai trò..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-11 bg-[#ffffff] dark:bg-[#181818] border border-[#d6dbde] dark:border-[#272727] rounded-[500px] h-10 font-bold text-[14px] focus-visible:ring-0 focus-visible:border-[#1ed760] transition-colors"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                <tr>
                  <th className="px-6 py-4 font-black">Mã vai trò</th>
                  <th className="px-6 py-4 font-black">Tên</th>
                  <th className="px-6 py-4 font-black">Số quyền</th>
                  <th className="px-6 py-4 font-black">Người dùng</th>
                  <th className="px-6 py-4 font-black">Trạng thái</th>
                  <th className="px-6 py-4 font-black">Nhật ký sửa đổi</th>
                  <th className="px-6 py-4 font-black text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#1ed760]" />
                    </td>
                  </tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <ShieldCheck className="h-16 w-16 mx-auto text-[#e5e5e5] dark:text-[#272727] mb-4" />
                      <p className="font-bold text-[#666666] dark:text-[#b3b3b3]">Chưa có vai trò nào.</p>
                    </td>
                  </tr>
                ) : (
                  roles.map((role) => (
                    <tr key={role._id} className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors group">
                      <td className="px-6 py-4 font-black text-[#121212] dark:text-[#ffffff] tracking-wider">
                        {role.roleCode}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#121212] dark:text-[#ffffff]">
                        {role.roleName}
                        {role.description && (
                          <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3] max-w-[260px] truncate">
                            {role.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {role.isSystem ? "Toàn quyền" : `${role.permissions?.length || 0} trang`}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 font-bold text-[#666666] dark:text-[#b3b3b3]">
                          <Users className="h-3.5 w-3.5" /> {role.userCount ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border ${
                          role.status === "Active"
                            ? "bg-[#1ed760]/10 text-[#1ed760] border-[#1ed760]/20"
                            : "bg-[#e5e5e5] text-[#666666] border-[#cccccc] dark:bg-[#272727] dark:text-[#999999] dark:border-[#333333]"
                        }`}>
                          {role.status === "Active" ? "Hoạt động" : "Tạm ẩn"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <AuditCell
                          createdBy={role.createdBy}
                          updatedBy={role.updatedBy}
                          createdAt={role.createdAt}
                          updatedAt={role.updatedAt}
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        {role.isSystem ? (
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider bg-[#3b82f6]/10 text-[#3b82f6] border border-[#3b82f6]/20">
                            Hệ thống
                          </span>
                        ) : (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Can resource="settings.roles" action="update">
                              <Button onClick={() => handleToggleStatus(role)} className={`rounded-[500px] h-8 px-4 text-[11px] font-black uppercase tracking-wider border-none transition-colors ${
                                role.status === "Active"
                                  ? "bg-[#f59e0b]/10 hover:bg-[#f59e0b] text-[#f59e0b] hover:text-[#121212]"
                                  : "bg-[#1ed760]/10 hover:bg-[#1ed760] text-[#1db954] hover:text-[#121212]"
                              }`}>
                                {role.status === "Active" ? "Ẩn" : "Hiện"}
                              </Button>
                            </Can>
                            <Can resource="settings.roles" action="update">
                              <Button onClick={() => openEdit(role)} className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#1ed760] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors" title="Chỉnh sửa">
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </Can>
                            <Can resource="settings.roles" action="delete">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button className="bg-[#eeeeee] dark:bg-[#272727] hover:bg-[#f3727f] hover:text-[#121212] text-[#121212] dark:text-[#ffffff] rounded-[500px] h-8 w-8 p-0 border-none transition-colors" title="Đưa vào thùng rác">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[16px]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase">
                                      Xác nhận xóa
                                    </AlertDialogTitle>
                                    <AlertDialogDescription className="text-[#666666] dark:text-[#b3b3b3] font-bold text-[14px]">
                                      Đưa vai trò <span className="text-[#f3727f]">{role.roleName}</span> vào thùng rác?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter className="mt-6 gap-3">
                                    <AlertDialogCancel className="bg-[#f8f8f8] dark:bg-[#121212] text-[#121212] dark:text-[#ffffff] border-[#e5e5e5] dark:border-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-6">
                                      Hủy
                                    </AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(role._id)} className="bg-[#f3727f] hover:bg-[#e05b68] text-[#121212] rounded-[500px] font-black uppercase tracking-wider px-6 border-none">
                                      Xóa ngay
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </Can>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#e5e5e5] dark:border-[#272727]">
              <div className="text-sm font-bold text-[#666666] dark:text-[#b3b3b3]">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-[500px] font-bold uppercase tracking-wider text-[11px] h-8 px-4">Trước</Button>
                <Button variant="outline" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-[500px] font-bold uppercase tracking-wider text-[11px] h-8 px-4">Sau</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Modal với ma trận phân quyền */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] rounded-[16px] border border-[#e5e5e5] dark:border-[#272727] max-w-3xl p-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727] p-6">
            <DialogTitle className="text-2xl font-black text-[#121212] dark:text-[#ffffff] uppercase tracking-wider">
              {editing ? "Chỉnh sửa vai trò" : "Thêm vai trò"}
            </DialogTitle>
          </DialogHeader>

          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[12px] font-bold uppercase tracking-[1.5px]">Mã vai trò *</Label>
                <Input
                  value={roleCode}
                  onChange={(e) => setRoleCode(e.target.value.toUpperCase())}
                  placeholder="VD: WAREHOUSE_MANAGER"
                  disabled={!!editing}
                  className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] font-bold h-12 px-4 rounded-[8px] disabled:opacity-60"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[12px] font-bold uppercase tracking-[1.5px]">Tên hiển thị *</Label>
                <Input
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="VD: Quản lý kho"
                  className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] font-bold h-12 px-4 rounded-[8px]"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[12px] font-bold uppercase tracking-[1.5px]">Mô tả</Label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả vai trò này..."
                  className="bg-[#f8f8f8] dark:bg-[#121212] border-[#e5e5e5] dark:border-[#272727] font-bold h-12 px-4 rounded-[8px]"
                />
              </div>
            </div>

            {/* Ma trận: hàng = trang, cột = thao tác */}
            <div>
              <Label className="text-[12px] font-bold uppercase tracking-[1.5px] mb-3 block">
                Ma trận phân quyền
              </Label>
              <div className="border border-[#e5e5e5] dark:border-[#272727] rounded-[12px] overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#f8f8f8] dark:bg-[#121212] text-[10px] uppercase tracking-[1.5px] text-[#666666] dark:text-[#999999]">
                    <tr>
                      <th className="px-4 py-3 text-left font-black">Trang / Module</th>
                      {(["view", "create", "update", "delete", "restore", "export"] as Action[]).map((a) => (
                        <th key={a} className="px-3 py-3 font-black text-center">{ACTION_LABELS[a]}</th>
                      ))}
                      <th className="px-3 py-3 font-black text-center">Tất cả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                    {resources.map((r) => (
                      <tr key={r.key} className="hover:bg-[#f8f8f8] dark:hover:bg-[#121212]">
                        <td className="px-4 py-3 font-bold text-[#121212] dark:text-[#ffffff]">{r.label}</td>
                        {(["view", "create", "update", "delete", "restore", "export"] as Action[]).map((a) => (
                          <td key={a} className="px-3 py-3 text-center">
                            {r.actions.includes(a) ? (
                              <input
                                type="checkbox"
                                checked={isChecked(r.key, a)}
                                onChange={() => toggleAction(r.key, a)}
                                className="h-4 w-4 accent-[#1ed760] cursor-pointer"
                              />
                            ) : (
                              <span className="text-[#cccccc] dark:text-[#3a3a3a]">—</span>
                            )}
                          </td>
                        ))}
                        <td className="px-3 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={(permMap[r.key] || []).length === r.actions.length && r.actions.length > 0}
                            onChange={() => toggleAllForResource(r)}
                            className="h-4 w-4 accent-[#1db954] cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-[#e5e5e5] dark:border-[#272727] bg-[#f8f8f8] dark:bg-[#121212]">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="bg-[#ffffff] dark:bg-[#181818] text-[#121212] dark:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727] rounded-[500px] font-bold uppercase tracking-wider px-8">
              Hủy
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-[1.5px] px-8 border-none">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? "Cập nhật" : "Tạo vai trò"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function RolesPage() {
  return (
    <RequirePermission resource="settings.roles" action="view">
      <RolesInner />
    </RequirePermission>
  );
}
