import React from 'react';

const Dashboard = () => {
  return (
    <>
      {/* Tailwind Theme Config - In a real Next.js v14+ project, you'd place these in globals.css using @theme inline or tailwind.config.ts */}
      {/* Google Fonts: Hanken Grotesk & Material Symbols */}
      <link href="https://fonts.googleapis.com" rel="preconnect" />
      <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
      <link
        href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700;900&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />
      
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Shared utilities for styling */
            .glass-card {
                background-color: rgba(17, 49, 112, 0.5); /* surface-container-highest */
                backdrop-filter: blur(16px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .glow-text {
                text-shadow: 0 0 15px rgba(245, 130, 32, 0.4);
            }
            .glow-button {
                box-shadow: 0 0 15px rgba(245, 130, 32, 0.4);
            }
          `
        }}
      />

      <div className="bg-background text-on-surface antialiased min-h-screen font-body-md overflow-x-hidden">
        {/* TopNavBar */}
        <nav className="fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 h-16 bg-surface/80 dark:bg-surface/80 backdrop-blur-lg border-b border-white/10 shadow-md">
          {/* Brand & Search Container */}
          <div className="flex items-center gap-md">
            {/* Brand visible on mobile, hidden on desktop where sidebar shows it */}
            <div className="md:hidden font-headline-md text-headline-md font-bold text-primary-container dark:text-primary">
              FPT Logistics
            </div>
            {/* Search Bar (on_left) */}
            <div className="relative hidden sm:block w-64 md:ml-[260px] pl-6 transition-all">
              <span className="material-symbols-outlined absolute left-9 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                className="w-full bg-surface-container border border-white/10 rounded-full py-2 pl-10 pr-4 text-body-sm font-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container/50 transition-colors placeholder:text-on-surface-variant"
                placeholder="Search yards, vehicles..."
                type="text"
              />
            </div>
          </div>
          {/* Trailing Actions */}
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:bg-white/5 transition-colors p-2 rounded-full">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                notifications
              </span>
            </button>
            <button className="text-on-surface-variant hover:bg-white/5 transition-colors p-2 rounded-full">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                settings
              </span>
            </button>
            <button className="text-on-surface-variant hover:bg-white/5 transition-colors p-2 rounded-full hidden sm:block">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
                help
              </span>
            </button>
            {/* Profile Image */}
            <div className="h-8 w-8 rounded-full bg-surface-variant border border-white/10 overflow-hidden ml-2 cursor-pointer border-2 border-transparent hover:border-primary-container transition-colors">
              <img
                alt="User profile"
                className="w-full h-full object-cover"
                data-alt="A professional headshot of a corporate logistics manager in a modern, well-lit office setting. The individual is wearing a crisp business suit. The lighting is soft and natural, emphasizing a trustworthy and authoritative persona, aligning with the corporate modern aesthetic of an enterprise software platform."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjqYASDhwH6IuZ2Lj3ZWFNDHbKhzHLBSgsNCU3TeJMmFvoG1J4L-swSBxlWploZNdt9ZBP9PH7YGmAG6sn8oZc5mCXHgQKkolCR8ynbC-7KmgN5Y2H0-6XCeCmtjz6u6tA12_z1SSjnqbpxlR8gZfOEwRKkzgp0_896PDgH1fj3rnMBaAFuki6LTXgG2XWGLmhRVcIkuv3W-qvVAuIbBQf0odEZs-ZEjFp4RvazBlvJh5wNwSZdl9T7lkSrNj57nm2zo1jOuWEXyuo"
              />
            </div>
          </div>
        </nav>
        {/* SideNavBar (Hidden on Mobile) */}
        <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 flex-col pt-20 pb-6 w-[260px] bg-surface-container-highest dark:bg-surface-container-highest border-r border-white/5 shadow-2xl">
          {/* Header / Identity */}
          <div className="px-6 mb-8 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-lg bg-surface-container-low flex items-center justify-center mb-3 border border-white/10 shadow-lg">
              <span className="material-symbols-outlined text-primary-container text-2xl">
                local_shipping
              </span>
            </div>
            <h2 className="font-headline-sm text-headline-sm font-black text-on-primary-container">
              FPT Yard Management
            </h2>
            <p className="font-label-md text-label-md text-on-surface-variant mt-1 uppercase tracking-wider">
              Enterprise Logistics
            </p>
          </div>
          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col gap-1 px-2">
            {/* Active: Dashboard */}
            <a
              className="flex items-center gap-3 bg-primary-container/20 text-primary-container border-l-4 border-primary-container px-4 py-3 rounded-r-lg scale-[0.98] transition-transform"
              href="#"
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                dashboard
              </span>
              <span className="font-label-md text-label-md">Dashboard</span>
            </a>
            <a
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 px-4 py-3 rounded-lg border-l-4 border-transparent"
              href="#"
            >
              <span className="material-symbols-outlined">map</span>
              <span className="font-label-md text-label-md">Yard Map</span>
            </a>
            <a
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 px-4 py-3 rounded-lg border-l-4 border-transparent"
              href="#"
            >
              <span className="material-symbols-outlined">inventory_2</span>
              <span className="font-label-md text-label-md">Inventory</span>
            </a>
            <a
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 px-4 py-3 rounded-lg border-l-4 border-transparent"
              href="#"
            >
              <span className="material-symbols-outlined">local_shipping</span>
              <span className="font-label-md text-label-md">Shipments</span>
            </a>
            <a
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 px-4 py-3 rounded-lg border-l-4 border-transparent"
              href="#"
            >
              <span className="material-symbols-outlined">analytics</span>
              <span className="font-label-md text-label-md">Analytics</span>
            </a>
          </nav>
          {/* CTA Action */}
          <div className="px-6 mt-auto mb-6">
            <button className="w-full bg-primary-container text-white font-label-md text-label-md py-3 rounded-lg glow-button hover:bg-primary transition-colors flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">add</span>
              New Shipment
            </button>
          </div>
          {/* Footer Links */}
          <div className="px-2 border-t border-white/5 pt-4">
            <a
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 px-4 py-2 rounded-lg"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">help</span>
              <span className="font-label-md text-label-md">Help Center</span>
            </a>
            <a
              className="flex items-center gap-3 text-on-surface-variant hover:text-on-surface hover:bg-white/5 transition-all duration-200 px-4 py-2 rounded-lg"
              href="#"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="font-label-md text-label-md">Logout</span>
            </a>
          </div>
        </aside>
        {/* Main Content Canvas */}
        <main className="md:ml-[260px] pt-24 p-6 lg:p-margin-desktop min-h-screen">
          {/* Page Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface">Dashboard</h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-1">
                Real-time overview of yard operations and vehicle flow.
              </p>
            </div>
            {/* Quick Date Filter */}
            <div className="flex items-center gap-2 bg-surface-container-high border border-white/10 rounded-lg p-1">
              <button className="px-4 py-1.5 rounded-md bg-surface-variant text-on-surface font-label-md text-label-md shadow-sm">
                Today
              </button>
              <button className="px-4 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">
                Week
              </button>
              <button className="px-4 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors">
                Month
              </button>
            </div>
          </div>
          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Stat Widget 1: Vehicle Count */}
            <div className="col-span-1 md:col-span-4 glass-card rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-primary-container">
                  directions_car
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary-container/10 flex items-center justify-center border border-primary-container/30">
                  <span className="material-symbols-outlined text-primary-container">
                    directions_car
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface-variant">
                  Vehicle Count
                </h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-[56px] leading-tight font-black text-primary glow-text">
                  142
                </span>
                <span className="font-label-md text-label-md text-secondary-fixed bg-secondary-fixed/10 px-2 py-0.5 rounded border border-secondary-fixed/20 flex items-center">
                  <span className="material-symbols-outlined text-[14px] mr-1">trending_up</span>{" "}
                  12%
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                Currently in yard
              </p>
            </div>
            {/* Stat Widget 2: Dwell Time */}
            <div className="col-span-1 md:col-span-4 glass-card rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-on-surface">
                  schedule
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-surface-container-low flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-on-surface">schedule</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface-variant">
                  Avg. Dwell Time
                </h3>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-headline-xl text-[56px] leading-tight font-bold text-on-surface">
                  4.2
                </span>
                <span className="font-body-lg text-body-lg text-on-surface-variant">hrs</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                Across all zones
              </p>
            </div>
            {/* Stat Widget 3: Gate Activity */}
            <div className="col-span-1 md:col-span-4 glass-card rounded-xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <span className="material-symbols-outlined text-6xl text-tertiary">
                  swap_horiz
                </span>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-tertiary/10 flex items-center justify-center border border-tertiary/30">
                  <span className="material-symbols-outlined text-tertiary">swap_horiz</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface-variant">
                  Gate Activity
                </h3>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="font-label-md text-label-md text-on-surface-variant mb-1">
                    INBOUND
                  </div>
                  <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
                    89
                  </div>
                </div>
                <div className="h-8 w-[1px] bg-white/10 mx-4" />
                <div>
                  <div className="font-label-md text-label-md text-on-surface-variant mb-1">
                    OUTBOUND
                  </div>
                  <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
                    64
                  </div>
                </div>
              </div>
            </div>
            {/* Main Chart Area */}
            <div className="col-span-1 md:col-span-8 glass-card rounded-xl p-6 flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">
                    Vehicle Traffic
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Hourly inflow vs outflow
                  </p>
                </div>
                <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-white/5 rounded-full transition-colors">
                  <span className="material-symbols-outlined">more_vert</span>
                </button>
              </div>
              {/* CSS Simulated Recharts Line Chart */}
              <div className="flex-1 relative border-l border-b border-white/10 mt-4 flex items-end px-2 pb-2 gap-2">
                {/* Y-Axis Labels (Simulated) */}
                <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-on-surface-variant font-label-md h-full py-2">
                  <span>100</span>
                  <span>75</span>
                  <span>50</span>
                  <span>25</span>
                  <span>0</span>
                </div>
                {/* Data Points / Gradient Area Simulation */}
                <div className="w-full h-full relative overflow-hidden flex items-end">
                  {/* Simulated Gradient Fill under line */}
                  <div
                    className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-primary-container/5 to-primary-container/20 border-t-2 border-primary glow-button rounded-t-[100%] opacity-80"
                    style={{
                      clipPath:
                        "polygon(0 100%, 10% 80%, 30% 90%, 50% 40%, 70% 60%, 90% 20%, 100% 30%, 100% 100%)"
                    }}
                  />
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                    <div className="border-t border-white/5 w-full" />
                    <div className="border-t border-white/5 w-full" />
                    <div className="border-t border-white/5 w-full" />
                    <div className="border-t border-white/5 w-full" />
                  </div>
                </div>
                {/* X-Axis Labels (Simulated) */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-on-surface-variant font-label-md px-4">
                  <span>08:00</span>
                  <span>10:00</span>
                  <span>12:00</span>
                  <span>14:00</span>
                  <span>16:00</span>
                  <span>18:00</span>
                </div>
              </div>
            </div>
            {/* Secondary List / Insights */}
            <div className="col-span-1 md:col-span-4 glass-card rounded-xl p-6 flex flex-col h-[400px]">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-6">
                Recent Alerts
              </h2>
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
                {/* Alert Item 1 */}
                <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="h-8 w-8 rounded-full bg-error-container/20 flex items-center justify-center shrink-0 border border-error/30 mt-1">
                    <span className="material-symbols-outlined text-error text-sm">warning</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-base text-on-surface">
                      Dock 4 Congestion
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      Vehicle wait time exceeding 45 minutes at loading dock 4.
                    </p>
                    <span className="font-label-md text-[10px] text-on-surface-variant mt-1 block">
                      10 mins ago
                    </span>
                  </div>
                </div>
                {/* Alert Item 2 */}
                <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="h-8 w-8 rounded-full bg-tertiary/10 flex items-center justify-center shrink-0 border border-tertiary/30 mt-1">
                    <span className="material-symbols-outlined text-tertiary text-sm">info</span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-base text-on-surface">
                      Scheduled Maintenance
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      Gate B will be closed for routine sensor calibration at 14:00.
                    </p>
                    <span className="font-label-md text-[10px] text-on-surface-variant mt-1 block">
                      1 hr ago
                    </span>
                  </div>
                </div>
                {/* Alert Item 3 */}
                <div className="flex gap-4 items-start p-3 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                  <div className="h-8 w-8 rounded-full bg-secondary-fixed/10 flex items-center justify-center shrink-0 border border-secondary-fixed/30 mt-1">
                    <span className="material-symbols-outlined text-secondary-fixed text-sm">
                      check_circle
                    </span>
                  </div>
                  <div>
                    <h4 className="font-headline-sm text-base text-on-surface">
                      Shipment Cleared
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                      High priority shipment BOL-9921 has exited the yard successfully.
                    </p>
                    <span className="font-label-md text-[10px] text-on-surface-variant mt-1 block">
                      2 hrs ago
                    </span>
                  </div>
                </div>
              </div>
              <button className="w-full mt-4 py-2 border border-white/10 rounded-lg text-on-surface-variant font-label-md text-label-md hover:bg-white/5 transition-colors">
                View All Alerts
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;
