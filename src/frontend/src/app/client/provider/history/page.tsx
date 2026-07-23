"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Search,
  Loader2,
  History,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

/**
 * Lịch sử giao dịch của hãng tàu.
 *
 * Trang này trước đây được sidebar trỏ tới nhưng chưa từng tồn tại (bấm vào là
 * 404). Dữ liệu lấy từ GET /client/provider/dashboard/history — backend lọc
 * theo container thuộc hãng tàu đang đăng nhập.
 */

const API = process.env.NEXT_PUBLIC_API_URL;
const PAGE_SIZE = 10;

interface HistoryItem {
  _id: string;
  at: string | null;
  direction: "in" | "out";
  containerNo: string | null;
  truckPlate: string | null;
  purpose: string | null;
  driverName: string | null;
  companyName: string | null;
  gateName: string | null;
  yardName: string | null;
  assignedSlot: string | null;
  ocrConfidence: number | null;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
}

const DIRECTION_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "in", label: "Đang trong cảng" },
  { value: "out", label: "Đã rời cảng" },
] as const;

const formatDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })} · ${d.toLocaleDateString("vi-VN")}`;
};

export default function ProviderHistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState<string>("ALL");
  // searchInput là những gì đang gõ, search là giá trị đã áp dụng — tách ra để
  // không gọi API sau mỗi phím bấm.
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (search) params.set("search", search);
      if (direction !== "ALL") params.set("direction", direction);

      const res = await fetch(
        `${API}/client/provider/dashboard/history?${params.toString()}`,
        { credentials: "include" },
      );
      const json = await res.json();
      if (json.code === "success") {
        setItems(json.data || []);
        setPagination(json.pagination || null);
        setError(null);
      } else {
        setError(json.message || "Không thể tải lịch sử giao dịch.");
      }
    } catch {
      setError("Không kết nối được máy chủ.");
    } finally {
      setLoading(false);
    }
  }, [page, search, direction]);

  useEffect(() => {
    load();
  }, [load]);

  const applySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const changeDirection = (value: string) => {
    setPage(1);
    setDirection(value);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-black text-[#121212] dark:text-[#ffffff] tracking-tight uppercase">
          Lịch sử Giao dịch
        </h1>
        <p className="text-[#666666] dark:text-[#b3b3b3] font-bold mt-2 uppercase tracking-wider text-[12px]">
          {pagination
            ? `${pagination.totalItems} lượt ra vào cảng của container thuộc hãng tàu`
            : "Lượt ra vào cảng của container thuộc hãng tàu"}
        </p>
      </div>

      {/* Bộ lọc */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm">
        <CardContent className="p-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <form onSubmit={applySearch} className="flex gap-3 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999999]" />
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm theo số container hoặc biển số xe"
                className="pl-11 bg-[#f8f8f8] dark:bg-[#121212] border border-[#e5e5e5] dark:border-[#272727] text-[#121212] dark:text-[#ffffff] font-bold h-12 rounded-[8px] focus-visible:ring-1 focus-visible:ring-[#1ed760]"
              />
            </div>
            <Button
              type="submit"
              className="bg-[#121212] dark:bg-[#ffffff] text-[#ffffff] dark:text-[#121212] hover:bg-[#333333] dark:hover:bg-[#e5e5e5] h-12 px-8 rounded-[8px] font-black uppercase tracking-wider"
            >
              Tìm
            </Button>
          </form>

          <div className="flex gap-2">
            {DIRECTION_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => changeDirection(f.value)}
                className={`px-5 h-12 rounded-[500px] text-[12px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
                  direction === f.value
                    ? "bg-[#1ed760] text-[#121212]"
                    : "bg-[#f8f8f8] dark:bg-[#121212] text-[#666666] dark:text-[#b3b3b3] hover:text-[#121212] dark:hover:text-[#ffffff] border border-[#e5e5e5] dark:border-[#272727]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bảng */}
      <Card className="bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[16px] shadow-sm overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#1ed760] mb-4" />
              <p className="text-[#666666] font-bold uppercase tracking-wider text-[12px]">
                Đang tải...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertTriangle className="h-10 w-10 text-[#f3727f]" />
              <p className="text-[#121212] dark:text-[#ffffff] font-bold">
                {error}
              </p>
              <Button
                onClick={load}
                className="bg-[#1ed760] hover:bg-[#1db954] text-[#121212] rounded-[500px] font-black uppercase tracking-wider px-6"
              >
                Thử lại
              </Button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <History className="h-10 w-10 text-[#cccccc] dark:text-[#444444]" />
              <p className="text-[#666666] dark:text-[#b3b3b3] font-bold">
                {search || direction !== "ALL"
                  ? "Không tìm thấy giao dịch nào khớp bộ lọc."
                  : "Chưa có giao dịch nào được ghi nhận."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] uppercase tracking-[2px] text-[#666666] dark:text-[#999999] bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                  <tr>
                    <th className="px-6 py-4 font-black">Chiều</th>
                    <th className="px-6 py-4 font-black">Container</th>
                    <th className="px-6 py-4 font-black">Xe / Tài xế</th>
                    <th className="px-6 py-4 font-black">Doanh nghiệp</th>
                    <th className="px-6 py-4 font-black">Cổng / Vị trí</th>
                    <th className="px-6 py-4 font-black">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e5e5] dark:divide-[#272727]">
                  {items.map((t) => (
                    <tr
                      key={t._id}
                      className="bg-[#ffffff] dark:bg-[#181818] hover:bg-[#f8f8f8] dark:hover:bg-[#121212] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[500px] text-[11px] font-black uppercase tracking-wider border ${
                            t.direction === "in"
                              ? "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20"
                              : "bg-[#1ed760]/10 text-[#1db954] border-[#1ed760]/20"
                          }`}
                        >
                          {t.direction === "in" ? (
                            <ArrowDownToLine className="h-3 w-3" />
                          ) : (
                            <ArrowUpFromLine className="h-3 w-3" />
                          )}
                          {t.direction === "in" ? "Vào" : "Ra"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#121212] dark:text-[#ffffff]">
                          {t.containerNo || "—"}
                        </p>
                        {t.purpose && (
                          <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3] mt-0.5">
                            {t.purpose}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#121212] dark:text-[#ffffff]">
                          {t.truckPlate || "—"}
                        </p>
                        {t.driverName && (
                          <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3] mt-0.5">
                            {t.driverName}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {t.companyName || "—"}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3]">
                        {t.gateName || "—"}
                        {t.assignedSlot ? (
                          <span className="block text-[12px] mt-0.5">
                            {t.yardName ? `${t.yardName} · ` : ""}Ô{" "}
                            {t.assignedSlot}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-6 py-4 font-bold text-[#666666] dark:text-[#b3b3b3] whitespace-nowrap">
                        {formatDateTime(t.at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phân trang */}
      {pagination && pagination.totalPages > 1 && !loading && (
        <div className="flex items-center justify-between">
          <p className="text-[12px] font-bold text-[#666666] dark:text-[#b3b3b3] uppercase tracking-wider">
            Trang {pagination.currentPage} / {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={pagination.currentPage <= 1}
              className="p-3 rounded-[500px] bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#666666] dark:text-[#b3b3b3] hover:text-[#121212] dark:hover:text-[#ffffff] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Trang trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() =>
                setPage((p) => Math.min(p + 1, pagination.totalPages))
              }
              disabled={pagination.currentPage >= pagination.totalPages}
              className="p-3 rounded-[500px] bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] text-[#666666] dark:text-[#b3b3b3] hover:text-[#121212] dark:hover:text-[#ffffff] transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Trang sau"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
