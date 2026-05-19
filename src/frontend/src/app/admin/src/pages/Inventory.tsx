"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const Inventory = () => {
  const [activeTab, setActiveTab] = useState("All");

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
            ::-webkit-scrollbar { width: 6px; }
            ::-webkit-scrollbar-track { background: transparent; }
            ::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            ::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
            
            .glass-card {
                background: rgba(17, 49, 112, 0.4);
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .glow-orange {
                box-shadow: 0 0 15px rgba(245, 130, 32, 0.4);
            }
          `,
        }}
      />
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
              placeholder="Search container ID, owner, or status..."
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
                Alex Chen
              </p>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">
                Supervisor
              </p>
            </div>
            <div className="h-8 w-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuAI-LM8mfpMK_UwOOiSxPcJ4Qd5fdjPlqD5ECGW-8oGJ5pd0ml6X6hW01W552Z9TlDyaMubbE_nH2FWHuZ0J0F-jhKFpDVsSzwCvBrJU_JT8X1DRxEd49mTNAPIlyK8WeHrOX-KJMd28WHpJzII08CcxI8q-yQXkfE_kVJC975mIjnml1KLkZ-U1hzBTQZFxob8VWd5994U-ou1MQ9SNWOjUirSxKdsGtLaRdJhim6NQSOR0xJNpDVGiyHveBNxVJOF-g810y9U4U"
                alt="User profile"
                width={32}
                height={32}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>
      {/* SideNavBar */}
      <aside className="bg-surface-container-highest border-r border-white/5 shadow-2xl docked h-screen w-[260px] fixed left-0 top-0 bottom-0 z-40 flex flex-col pt-20 pb-6">
        <div className="px-6 mb-8 flex flex-col gap-1">
          <h2 className="text-headline-sm font-headline-sm font-black text-on-primary-container">
            FPT Yard Management
          </h2>
          <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wide">
            Enterprise Logistics
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
            <span className="material-symbols-outlined text-[20px]">map</span>
            <span className="text-label-md font-label-md">Yard Map</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-6 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
              videocam
            </span>
            <span className="text-label-md font-label-md">
              Smart Gate Monitoring
            </span>
          </Link>
          <Link
            className="flex items-center gap-3 bg-primary-container/20 text-primary-container border-l-4 border-primary-container px-6 py-3 transition-all"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px] icon-fill">
              inventory_2
            </span>
            <span className="text-label-md font-label-md">Inventory</span>
          </Link>
          <Link
            className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface px-6 py-3 hover:bg-white/5 transition-all duration-200"
            href="#"
          >
            <span className="material-symbols-outlined text-[20px]">
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
      </aside>
      {/* Main Content Canvas */}
      <main className="flex-1 ml-[260px] mt-16 p-8 flex flex-col h-[calc(100vh-64px)] overflow-y-auto bg-background custom-scrollbar">
        {/* Header */}
        <div className="flex justify-between items-end mb-8 flex-shrink-0">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface">
              Inventory Overview
            </h1>
            <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
              Real-time status of all active terminal assets.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-high border border-white/10 rounded-lg text-label-md font-label-md text-on-surface hover:bg-white/5 transition-all">
              <span className="material-symbols-outlined text-[20px]">
                file_download
              </span>
              Export CSV
            </button>
            <button className="flex items-center gap-2 px-5 py-2 bg-primary text-on-primary rounded-lg text-label-md font-label-md font-bold glow-orange hover:brightness-110 transition-all">
              <span className="material-symbols-outlined text-[20px]">
                add_box
              </span>
              Add Inventory
            </button>
          </div>
        </div>
        {/* KPIs */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-8">
          <div className="glass-card p-5 rounded-xl flex flex-col justify-between border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <span className="material-symbols-outlined text-primary text-[24px]">
                  inventory
                </span>
              </div>
              <span className="text-secondary text-xs font-bold font-mono">
                +2.4%
              </span>
            </div>
            <div>
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Total Containers
              </p>
              <h3 className="text-headline-lg font-headline-lg text-on-surface">
                12,842
              </h3>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "82%" }} />
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl flex flex-col justify-between border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <span className="material-symbols-outlined text-secondary text-[24px]">
                  view_in_ar
                </span>
              </div>
              <span className="text-secondary text-xs font-bold font-mono">
                -0.5%
              </span>
            </div>
            <div>
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Empty Units
              </p>
              <h3 className="text-headline-lg font-headline-lg text-on-surface">
                3,120
              </h3>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-secondary" style={{ width: "45%" }} />
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl flex flex-col justify-between border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-tertiary/10 rounded-lg">
                <span className="material-symbols-outlined text-tertiary text-[24px]">
                  ac_unit
                </span>
              </div>
              <span className="text-primary text-xs font-bold font-mono">
                +12%
              </span>
            </div>
            <div>
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Refrigerator Units
              </p>
              <h3 className="text-headline-lg font-headline-lg text-on-surface">
                942
              </h3>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-tertiary" style={{ width: "68%" }} />
            </div>
          </div>
          <div className="glass-card p-5 rounded-xl flex flex-col justify-between border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <span className="material-symbols-outlined text-error text-[24px]">
                  warning
                </span>
              </div>
              <span className="text-error text-xs font-bold">HIGH</span>
            </div>
            <div>
              <p className="text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                Dangerous Goods
              </p>
              <h3 className="text-headline-lg font-headline-lg text-on-surface">
                156
              </h3>
            </div>
            <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-error" style={{ width: "15%" }} />
            </div>
          </div>
        </section>
        {/* Inventory Table Section */}
        <section className="glass-card rounded-xl overflow-hidden shadow-2xl border border-white/10 mb-8">
          <div className="p-4 border-b border-white/10 flex flex-wrap gap-4 items-center justify-between bg-surface-container/30 backdrop-blur-xl">
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-white/5">
              <button
                onClick={() => setActiveTab("All")}
                className={`px-5 py-1.5 rounded-md text-label-md font-bold transition-all ${activeTab === "All" ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("General")}
                className={`px-5 py-1.5 rounded-md text-label-md font-semibold transition-all ${activeTab === "General" ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                General
              </button>
              <button
                onClick={() => setActiveTab("Special")}
                className={`px-5 py-1.5 rounded-md text-label-md font-semibold transition-all ${activeTab === "Special" ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Special
              </button>
              <button
                onClick={() => setActiveTab("Overdue")}
                className={`px-5 py-1.5 rounded-md text-label-md font-semibold transition-all ${activeTab === "Overdue" ? "bg-primary text-on-primary shadow-lg" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Overdue
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-on-surface-variant text-label-md">
                <span className="material-symbols-outlined text-[18px]">
                  filter_list
                </span>
                Sort by:{" "}
                <span className="text-on-surface font-bold cursor-pointer">
                  Last Update
                </span>
              </div>
              <button className="p-2 bg-surface-container-high rounded-lg border border-white/10 hover:border-primary/50 transition-all text-on-surface">
                <span className="material-symbols-outlined">more_vert</span>
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-highest/50">
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    Container ID
                  </th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    Last Update
                  </th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-label-md font-label-md text-on-surface-variant uppercase tracking-wider text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-on-surface">
                    MSKU-928471
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-surface-container rounded text-label-md font-label-md text-on-surface">
                      Standard 40'
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body-sm">Maersk Line</td>
                  <td className="px-6 py-4 text-label-md font-mono text-on-surface-variant">
                    2023-10-24 08:45 AM
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-secondary/40 bg-secondary/10 text-secondary text-[10px] font-black uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />{" "}
                      Clean
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-on-surface-variant hover:text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        edit
                      </span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:text-on-surface">
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-on-surface">
                    HJCU-103952
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-surface-container rounded text-label-md font-label-md text-tertiary">
                      Reefer 20'
                    </span>
                  </td>
                  <td className="px-6 py-4 text-body-sm">Hanjin</td>
                  <td className="px-6 py-4 text-label-md font-mono text-on-surface-variant">
                    2023-10-24 10:12 AM
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-primary/40 bg-primary/10 text-primary text-[10px] font-black uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />{" "}
                      Needs Inspection
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-on-surface-variant hover:text-primary">
                      <span className="material-symbols-outlined text-[20px]">
                        edit
                      </span>
                    </button>
                    <button className="p-2 text-on-surface-variant hover:text-on-surface">
                      <span className="material-symbols-outlined text-[20px]">
                        visibility
                      </span>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 bg-surface-container-highest/30 border-t border-white/5 flex items-center justify-between">
            <p className="text-label-md font-label-md text-on-surface-variant">
              Showing 1 to 2 of 12,842 containers
            </p>
            <div className="flex gap-2">
              <button className="p-2 bg-surface-container-low border border-white/10 rounded hover:bg-white/5 text-on-surface">
                <span className="material-symbols-outlined text-[18px]">
                  chevron_left
                </span>
              </button>
              <button className="px-3 py-1 bg-primary text-on-primary font-bold rounded text-label-md">
                1
              </button>
              <button className="px-3 py-1 bg-surface-container-low border border-white/10 rounded hover:bg-white/5 text-on-surface text-label-md">
                2
              </button>
              <button className="p-2 bg-surface-container-low border border-white/10 rounded hover:bg-white/5 text-on-surface">
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </button>
            </div>
          </div>
        </section>
        {/* Heatmap and Service section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter pb-10">
          <div className="lg:col-span-2 glass-card rounded-xl p-6 border border-white/10 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h4 className="text-headline-sm font-headline-sm text-on-surface">
                  Terminal Occupancy
                </h4>
                <p className="text-body-sm font-body-sm text-on-surface-variant mt-1">
                  Real-time heat map of yard zones
                </p>
              </div>
              <span
                className="material-symbols-outlined text-primary"
                data-icon="map"
              >
                map
              </span>
            </div>
            <div className="h-48 w-full bg-surface-container-low rounded-lg relative overflow-hidden border border-white/5">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-4 gap-1 p-2">
                <div className="bg-primary/60 rounded-sm" />
                <div className="bg-primary/20 rounded-sm" />
                <div className="bg-secondary/40 rounded-sm" />
                <div className="bg-primary/80 rounded-sm" />
                <div className="bg-primary/10 rounded-sm" />
                <div className="bg-secondary/10 rounded-sm" />
                <div className="bg-primary/40 rounded-sm" />
                <div className="bg-primary/30 rounded-sm" />
                <div className="bg-primary/20 rounded-sm" />
                <div className="bg-primary/50 rounded-sm" />
                <div className="bg-error/40 rounded-sm" />
                <div className="bg-primary/20 rounded-sm" />
                <div className="bg-primary/30 rounded-sm" />
                <div className="bg-secondary/20 rounded-sm" />
                <div className="bg-primary/90 rounded-sm border border-primary glow-orange" />
                <div className="bg-primary/10 rounded-sm" />
              </div>
              <div className="absolute bottom-2 right-2 flex gap-3 p-1 px-2 bg-surface/80 backdrop-blur rounded text-[10px] text-on-surface-variant uppercase font-bold tracking-widest border border-white/5">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary" /> Free
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Mod
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-error" /> Full
                </span>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-6 border border-white/10">
            <h4 className="text-headline-sm font-headline-sm text-on-surface mb-6">
              Upcoming Service
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-surface-container-high/50 rounded-lg border-l-4 border-primary">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-xl">
                    engineering
                  </span>
                </div>
                <div>
                  <p className="text-label-md font-label-md text-on-surface font-bold">
                    REEF-9214 Inspection
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase">
                    Zone B-4 • 2 hours left
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 bg-surface-container-high/50 rounded-lg border-l-4 border-tertiary">
                <div className="w-10 h-10 rounded-full bg-tertiary/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-tertiary text-xl">
                    content_paste
                  </span>
                </div>
                <div>
                  <p className="text-label-md font-label-md text-on-surface font-bold">
                    ZIM-3382 Cleaning
                  </p>
                  <p className="text-[10px] text-on-surface-variant font-mono uppercase">
                    Zone A-12 • 5 hours left
                  </p>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-2 border border-white/10 rounded-lg text-label-md font-label-md text-on-surface hover:bg-white/5 transition-all">
              View Schedule
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Inventory;
