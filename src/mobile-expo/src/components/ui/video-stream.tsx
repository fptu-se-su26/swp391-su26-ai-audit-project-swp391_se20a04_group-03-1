"use client";

import { useState } from "react";
import {
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  CameraOff,
} from "lucide-react";
import { Button } from "./button";

interface VideoStreamProps {
  title: string;
  cameraId: string;
  streamUrl?: string;
}

export function VideoStream({
  title,
  cameraId,
  streamUrl = "http://localhost:5001/video_feed",
}: VideoStreamProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 w-screen h-screen rounded-none"
          : "w-full aspect-video"
      }`}
    >
      {/* Video Container */}
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        {/* KIỂM TRA LUỒNG VIDEO */}
        {!hasError && streamUrl ? (
          <img
            src={streamUrl}
            alt={`Luồng trực tiếp ${title}`}
            className="w-full h-full object-contain"
            // Khi Flask chưa bật hoặc bị lỗi đường truyền, kích hoạt trạng thái lỗi
            onError={() => setHasError(true)}
            onLoad={() => setHasError(false)}
          />
        ) : (
          /* TRẠNG THÁI MẤT KẾT NỐI (FALLBACK UI) */
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 select-none">
            <div className="p-4 bg-slate-800/60 rounded-full text-slate-500 border border-slate-700/50 animate-pulse">
              <CameraOff className="w-10 h-10" />
            </div>
            <div className="text-center">
              <p className="text-slate-400 text-sm font-medium">
                Mất tín hiệu camera
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Camera ID: {cameraId}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 text-xs border-slate-700 hover:bg-slate-800 text-slate-300"
              onClick={() => setHasError(false)} // Thử kết nối lại
            >
              Thử kết nối lại
            </Button>
          </div>
        )}

        {/* Video Controls Overlay (Chỉ xuất hiện khi di chuột vào hoặc khi mất kết nối để quản lý) */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end">
          <div className="p-4 flex items-center justify-between w-full">
            <div>
              <h3 className="text-white text-sm font-semibold tracking-wide">
                {title}
              </h3>
              <p className="text-slate-400 text-xs font-mono">{cameraId}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Status Badge (Luôn hiển thị ở góc) */}
        <div className="absolute top-3 left-3 pointer-events-none select-none">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-white text-[10px] font-bold tracking-wider uppercase rounded-md shadow-sm ${
              !hasError ? "bg-red-600 animate-none" : "bg-slate-700"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 bg-white rounded-full ${!hasError && "animate-ping"}`}
            />
            {!hasError ? "LIVE" : "OFFLINE"}
          </span>
        </div>

        {/* Nút thoát Fullscreen nhanh ở góc phải */}
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-50 bg-slate-900/80 text-white w-9 h-9 flex items-center justify-center rounded-lg border border-slate-700/50 hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
