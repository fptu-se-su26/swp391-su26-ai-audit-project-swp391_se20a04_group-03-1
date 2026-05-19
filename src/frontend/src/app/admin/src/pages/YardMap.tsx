import React from "react";
import Link from "next/link";
import Image from "next/image";

const YardMap = () => {
  return (
    <div className="bg-background text-on-surface h-screen w-screen overflow-hidden flex font-sans">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .material-symbols-outlined {
                font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
            .icon-fill {
                font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
            }
            /* Custom scrollbar for tech feel */
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
          `,
        }}
      />
      <header className="bg-surface/80 dark:bg-surface/80 backdrop-blur-lg border-b border-white/10 shadow-md fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4 w-1/3">
          <span className="text-headline-md font-headline-md font-bold text-primary-container dark:text-primary">
            FPT Logistics
          </span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              className="w-full bg-surface-container border border-white/10 rounded-full py-2 pl-10 pr-4 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 transition-colors"
              placeholder="Search yard, vehicles..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 w-1/3 text-primary dark:text-primary-fixed-dim">
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">settings</span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="ml-4 h-8 w-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuAI-LM8mfpMK_UwOOiSxPcJ4Qd5fdjPlqD5ECGW-8oGJ5pd0ml6X6hW01W552Z9TlDyaMubbE_nH2FWHuZ0J0F-jhKFpDVsSzwCvBrJU_JT8X1DRxEd49mTNAPIlyK8WeHrOX-KJMd28WHpJzII08CcxI8q-yQXkfE_kVJC975mIjnml1KLkZ-U1hzBTQZFxob8VWd5994U-ou1MQ9SNWOjUirSxKdsGtLaRdJhim6NQSOR0xJNpDVGiyHveBNxVJOF-g810y9U4U"
              alt="User profile"
              width={32}
              height={32}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>
      {/* SideNavBar */}
      <nav className="bg-surface-container-highest dark:bg-surface-container-highest border-r border-white/5 shadow-2xl docked left-0 h-screen w-[260px] fixed left-0 top-0 bottom-0 z-40 flex flex-col pt-20 pb-6 flex-shrink-0">
        <div className="px-6 mb-8 flex flex-col gap-1">
          <h2 className="text-headline-sm font-headline-sm font-black text-on-primary-container">
            FPT Yard Management
          </h2>
          <p className="text-label-md font-label-md text-on-surface-variant">
            Enterprise Logistics
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-1">
          {/* Inactive */}
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-4 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              dashboard
            </span>
            <span className="text-label-md font-label-md">Dashboard</span>
          </Link>
          {/* Active */}
          <Link
            className="flex items-center gap-3 bg-primary-container/20 text-primary-container border-l-4 border-primary-container px-4 py-3 opacity-80 duration-150 scale-[0.98] transition-transform"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px] icon-fill">
              map
            </span>
            <span className="text-label-md font-label-md">Yard Map</span>
          </Link>
          {/* Inactive */}
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-4 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              inventory_2
            </span>
            <span className="text-label-md font-label-md">Inventory</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-4 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              local_shipping
            </span>
            <span className="text-label-md font-label-md">Shipments</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-4 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              analytics
            </span>
            <span className="text-label-md font-label-md">Analytics</span>
          </Link>
        </div>
        <div className="px-4 mt-auto flex flex-col gap-2">
          <button className="w-full bg-primary-container text-white text-label-md font-label-md py-2.5 rounded-lg font-semibold hover:shadow-[0_0_15px_rgba(245,130,32,0.4)] transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Shipment
          </button>
          <div className="mt-4 flex flex-col gap-1 pt-4 border-t border-white/5">
            <Link
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-4 py-2 hover:bg-white/5 transition-all duration-200"
              href="#"
            >
              <span className="material-symbols-outlined text-[18px]">
                help
              </span>
              <span className="text-label-md font-label-md">Help Center</span>
            </Link>
            <Link
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-4 py-2 hover:bg-white/5 transition-all duration-200"
              href="#"
            >
              <span className="material-symbols-outlined text-[18px]">
                logout
              </span>
              <span className="text-label-md font-label-md">Logout</span>
            </Link>
          </div>
        </div>
      </nav>
      {/* Main Content Area */}
      <main className="flex-1 ml-[260px] mt-16 p-md flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-background">
        {/* Header */}
        <div className="flex justify-between items-end mb-md flex-shrink-0">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">
              Smart Gate Monitoring
            </h1>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Real-time AI surveillance and automated logging for Gate Alpha.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="px-3 py-1 rounded-full bg-secondary-container/10 border border-secondary text-secondary flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-secondary" />
              <span className="text-label-md font-label-md">System Online</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-surface-container border border-white/10 text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">
                visibility
              </span>
              <span className="text-label-md font-label-md">Live View</span>
            </div>
          </div>
        </div>
        {/* 2 Column Split */}
        <div className="flex-1 grid grid-cols-12 gap-gutter min-h-0">
          {/* Left: Simulated Camera Feed (col-span-8) */}
          <div className="col-span-8 bg-surface-container border border-white/5 rounded-xl overflow-hidden relative flex flex-col shadow-lg backdrop-blur-md">
            {/* Overlay Header */}
            <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[20px]">
                    videocam
                  </span>
                  <span className="text-headline-sm font-headline-sm font-bold text-white tracking-wide">
                    CAM_01: GATE ALPHA INBOUND
                  </span>
                </div>
                <span className="text-label-md font-label-md text-white/70 font-mono">
                  REC // 4K 60FPS // AI_TRACKING_ACTIVE
                </span>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className="text-headline-md font-headline-md font-mono text-secondary tracking-wider">
                  14:22:05:19
                </span>
                <span className="text-label-md font-label-md text-white/50">
                  2023-10-27
                </span>
              </div>
            </div>
            {/* Technical Overlays (Reticle/Grid) */}
            <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between">
              {/* Corner Brackets */}
              <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-white/20" />
              <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-white/20" />
              <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-white/20" />
              <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-white/20" />
              {/* Center Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-primary-container rounded-full shadow-[0_0_8px_#f58220]" />
                <div className="absolute w-full h-[1px] bg-white/10" />
                <div className="absolute h-full w-[1px] bg-white/10" />
              </div>
            </div>
            {/* Simulated Scanning Line (Static per constraints, represents high-tech scan) */}
            <div className="absolute top-1/3 left-0 w-full h-[2px] bg-secondary z-20 shadow-[0_0_20px_#5adf82,0_0_5px_#5adf82] opacity-80 pointer-events-none" />
            {/* Scan Bounding Box on a detected vehicle */}
            <div className="absolute top-1/4 left-1/4 w-[40%] h-[40%] border-2 border-secondary z-20 pointer-events-none flex flex-col justify-end p-2 bg-secondary/5">
              <div className="bg-surface/80 backdrop-blur-sm self-start px-2 py-1 border border-secondary text-secondary text-label-md font-label-md font-mono">
                TRUCK ID: FPT-992 // SCAN: VERIFIED
              </div>
            </div>
            {/* Feed Image */}
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAeQqmW_aBqGHl9Npj9gZWytPrcQ9t1-w_zXpT8UHkkl8g4F2Sm57HOxp5s1UO7kqj4rBWNLqEOrYVM3qcTBKaUouyYuf78gCZmwbVbNTcQaKvR28QcdQo0YoUEKGXPgSiH4DNcvfxNiueSV37yWnfhRx64pxX3ufdmKfQ0RPtYf3wvnispmo2AonkoALeckW8mUqTGK5WsQA9k78XRaZ-mzy56iFUZ01f5P-W9TdrLIpLhplLNkr_I1_5uHI68LVUANCwYayRD8som"
              alt="Logistics Gate Camera View"
              fill
              className="w-full h-full object-cover filter brightness-75 contrast-125 grayscale-[30%]"
            />
            {/* Bottom Status Bar */}
            <div className="absolute bottom-0 left-0 right-0 z-10 p-3 bg-surface-container-highest border-t border-white/10 flex justify-between items-center text-label-md font-label-md text-on-surface-variant font-mono">
              <div className="flex gap-4">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 bg-secondary rounded-full" /> Lidar:
                  Nominal
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 bg-secondary rounded-full" /> ANPR:
                  Active
                </span>
              </div>
              <span>BANDWIDTH: 14.2 MB/s</span>
            </div>
          </div>
          {/* Right: Infinite Scroll Log (col-span-4) */}
          <div className="col-span-4 bg-surface-container-high border border-white/5 rounded-xl flex flex-col shadow-lg backdrop-blur-md overflow-hidden">
            {/* Log Header */}
            <div className="p-4 border-b border-white/10 bg-surface-container flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-container text-[20px]">
                  format_list_bulleted
                </span>
                <h3 className="text-headline-sm font-headline-sm text-on-surface">
                  Live Event Stream
                </h3>
              </div>
              <button className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-on-surface-variant transition-colors border border-white/10">
                <span className="material-symbols-outlined text-[18px]">
                  filter_list
                </span>
              </button>
            </div>
            {/* Log List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {/* New Item (Fail State - High Alert) */}
              <div className="bg-error-container/20 border border-error/50 rounded-lg p-3 relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-error">
                    <span className="material-symbols-outlined icon-fill text-[18px]">
                      warning
                    </span>
                    <span className="text-label-md font-label-md font-bold uppercase tracking-wider">
                      Exception Detected
                    </span>
                  </div>
                  <span className="text-label-md font-label-md text-on-surface-variant font-mono">
                    14:22:01
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-6">
                  <span className="text-body-md font-body-md text-on-surface font-mono">
                    PLATE: UNKNOWN
                  </span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">
                    Weight mismatch detected. Discrepancy &gt; 5%. Access
                    Denied.
                  </span>
                </div>
              </div>
              {/* Pass Item (Recent) */}
              <div className="bg-secondary-container/10 border border-secondary/30 rounded-lg p-3 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-secondary shadow-[0_0_10px_#5adf82]" />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-secondary">
                    <span className="material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                    <span className="text-label-md font-label-md font-bold uppercase tracking-wider">
                      Cleared
                    </span>
                  </div>
                  <span className="text-label-md font-label-md text-on-surface-variant font-mono">
                    14:20:45
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-6">
                  <div className="flex justify-between items-center">
                    <span className="text-body-md font-body-md text-on-surface font-mono">
                      FPT-992 / LTL Freight
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface text-on-surface-variant border border-white/10">
                      BAY 04
                    </span>
                  </div>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">
                    Manifest verified. Driver auth successful.
                  </span>
                </div>
              </div>
              {/* Pass Item */}
              <div className="bg-surface-container border border-white/5 rounded-lg p-3 relative hover:bg-white/5 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                    <span className="text-label-md font-label-md font-bold uppercase tracking-wider">
                      Cleared
                    </span>
                  </div>
                  <span className="text-label-md font-label-md text-on-surface-variant font-mono">
                    14:15:12
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-6">
                  <span className="text-body-md font-body-md text-on-surface font-mono">
                    TRK-401 / Intermodal
                  </span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">
                    Routine exit. Seal intact.
                  </span>
                </div>
              </div>
              {/* Pass Item */}
              <div className="bg-surface-container border border-white/5 rounded-lg p-3 relative hover:bg-white/5 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">
                      check_circle
                    </span>
                    <span className="text-label-md font-label-md font-bold uppercase tracking-wider">
                      Cleared
                    </span>
                  </div>
                  <span className="text-label-md font-label-md text-on-surface-variant font-mono">
                    14:02:55
                  </span>
                </div>
                <div className="flex flex-col gap-1 pl-6">
                  <span className="text-body-md font-body-md text-on-surface font-mono">
                    FPT-881 / FTL
                  </span>
                  <span className="text-body-sm font-body-sm text-on-surface-variant">
                    Inbound verified. Assigned Bay 12.
                  </span>
                </div>
              </div>
              {/* Loading/Skeleton indicator for infinite scroll */}
              <div className="py-4 flex justify-center items-center">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full opacity-50" />
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full opacity-70" />
                  <div className="w-1.5 h-1.5 bg-on-surface-variant rounded-full opacity-30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default YardMap;
