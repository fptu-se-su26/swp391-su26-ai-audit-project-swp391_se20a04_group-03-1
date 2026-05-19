"use client";

import { useState } from "react";

interface VideoStreamingFrameProps {
  title: string;
  location: string;
  streamUrl?: string;
  isLive?: boolean;
  statusInfo?: {
    label: string;
    value: string;
    color?: "green" | "red" | "yellow" | "blue";
  }[];
  onFullscreen?: () => void;
}

export default function VideoStreamingFrame({
  title,
  location,
  streamUrl,
  isLive = true,
  statusInfo = [],
  onFullscreen,
}: VideoStreamingFrameProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (color?: string) => {
    switch (color) {
      case "green":
        return "bg-green-500";
      case "red":
        return "bg-red-500";
      case "yellow":
        return "bg-yellow-500";
      case "blue":
        return "bg-blue-500";
      default:
        return "bg-accent-green";
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-card-bg rounded-lg border border-border shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-text-secondary">{location}</p>
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1 bg-danger/20 rounded-full">
              <div className="w-2 h-2 bg-danger rounded-full animate-pulse"></div>
              <span className="text-xs font-semibold text-danger">LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Video Stream Container */}
      <div
        className={`relative bg-black rounded-lg overflow-hidden transition-all duration-300 ${
          isExpanded ? "aspect-auto h-96" : "aspect-video"
        }`}
      >
        {streamUrl ? (
          <iframe
            src={streamUrl}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <svg
              className="w-16 h-16 text-accent-green opacity-50 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-text-secondary text-center">
              Camera stream loading...
            </p>
            <p className="text-xs text-text-secondary mt-2">
              {streamUrl ? "Connecting..." : "No stream available"}
            </p>
          </div>
        )}

        {/* Video Controls Overlay */}
        <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/60 to-transparent flex justify-between items-center">
          <div className="flex gap-2">
            <button className="p-2 bg-accent-blue/20 hover:bg-accent-blue/40 rounded transition-colors">
              <svg
                className="w-5 h-5 text-accent-blue"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z" />
              </svg>
            </button>
          </div>
          <button
            onClick={onFullscreen || (() => setIsExpanded(!isExpanded))}
            className="p-2 bg-accent-green/20 hover:bg-accent-green/40 rounded transition-colors"
          >
            <svg
              className="w-5 h-5 text-accent-green"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
            </svg>
          </button>
        </div>

        {/* Detection Box (optional) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-32 h-24 border-2 border-accent-green rounded-lg"></div>
        </div>
      </div>

      {/* Status Information */}
      {statusInfo.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {statusInfo.map((info, idx) => (
            <div
              key={idx}
              className="p-3 bg-background rounded-lg border border-border"
            >
              <p className="text-xs text-text-secondary mb-1">{info.label}</p>
              <div className="flex items-center gap-2">
                {info.color && (
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      info.color
                    )}`}
                  ></div>
                )}
                <p className="text-sm font-semibold text-foreground">
                  {info.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Info Bar */}
      <div className="flex items-center justify-between text-xs text-text-secondary border-t border-border pt-3">
        <span>Last update: Just now</span>
        <span>Resolution: 1920×1080</span>
      </div>
    </div>
  );
}