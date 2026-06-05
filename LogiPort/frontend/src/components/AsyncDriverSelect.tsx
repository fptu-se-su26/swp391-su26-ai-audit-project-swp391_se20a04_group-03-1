"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AsyncDriverSelect({ 
    value, 
    onChange, 
    onCompanyChange,
    selectedDriver,
    error 
}: { 
    value: string;
    onChange: (id: string, name: string) => void;
    onCompanyChange?: (companyName: string) => void;
    selectedDriver: { id: string, name: string } | null;
    error?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [drivers, setDrivers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const fetchDrivers = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/drivers?search=${encodeURIComponent(debouncedSearch)}&limit=20`, { credentials: "include" });
                const data = await res.json();
                if (data.code === "success") {
                    setDrivers(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (isOpen) {
            fetchDrivers();
        }
    }, [debouncedSearch, isOpen]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={wrapperRef} className="relative w-full">
            <input type="hidden" id="driverId" name="driverId" value={value} />
            <div 
                className={`flex items-center justify-between w-full h-10 px-3 py-2 border rounded-md cursor-pointer bg-white dark:bg-slate-950 ${error ? "border-red-500 ring-red-500" : "border-slate-200 dark:border-slate-800"}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={selectedDriver ? "text-slate-900 dark:text-slate-100 text-sm" : "text-slate-500 text-sm"}>
                    {selectedDriver ? selectedDriver.name : "Tìm tên, SĐT, CCCD..."}
                </span>
                <Search className="w-4 h-4 text-slate-400" />
            </div>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-lg max-h-60 flex flex-col">
                    <div className="p-2 sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                        <Input
                            type="text"
                            placeholder="Gõ tên, SĐT, hoặc CCCD..."
                            className="w-full text-sm h-9"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-1">
                        {loading ? (
                            <div className="flex items-center justify-center p-4 text-slate-500 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin mr-2" /> Đang tải...
                            </div>
                        ) : drivers.length > 0 ? (
                            <ul className="space-y-1">
                                {drivers.map((d) => (
                                    <li 
                                        key={d._id}
                                        className={`p-2 text-sm rounded-md cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${value === d._id ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-medium" : "text-slate-700 dark:text-slate-300"}`}
                                        onClick={() => {
                                            onChange(d._id, `[${d.driverId}] ${d.driverName} - ${d.driverPhone || 'Không có SĐT'}`);
                                            if (onCompanyChange && d.companyId) {
                                                onCompanyChange(d.companyId.companyName);
                                            } else if (onCompanyChange) {
                                                onCompanyChange("Không thuộc công ty nào");
                                            }
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                    >
                                        <div className="font-medium">{d.driverName}</div>
                                        <div className="text-xs text-slate-500 mt-0.5">
                                            CCCD: {d.driverId} | SĐT: {d.driverPhone || '-'}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-sm text-center text-slate-500">
                                Không tìm thấy tài xế nào
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
