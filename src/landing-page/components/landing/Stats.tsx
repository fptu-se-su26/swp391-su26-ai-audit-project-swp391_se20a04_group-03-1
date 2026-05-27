/**
 * Stats — Mission Critical Metrics section with three stat cards,
 * each featuring energy halos and neon glow effects.
 */
export function Stats() {
  return (
    <section className="py-[64px] md:py-[120px] bg-surface-container-lowest relative overflow-hidden border-y border-primary/20">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

      {/* Grid pattern overlay */}
      <div
        className="absolute w-full h-full opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,240,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="max-w-[1280px] mx-auto px-[24px] relative z-10 reveal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-16">
          {/* Stat 1 — System Uptime */}
          <div className="glass-heavy p-8 rounded-xl text-center group relative overflow-hidden magnetic cursor-default">
            <div className="energy-halo-primary" />
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/50 group-hover:bg-primary group-hover:shadow-[0_0_15px_#00f0ff] transition-all" />
            <p className="font-display-lg text-[64px] text-white neon-text-primary group-hover:scale-110 transition-transform duration-500 font-black relative z-10">
              99.9%
            </p>
            <h4 className="font-headline-md text-sm uppercase tracking-widest text-primary mt-2 mb-2 font-bold relative z-10">
              SYSTEM UPTIME
            </h4>
            <p className="text-slate-400 font-body-md text-sm font-light uppercase relative z-10">
              Zero downtime during peak
            </p>
          </div>

          {/* Stat 2 — API Latency */}
          <div
            className="glass-heavy p-8 rounded-xl text-center group relative overflow-hidden magnetic cursor-default"
            style={{ transitionDelay: "150ms" }}
          >
            <div className="energy-halo-secondary" />
            <div className="absolute top-0 left-0 w-full h-1 bg-[#3b82f6]/50 group-hover:bg-[#3b82f6] group-hover:shadow-[0_0_15px_#3b82f6] transition-all" />
            <p
              className="font-display-lg text-[64px] text-white group-hover:scale-110 transition-transform duration-500 font-black relative z-10"
              style={{
                textShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
              }}
            >
              &lt;50ms
            </p>
            <h4 className="font-headline-md text-sm uppercase tracking-widest text-[#3b82f6] mt-2 mb-2 font-bold relative z-10">
              API LATENCY
            </h4>
            <p className="text-slate-400 font-body-md text-sm font-light uppercase relative z-10">
              Hyper-speed data processing
            </p>
          </div>

          {/* Stat 3 — AI Recognition */}
          <div
            className="glass-heavy p-8 rounded-xl text-center group relative overflow-hidden magnetic cursor-default"
            style={{ transitionDelay: "300ms" }}
          >
            <div className="energy-halo-tertiary" />
            <div className="absolute top-0 left-0 w-full h-1 bg-[#d946ef]/50 group-hover:bg-[#d946ef] group-hover:shadow-[0_0_15px_#d946ef] transition-all" />
            <p
              className="font-display-lg text-[64px] text-white group-hover:scale-110 transition-transform duration-500 font-black relative z-10"
              style={{
                textShadow: "0 0 15px rgba(217, 70, 239, 0.5)",
              }}
            >
              &lt;1s
            </p>
            <h4 className="font-headline-md text-sm uppercase tracking-widest text-[#d946ef] mt-2 mb-2 font-bold relative z-10">
              AI RECOGNITION
            </h4>
            <p className="text-slate-400 font-body-md text-sm font-light uppercase relative z-10">
              Instant plate &amp; container scanning
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
