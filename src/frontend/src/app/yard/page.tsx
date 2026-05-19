"use client";

import VideoStreamingFrame from "@/components/VideoStreamingFrame";

export default function YardPage() {
  const yardCameras = [
    {
      id: "yard-zone-a",
      title: "Parking Lot - Zone A",
      location: "North Entrance",
      streamUrl: "",
      statusInfo: [
        { label: "Occupancy", value: "23/30", color: "green" as const },
        { label: "Temperature", value: "28°C", color: "blue" as const },
        { label: "Status", value: "Normal", color: "green" as const },
      ],
    },
    {
      id: "yard-zone-b",
      title: "Parking Lot - Zone B",
      location: "South Entrance",
      streamUrl: "",
      statusInfo: [
        { label: "Occupancy", value: "18/25", color: "green" as const },
        { label: "Alerts", value: "0", color: "green" as const },
        { label: "Last Vehicle", value: "2 min ago", color: "blue" as const },
      ],
    },
    {
      id: "yard-zone-c",
      title: "Parking Lot - Zone C",
      location: "East Side",
      streamUrl: "",
      statusInfo: [
        { label: "Occupancy", value: "35/40", color: "yellow" as const },
        { label: "Violations", value: "1", color: "red" as const },
        { label: "Status", value: "Review", color: "yellow" as const },
      ],
    },
    {
      id: "yard-zone-d",
      title: "Parking Lot - Zone D",
      location: "West Side",
      streamUrl: "",
      statusInfo: [
        { label: "Occupancy", value: "12/20", color: "green" as const },
        { label: "Available", value: "8 spaces", color: "green" as const },
        { label: "Status", value: "Normal", color: "green" as const },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Parking Lot Monitoring
          </h1>
          <p className="text-text-secondary">
            Real-time video streaming and occupancy management
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-card-bg rounded-lg border border-border">
            <p className="text-text-secondary text-sm mb-1">Total Occupancy</p>
            <p className="text-3xl font-bold text-accent-green">88/115</p>
            <p className="text-xs text-text-secondary mt-1">76% full</p>
          </div>
          <div className="p-4 bg-card-bg rounded-lg border border-border">
            <p className="text-text-secondary text-sm mb-1">Active Cameras</p>
            <p className="text-3xl font-bold text-accent-blue">4</p>
            <p className="text-xs text-text-secondary mt-1">All online</p>
          </div>
          <div className="p-4 bg-card-bg rounded-lg border border-border">
            <p className="text-text-secondary text-sm mb-1">Violations</p>
            <p className="text-3xl font-bold text-danger">1</p>
            <p className="text-xs text-text-secondary mt-1">Requires review</p>
          </div>
          <div className="p-4 bg-card-bg rounded-lg border border-border">
            <p className="text-text-secondary text-sm mb-1">Last Update</p>
            <p className="text-3xl font-bold text-foreground">Now</p>
            <p className="text-xs text-text-secondary mt-1">Real-time</p>
          </div>
        </div>

        {/* Video Streams Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {yardCameras.map((camera) => (
            <VideoStreamingFrame
              key={camera.id}
              title={camera.title}
              location={camera.location}
              streamUrl={camera.streamUrl}
              statusInfo={camera.statusInfo}
            />
          ))}
        </div>

        {/* Additional Information */}
        <div className="mt-8 p-6 bg-card-bg rounded-lg border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            System Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-foreground">All systems operational</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-foreground">Network connectivity: Good</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-foreground">Storage: 87% full</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}