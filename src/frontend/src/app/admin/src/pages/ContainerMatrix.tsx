import React from "react";
import Link from "next/link";

const ContainerMatrix = () => {
  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen overflow-hidden flex">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .material-symbols-outlined {
                font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
            .material-symbols-outlined[style*="FILL' 1"] {
                font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
            
            /* Custom scrollbar for matrix grid */
            .matrix-scroll::-webkit-scrollbar {
                width: 8px;
                height: 8px;
            }
            .matrix-scroll::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.02);
                border-radius: 4px;
            }
            .matrix-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 4px;
            }
            .matrix-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.2);
            }
          `,
        }}
      />
      {/* SideNavBar Component */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 flex flex-col pt-20 pb-6 bg-surface-container-highest shadow-2xl border-r border-white/5 h-screen w-[260px] hidden md:flex">
        {/* Header */}
        <div className="px-6 mb-8 flex flex-col gap-2">
          <h1 className="text-headline-sm font-headline-sm font-black text-on-primary-container">
            FPT Yard Management
          </h1>
          <p className="text-label-md font-label-md text-on-surface-variant">
            Enterprise Logistics
          </p>
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 flex flex-col gap-1 px-2">
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:bg-white/5 transition-all duration-200 px-4 py-3 rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-label-md font-label-md">Dashboard</span>
          </Link>
          {/* Active State: Yard Map */}
          <Link
            className="flex items-center gap-3 bg-primary-container/20 text-primary-container border-l-4 border-primary-container px-4 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              map
            </span>
            <span className="text-label-md font-label-md">Yard Map</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:bg-white/5 transition-all duration-200 px-4 py-3 rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span className="text-label-md font-label-md">Inventory</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:bg-white/5 transition-all duration-200 px-4 py-3 rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">local_shipping</span>
            <span className="text-label-md font-label-md">Shipments</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:bg-white/5 transition-all duration-200 px-4 py-3 rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-label-md font-label-md">Analytics</span>
          </Link>
        </nav>
        {/* CTA */}
        <div className="px-6 my-6">
          <button className="w-full bg-primary-container text-on-primary-container text-label-md font-label-md py-3 rounded-lg hover:shadow-[0_0_15px_rgba(245,130,32,0.4)] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined">add</span>
            New Shipment
          </button>
        </div>
        {/* Footer Links */}
        <div className="px-2 mt-auto border-t border-white/5 pt-4">
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:bg-white/5 transition-all duration-200 px-4 py-3 rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">help</span>
            <span className="text-label-md font-label-md">Help Center</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:bg-white/5 transition-all duration-200 px-4 py-3 rounded-lg"
            href="#"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-label-md font-label-md">Logout</span>
          </Link>
        </div>
      </aside>
      {/* Main Content Canvas */}
      <main className="ml-0 md:ml-[260px] flex-1 h-screen flex flex-col bg-background relative z-0">
        {/* Ambient Background Glows */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-primary-container/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-tertiary/5 blur-[100px] rounded-full pointer-events-none" />
        <div className="p-md flex-1 flex flex-col gap-md relative z-10 h-full overflow-hidden">
          {/* Header & Toolbar Area */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container/60 backdrop-blur-xl border border-white/10 rounded-xl p-sm shadow-lg">
            <div>
              <h2 className="text-headline-md font-headline-md text-on-surface">
                Grid Matrix View
              </h2>
              <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                Real-time container allocation and drop zones.
              </p>
            </div>
            {/* Filters & Controls */}
            <div className="flex flex-wrap items-center gap-sm">
              <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-lg px-3 py-2 focus-within:border-primary-container focus-within:shadow-[0_0_10px_rgba(245,130,32,0.2)] transition-all">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  view_module
                </span>
                <select className="bg-transparent border-none text-label-md font-label-md text-on-surface focus:ring-0 p-0 cursor-pointer">
                  <option className="bg-surface text-on-surface" value="A">
                    Block Alpha
                  </option>
                  <option className="bg-surface text-on-surface" value="B">
                    Block Beta
                  </option>
                  <option className="bg-surface text-on-surface" value="C">
                    Block Gamma
                  </option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-surface border border-white/10 rounded-lg px-3 py-2 focus-within:border-primary-container focus-within:shadow-[0_0_10px_rgba(245,130,32,0.2)] transition-all">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  view_week
                </span>
                <select className="bg-transparent border-none text-label-md font-label-md text-on-surface focus:ring-0 p-0 cursor-pointer">
                  <option className="bg-surface text-on-surface" value="all">
                    All Bays
                  </option>
                  <option className="bg-surface text-on-surface" value="1-10">
                    Bays 01-10
                  </option>
                  <option className="bg-surface text-on-surface" value="11-20">
                    Bays 11-20
                  </option>
                </select>
              </div>
              <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />
              {/* Legend */}
              <div className="flex items-center gap-4 text-label-md font-label-md">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm border border-white/10 bg-surface/30" />
                  <span className="text-on-surface-variant">Empty</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-surface-variant border border-white/20" />
                  <span className="text-on-surface-variant">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-primary-container shadow-[0_0_8px_rgba(245,130,32,0.5)]" />
                  <span className="text-on-surface-variant">Drop Zone</span>
                </div>
              </div>
            </div>
          </header>
          {/* 2D Grid Matrix Container */}
          <div className="flex-1 bg-surface-container-lowest/80 backdrop-blur-2xl border border-white/5 rounded-xl shadow-2xl flex flex-col overflow-hidden relative">
            {/* Inner Scrollable Area */}
            <div className="flex-1 overflow-auto matrix-scroll p-md relative">
              {/* The Matrix CSS Grid */}
              {/* Layout: 1 column for row headers + 12 columns for slots */}
              <div className="grid grid-cols-[auto_repeat(10,_minmax(80px,_1fr))] gap-base min-w-[900px]">
                {/* Top Header Row (Column Labels) */}
                <div className="h-8" /> {/* Empty corner cell */}
                <div className="flex justify-center items-end pb-2 text-label-md font-label-md text-on-surface-variant/60">
                  B01
                </div>
                <div className="flex justify-center items-end pb-2 text-label-md font-label-md text-on-surface-variant/60">
                  B02
                </div>
                <div className="flex justify-center items-end pb-2 text-label-md font-label-md text-on-surface-variant/60">
                  B03
                </div>
                <div className="flex justify-center items-end pb-2 text-label-md font-label-md text-on-surface-variant/60">
                  B04
                </div>
                <div className="flex justify-center items-end pb-2 text-label-md font-label-md text-on-surface-variant/60">
                  B05
                </div>
                <div className="flex justify-center items-end pb-2 text-label-md font-label-md text-on-surface-variant/60">
                  B06
                </div>
                <div className="flex justify-center items-end pb-2 text-label-md font-label-md text-on-surface-variant/60">
                  B07
                </div>
                <div className="flex justify-center items-end pb-2 text-label-md font-label-md text-on-surface-variant/60">
                  B08
                </div>
                <div className="flex justify-center items-end pb-2 text-label-md font-label-md text-on-surface-variant/60">
                  B09
                </div>
                <div className="flex justify-center items-end pb-2 text-label-md font-label-md text-on-surface-variant/60">
                  B10
                </div>
                {/* Row 1 */}
                <div className="flex justify-end items-center pr-4 text-label-md font-label-md text-on-surface-variant/60">
                  R1
                </div>
                {/* Occupied */}
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative group">
                  <span className="text-label-md font-label-md text-on-surface">
                    TRX-091
                  </span>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-secondary-container/50 rounded-b" />
                </div>
                {/* Empty */}
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R1-B02
                  </span>
                </div>
                {/* Occupied */}
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    HLC-442
                  </span>
                </div>
                {/* Occupied */}
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    MSC-119
                  </span>
                </div>
                {/* Empty */}
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R1-B05
                  </span>
                </div>
                {/* Empty */}
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R1-B06
                  </span>
                </div>
                {/* SIMULATED ACTION STATE: Dropping Container */}
                <div className="aspect-[4/3] bg-primary-container text-on-primary-container rounded flex flex-col items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(245,130,32,0.6)] border border-primary-fixed relative z-10">
                  <span className="material-symbols-outlined mb-1 text-[20px]">
                    file_download
                  </span>
                  <span className="text-label-md font-label-md font-bold">
                    DROPPING
                  </span>
                </div>
                {/* Empty */}
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R1-B08
                  </span>
                </div>
                {/* Occupied */}
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    CMA-881
                  </span>
                </div>
                {/* Occupied */}
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    ZIM-002
                  </span>
                </div>
                {/* Row 2 */}
                <div className="flex justify-end items-center pr-4 text-label-md font-label-md text-on-surface-variant/60">
                  R2
                </div>
                {/* Empty */}
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R2-B01
                  </span>
                </div>
                {/* Empty */}
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R2-B02
                  </span>
                </div>
                {/* Occupied */}
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    HLC-443
                  </span>
                </div>
                {/* Occupied */}
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    MSC-120
                  </span>
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-error/50 rounded-b" />{" "}
                  {/* Issue status indicator */}
                </div>
                {/* Occupied */}
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    EGL-772
                  </span>
                </div>
                {/* Occupied */}
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    EGL-773
                  </span>
                </div>
                {/* Empty */}
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R2-B07
                  </span>
                </div>
                {/* Empty */}
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R2-B08
                  </span>
                </div>
                {/* Occupied */}
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    CMA-882
                  </span>
                </div>
                {/* Empty */}
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R2-B10
                  </span>
                </div>
                {/* Row 3 (Faded out for brevity in example, mimicking more rows) */}
                <div className="flex justify-end items-center pr-4 text-label-md font-label-md text-on-surface-variant/60">
                  R3
                </div>
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    OOC-991
                  </span>
                </div>
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R3-B02
                  </span>
                </div>
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R3-B03
                  </span>
                </div>
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    MSC-121
                  </span>
                </div>
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R3-B05
                  </span>
                </div>
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R3-B06
                  </span>
                </div>
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R3-B07
                  </span>
                </div>
                <div className="aspect-[4/3] border border-white/10 border-dashed rounded flex items-center justify-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-colors group">
                  <span className="text-label-md font-label-md text-white/20 group-hover:text-white/40">
                    R3-B08
                  </span>
                </div>
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    CMA-883
                  </span>
                </div>
                <div className="aspect-[4/3] bg-surface-variant border border-white/20 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-surface-bright transition-colors relative">
                  <span className="text-label-md font-label-md text-on-surface">
                    ZIM-004
                  </span>
                </div>
              </div>
            </div>
            {/* Bottom Information Bar */}
            <div className="bg-surface/50 border-t border-white/5 p-4 flex justify-between items-center text-label-md font-label-md text-on-surface-variant backdrop-blur-md">
              <div className="flex gap-6">
                <span>
                  Block Capacity:{" "}
                  <strong className="text-on-surface">78%</strong>
                </span>
                <span>
                  Total Slots: <strong className="text-on-surface">300</strong>
                </span>
                <span>
                  Available: <strong className="text-secondary">66</strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  sync
                </span>
                <span className="text-primary">Live Sync Active</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContainerMatrix;
