"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";

export function AsyncCompanyTruckSelect({ 
    value, 
    onChange, 
    error 
}: { 
    value: string;
    onChange: (truckPlate: string) => void;
    error?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [trucks, setTrucks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        const fetchTrucks = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/client/trucks?search=${encodeURIComponent(debouncedSearch)}&limit=20`, { credentials: "include" });
                const data = await res.json();
                if (data.code === "success") {
                    setTrucks(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (isOpen) {
            fetchTrucks();
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
            <input type="hidden" id="truckPlate" name="truckPlate" value={value} />
            <div 
                className={`flex items-center justify-between w-full h-12 px-4 border rounded-[4px] cursor-pointer transition-colors ${error ? "border-[#c82014] ring-1 ring-[#c82014]" : "border-[#d6dbde] dark:border-[#272727] hover:border-[#00754A] dark:hover:border-[#00754A]"} bg-[#ffffff] dark:bg-[#121212]`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`font-bold truncate ${value ? "text-[#121212] dark:text-[#ffffff] uppercase" : "text-[rgba(0,0,0,0.58)] dark:text-[rgba(255,255,255,0.70)]"}`}>
                    {value ? value : "Tìm kiếm biển số xe..."}
                </span>
                <Search className={`w-4 h-4 transition-colors ${isOpen ? "text-[#00754A]" : "text-[rgba(0,0,0,0.58)] dark:text-[rgba(255,255,255,0.70)]"}`} />
            </div>
            
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-[#ffffff] dark:bg-[#181818] border border-[#e5e5e5] dark:border-[#272727] rounded-[12px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] max-h-64 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 bg-[#f8f8f8] dark:bg-[#121212] border-b border-[#e5e5e5] dark:border-[#272727]">
                        <Input
                            type="text"
                            placeholder="Gõ biển số xe..."
                            className="w-full text-[14px] font-bold h-10 bg-[#ffffff] dark:bg-[#181818] border-[#e5e5e5] dark:border-[#272727] rounded-[8px] focus-visible:ring-[#1ed760] uppercase"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                    <div className="overflow-y-auto flex-1 p-2 custom-scrollbar">
                        {loading ? (
                            <div className="flex items-center justify-center py-8 text-[#666666] dark:text-[#b3b3b3] text-[12px] font-bold uppercase tracking-wider">
                                <Loader2 className="w-5 h-5 animate-spin mr-3 text-[#1ed760]" /> Đang tải...
                            </div>
                        ) : trucks.length > 0 ? (
                            <ul className="space-y-1">
                                {trucks.map((t) => (
                                    <li 
                                        key={t._id}
                                        className={`p-3 rounded-[8px] cursor-pointer transition-all duration-200 flex items-center gap-3 group ${value === t.truckPlate ? "bg-[#1ed760]/10 border border-[#1ed760]/20" : "hover:bg-[#f8f8f8] dark:hover:bg-[#272727]"}`}
                                        onClick={() => {
                                            onChange(t.truckPlate);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                    >
                                        <div className={`p-2 rounded-[6px] ${value === t.truckPlate ? "bg-[#1ed760]/20 text-[#1ed760]" : "bg-[#eeeeee] dark:bg-[#333333] text-[#666666] dark:text-[#b3b3b3] group-hover:bg-[#1ed760]/20 group-hover:text-[#1ed760]"}`}>
                                            <Truck className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className={`font-black text-[14px] uppercase transition-colors ${value === t.truckPlate ? "text-[#1db954]" : "text-[#121212] dark:text-[#ffffff] group-hover:text-[#1ed760]"}`}>
                                                {t.truckPlate}
                                            </div>
                                            <div className="text-[12px] font-mono text-[#666666] dark:text-[#999999]">
                                                {t.truckType} &nbsp;&bull;&nbsp; {t.companyId?.companyName || 'Không xác định'}
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="py-8 text-[12px] font-bold uppercase tracking-wider text-center text-[#666666] dark:text-[#999999]">
                                Không tìm thấy xe nào
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
