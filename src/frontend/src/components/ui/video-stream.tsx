"use client"

import { useState, useRef, useEffect } from "react"
import { Volume2, VolumeX, Maximize2, Minimize2, CameraOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoStreamProps {
  title: string
  cameraId: string
  streamUrl?: string
}

export function VideoStream({ title, cameraId, streamUrl = `${process.env.NEXT_PUBLIC_CV_URL || "http://localhost:5001"}/video_feed` }: VideoStreamProps) {
  const [isMuted, setIsMuted] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener("fullscreenchange", onFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error)
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-[#121212] overflow-hidden transition-all duration-300 ${
        isFullscreen ? "w-screen h-screen rounded-none" : "w-full aspect-video rounded-[8px]"
      } border border-[#272727] group`}
    >
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#121212] to-[#181818]">
        
        {!hasError && streamUrl ? (
          <img
            src={streamUrl}
            alt={`Luồng trực tiếp ${title}`}
            className="w-full h-full object-contain"
            onError={() => setHasError(true)} 
            onLoad={() => setHasError(false)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4 select-none">
            <div className="p-4 bg-[#272727] rounded-full text-[#999999] border border-[#333333] animate-pulse">
              <CameraOff className="w-10 h-10" />
            </div>
            <div className="text-center">
              <p className="text-[#ffffff] text-[14px] font-bold tracking-wider">Mất tín hiệu camera</p>
              <p className="text-[#666666] text-[12px] mt-1 uppercase">Camera ID: {cameraId}</p>
            </div>
            <Button 
              size="sm" 
              variant="outline" 
              className="mt-2 bg-[#272727] hover:bg-[#333333] border-none text-[#ffffff] font-bold uppercase tracking-wider text-[11px] rounded-[500px] transition-colors"
              onClick={() => setHasError(false)}
            >
              Thử kết nối lại
            </Button>
          </div>
        )}

        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-[#121212]/80 via-transparent to-transparent flex flex-col justify-end">
          <div className="p-4 flex items-center justify-between w-full">
            <div>
              <h3 className="text-[#ffffff] text-[14px] font-black uppercase tracking-wider">{title}</h3>
              <p className="text-[#1ed760] text-[12px] font-bold">{cameraId}</p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-[#ffffff] hover:bg-[#ffffff]/20 rounded-[500px] h-8 w-8 p-0"
                onClick={() => setIsMuted(!isMuted)}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-[#ffffff] hover:bg-[#ffffff]/20 rounded-[500px] h-8 w-8 p-0"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute top-4 left-4 pointer-events-none select-none">
          <span className={`inline-flex items-center gap-2 px-3 py-1.5 text-[#ffffff] text-[10px] font-black tracking-wider uppercase rounded-[500px] shadow-sm transition-colors ${
            !hasError ? "bg-[#f3727f] animate-none" : "bg-[#272727]"
          }`}>
            <span className={`w-2 h-2 bg-[#ffffff] rounded-full ${!hasError && "animate-ping"}`} />
            {!hasError ? "LIVE" : "OFFLINE"}
          </span>
        </div>

        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 right-4 z-50 bg-[#121212]/80 text-[#ffffff] w-10 h-10 flex items-center justify-center rounded-[500px] hover:bg-[#272727] transition-colors"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}