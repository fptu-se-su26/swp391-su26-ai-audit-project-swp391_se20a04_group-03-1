"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

const Shipments = () => {
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
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            
            .glass-card {
                background: rgba(17, 49, 112, 0.4);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .glow-orange {
                box-shadow: 0 0 15px rgba(245, 130, 32, 0.4);
            }
            .glow-green {
                box-shadow: 0 0 15px rgba(90, 223, 130, 0.3);
            }
            .glow-amber {
                box-shadow: 0 0 15px rgba(255, 183, 134, 0.3);
            }
          `,
        }}
      />
      {/* SideNavBar */}
      <aside className="bg-surface-container-highest border-r border-white/5 shadow-2xl docked h-screen w-[260px] fixed left-0 top-0 bottom-0 z-40 flex flex-col pt-20 pb-6">
        <div className="px-6 mb-8 flex flex-col gap-1">
          <h2 className="text-headline-sm font-headline-sm font-black text-on-primary-container leading-tight">
            FPT Yard Management
          </h2>
          <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wide">
            Logistics System v2.1
          </p>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-6 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              dashboard
            </span>
            <span className="text-label-md font-label-md">Dashboard</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-6 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              videocam
            </span>
            <span className="text-label-md font-label-md">Gate Monitor</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-6 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              grid_view
            </span>
            <span className="text-label-md font-label-md">Yard Matrix</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-6 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              inventory_2
            </span>
            <span className="text-label-md font-label-md">Inventory</span>
          </Link>
          <Link
            className="flex items-center gap-3 bg-primary-container/20 text-primary-container border-l-4 border-primary-container px-6 py-3 transition-all"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px] icon-fill">
              local_shipping
            </span>
            <span className="text-label-md font-label-md">Shipments</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-6 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              analytics
            </span>
            <span className="text-label-md font-label-md">Analytics</span>
          </Link>
        </nav>
        <div className="px-4 mt-auto flex flex-col gap-2">
          <button className="w-full bg-primary-container text-white text-label-md font-label-md py-2.5 rounded-lg font-semibold glow-orange hover:brightness-110 transition-all flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">add</span>
            New Shipment
          </button>
          <div className="mt-4 flex flex-col gap-1 pt-4 border-t border-white/5">
            <Link
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-4 py-2 hover:bg-white/5 transition-all duration-200"
              href="#"
            >
              <span className="material-symbols-outlined text-[18px]">
                settings
              </span>
              <span className="text-label-md font-label-md">Settings</span>
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
      </aside>
      {/* TopNavBar */}
      <header className="bg-surface/80 backdrop-blur-lg border-b border-white/10 shadow-md fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 h-16">
        <div className="flex items-center gap-4 w-1/3">
          <span className="text-headline-md font-headline-md font-bold text-primary">
            FPT Logistics
          </span>
        </div>
        <div className="flex-1 flex justify-center">
          <div className="relative w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              className="w-full bg-surface-container border border-white/10 rounded-full py-2 pl-10 pr-4 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-colors"
              placeholder="Search manifest ID, route or vehicle..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 w-1/3 text-primary">
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">
              history
            </span>
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="ml-4 flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-label-md font-label-md text-on-surface">
                Alex Thompson
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                Operations Lead
              </p>
            </div>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0lZFPdfIZY8IjLXkyqRurFmTu4qdheIupLTFyQuL3_gN28UBNm_VRuYu0o-9_m0cnRKY5k8hCWbZScljSf6Y698hWcFD8zXzXyTs7mucM8adDjKckRkRfenVqPqbrDG4sqW1C2kmf8LlErxslqaVU2e5VGb8c87OTaWZNy5A32HK9re_NiPODyC3NEyFjrqwYs5bvYlxtPPSKSofycGlEoL0N_2iHtDlOcwTEbWo8il8UTRhiJlLMfDQteyYvAG1-_HfLtxAtwJc"
                alt="User profile"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>
      {/* Main Content Canvas */}
      <main className="flex-1 ml-[260px] mt-16 p-8 flex flex-col h-[calc(100vh-64px)] overflow-y-auto bg-background custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 flex-shrink-0">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">
              Shipment Management
            </h1>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Real-time logistics tracking and fleet orchestration.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-white/10 rounded-lg text-label-md font-label-md text-on-surface hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-[20px]">
                file_download
              </span>
              Download Manifest
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md font-bold glow-orange hover:brightness-110 transition-all">
              <span className="material-symbols-outlined text-[20px]">
                add_box
              </span>
              New Shipment
            </button>
          </div>
        </div>
        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
          <div className="glass-card p-5 rounded-xl flex flex-col justify-between border-l-4 border-primary">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  local_shipping
                </span>
              </div>
              <span className="text-secondary text-xs font-bold font-mono">
                +12%
              </span>
            </div>
            <div>
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Active Shipments
              </p>
              <h3 className="text-headline-lg font-headline-lg text-primary">
                1,284
              </h3>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "75%" }} />
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl flex flex-col justify-between border-l-4 border-error">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <span className="material-symbols-outlined text-error text-[24px]">
                  timer_off
                </span>
              </div>
              <span className="text-error text-xs font-bold font-mono tracking-widest">
                CRITICAL
              </span>
            </div>
            <div>
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Delayed
              </p>
              <h3 className="text-headline-lg font-headline-lg text-error">
                24
              </h3>
            </div>
            <div className="mt-4 flex gap-1">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-error/40" />
              <span className="w-2 h-2 rounded-full bg-error/40" />
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl flex flex-col justify-between border-l-4 border-tertiary">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-tertiary/10 rounded-lg">
                <span className="material-symbols-outlined text-tertiary text-[24px]">
                  route
                </span>
              </div>
              <span className="text-on-surface-variant text-xs font-medium">
                On Schedule
              </span>
            </div>
            <div>
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                In-Transit
              </p>
              <h3 className="text-headline-lg font-headline-lg text-tertiary">
                842
              </h3>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary text-sm">
                trending_up
              </span>
              <span className="text-xs text-on-surface-variant">
                42 vehicles moving
              </span>
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl flex flex-col justify-between border-l-4 border-secondary">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary text-[24px]">
                  task_alt
                </span>
              </div>
              <span className="text-secondary text-xs font-bold">100%</span>
            </div>
            <div>
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Delivered Today
              </p>
              <h3 className="text-headline-lg font-headline-lg text-secondary">
                156
              </h3>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">
                verified
              </span>
              <span className="text-xs text-on-surface-variant">
                Successful handovers
              </span>
            </div>
          </div>
        </section>
        {/* Main Grid: Table & Monitoring */}
        <div className="grid grid-cols-12 gap-gutter items-start mb-8">
          {/* Table Section */}
          <section className="col-span-12 glass-card rounded-xl overflow-hidden shadow-2xl border border-white/10 xl:col-span-12">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-surface-container/30 backdrop-blur-xl">
              <h3 className="text-headline-sm font-headline-sm text-on-surface">
                Live Shipment Status
              </h3>
              <button className="p-2 bg-surface-container-high rounded-lg border border-white/10 hover:border-primary/50 transition-all text-on-surface">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-highest/50">
                    <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-widest">
                      Shipment ID
                    </th>
                    <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-widest">
                      Type
                    </th>
                    <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-widest">
                      Route
                    </th>
                    <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-widest">
                      ETA
                    </th>
                    <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-widest">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => console.log("Routing to shipment: FPT-992")}
                  >
                    <td className="px-6 py-5 font-mono font-bold text-primary">
                      FPT-992
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-surface-container rounded text-label-md font-label-md text-on-surface border border-white/5">
                        FTL
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-body-sm">
                        <span className="">Chicago</span>
                        <span className="material-symbols-outlined text-primary text-[14px]">
                          trending_flat
                        </span>
                        <span className="">New York</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant font-mono">
                      14:30 PM
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-[10px] font-black uppercase glow-green">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />{" "}
                        IN-TRANSIT
                      </span>
                    </td>
                  </tr>
                  <tr
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => console.log("Routing to shipment: FPT-105")}
                  >
                    <td className="px-6 py-5 font-mono font-bold text-primary">
                      FPT-105
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-surface-container rounded text-label-md font-label-md text-on-surface border border-white/5">
                        LTL
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-body-sm">
                        <span className="">Seattle</span>
                        <span className="material-symbols-outlined text-primary text-[14px]">
                          trending_flat
                        </span>
                        <span className="">Denver</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-error font-mono font-bold">
                      DELAYED (+2h)
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-black uppercase glow-amber">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                        HEAVY TRAFFIC
                      </span>
                    </td>
                  </tr>
                  <tr
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => console.log("Routing to shipment: FPT-821")}
                  >
                    <td className="px-6 py-5 font-mono font-bold text-primary">
                      FPT-821
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-surface-container rounded text-label-md font-label-md text-on-surface border border-white/5">
                        FTL
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-body-sm">
                        <span className="">Miami</span>
                        <span className="material-symbols-outlined text-primary text-[14px]">
                          trending_flat
                        </span>
                        <span className="">Atlanta</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant font-mono">
                      09:15 AM
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-[10px] font-black uppercase glow-green">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />{" "}
                        IN-TRANSIT
                      </span>
                    </td>
                  </tr>
                  <tr
                    className="hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => console.log("Routing to shipment: FPT-443")}
                  >
                    <td className="px-6 py-5 font-mono font-bold text-primary">
                      FPT-443
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 bg-surface-container rounded text-label-md font-label-md text-on-surface border border-white/5">
                        FTL
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-body-sm">
                        <span className="">Austin</span>
                        <span className="material-symbols-outlined text-primary text-[14px]">
                          trending_flat
                        </span>
                        <span className="">Phoenix</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant font-mono">
                      18:00 PM
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-tertiary/40 bg-tertiary/10 text-tertiary text-[10px] font-black uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />{" "}
                        DEPARTED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          {/* Right Monitor Column */}
        </div>
      </main>
    </div>
  );
};

export default Shipments;
