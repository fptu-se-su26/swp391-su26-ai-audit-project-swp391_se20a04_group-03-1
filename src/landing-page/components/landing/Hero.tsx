"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./Icon";

/**
 * Hero — Full-viewport hero section with particle background, 3D tilt card,
 * holo-frame image, and all associated effects.
 */
export function Hero() {
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate Background Particles
    const container = particlesRef.current;
    if (!container) return;

    for (let i = 0; i < 30; i++) {
      const particle = document.createElement("div");
      particle.className = "data-particle";
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(particle);
    }

    // Parallax on mouse move
    const onMouseMove = (e: MouseEvent) => {
      if (!container) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      container.style.transform = `translate(${x}px, ${y}px)`;
    };

    document.addEventListener("mousemove", onMouseMove);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      // Clean up particles
      while (container.querySelector(".data-particle")) {
        container.querySelector(".data-particle")?.remove();
      }
    };
  }, []);

  return (
    <section className="relative min-h-screen pt-32 pb-[64px] md:pb-[120px] px-[24px] overflow-hidden flex items-center">
      {/* Background with particles, stars, scanline */}
      <div className="data-stream-bg" ref={particlesRef}>
        <div className="stars" />
        <div className="scanline" />
      </div>

      {/* Content Grid */}
      <div className="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full reveal">
        {/* Left Column — Text Content */}
        <div className="space-y-8 z-10 relative lg:col-span-5">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-heavy text-primary font-label-sm text-[10px] uppercase tracking-widest neon-border-primary backdrop-blur-md transition-all hover:scale-105 duration-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
            </span>
            <span>LogiPort V2.0 System Online</span>
          </div>

          {/* Headline */}
          <h1 className="font-display-lg text-[48px] md:text-[72px] leading-[1.1] text-white font-bold">
            Digitize <br />
            <span className="text-transparent bg-clip-text text-gradient neon-text-primary shimmer font-bold">
              Truck Flows
            </span>{" "}
            <br />
            Eliminate <br />
            Manual Paperwork
          </h1>

          {/* Description */}
          <p className="font-body-lg text-lg text-slate-300 max-w-xl font-light border-l-2 border-primary/50 pl-4 bg-gradient-to-r from-primary/5 to-transparent py-2">
            Port Management V2.0 utilizes AI Smart Gates (ANPR) and intelligent
            TAS scheduling to optimize logistics. Experience seamless e-EIR
            documentation and eliminate congestion.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 pt-4">
            <button className="pulse-btn btn-shimmer-effect px-8 py-4 hero-gradient text-black font-headline-md text-sm uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_40px_rgba(0,240,255,0.6)] transition-all duration-300 font-bold flex items-center justify-center gap-2 magnetic">
              <Icon name="rocket_launch" />
              INITIALIZE SYSTEM
            </button>
            <button className="px-8 py-4 glass-heavy text-white font-label-sm text-sm uppercase tracking-widest rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 neon-border-secondary magnetic">
              <Icon
                name="visibility"
                className="text-[20px] text-[#3b82f6]"
              />
              VIEW SIMULATION
            </button>
          </div>
        </div>

        {/* Right Column — Hero Image with Holo Frame */}
        <div className="relative z-10 lg:col-span-7 mt-12 lg:mt-0"
             style={{ perspective: "1000px" }}>
          {/* Ambient Glow Orbs */}
          <div
            className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none animate-pulse"
            style={{ animationDuration: "4s" }}
          />
          <div
            className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#d946ef]/20 rounded-full blur-[100px] pointer-events-none animate-pulse"
            style={{ animationDuration: "6s" }}
          />

          {/* Holo Frame */}
          <div
            className="holo-frame shadow-[0_0_50px_rgba(0,240,255,0.2)]"
            style={{
              transform: "perspective(1000px) rotateY(-10deg) rotateX(5deg)",
            }}
          >
            <div className="relative rounded-2xl overflow-hidden bg-surface">
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent pointer-events-none z-20 mix-blend-overlay" />

              {/* Holographic Grid */}
              <div
                className="absolute inset-0 z-10 pointer-events-none opacity-50"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(0,240,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,0.05) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Laser Scan Line */}
              <div className="laser-scan-line" />

              {/* Dashboard Image */}
              <img
                alt="High-tech futuristic port management dashboard"
                className="w-full h-auto object-cover relative z-0 opacity-90 transition-transform duration-700 hover:scale-105"
                src="https://lh3.googleusercontent.com/aida/ADBb0uhC2FRDhc85ARnxHiDi4EjVFRY5q0XC8boFjUDzsQrBHE8Jdr0SP7zGNieIJVY__RYzfNwfbYcNIny0-QtnTRPC2SkW8xvYBAJcxjPRmq8CD5QRNdCNXvIN937HSJonsdMCpQ7MIsL1BsXo74s5_hxDKm2PrLP-28xEFvVmS47wlJAIeXHanqF4e7DjaWNvZigYesCEljfTnlMvHl7-gi9BUOH6w0mIGf0lCGSkdHqYlMqxUxba7zOXJjVr"
              />

              {/* REC Indicator */}
              <div className="absolute top-4 left-4 z-30 glass-heavy px-3 py-1.5 rounded-md flex items-center gap-2 border-primary/50">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="font-headline-md text-[10px] text-white tracking-widest uppercase font-bold">
                  REC
                </span>
              </div>

              {/* Live Feed Card */}
              <div className="absolute bottom-4 right-4 z-30 glass-heavy p-4 rounded-xl shadow-2xl flex flex-col gap-2 border border-primary/50 backdrop-blur-xl min-w-[200px] hover:scale-105 transition-transform duration-300">
                <div className="flex items-center justify-between mb-2 border-b border-white/10 pb-2">
                  <Icon
                    name="radar"
                    className="text-primary text-sm animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                  <span className="font-headline-md text-[10px] text-primary uppercase tracking-widest font-bold">
                    Live Feed
                  </span>
                </div>
                <div className="flex items-end gap-3">
                  <p className="font-display-lg text-3xl font-bold text-white neon-text-primary">
                    124
                  </p>
                  <p className="font-label-sm text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                    Active Units
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
