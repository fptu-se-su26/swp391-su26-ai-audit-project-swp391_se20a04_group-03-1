"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const navRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll Reveal Animation
    function reveal() {
      const reveals = document.querySelectorAll(".reveal");
      for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
          reveals[i].classList.add("active");
        }
      }
    }
    window.addEventListener("scroll", reveal);
    reveal(); // Trigger on load

    // Nav backdrop dynamic blur
    const handleScroll = () => {
      if (navRef.current) {
        if (window.scrollY > 20) {
          navRef.current.style.background = "rgba(2, 6, 23, 0.8)";
          navRef.current.style.borderBottom =
            "1px solid rgba(87, 223, 254, 0.1)";
        } else {
          navRef.current.style.background = "rgba(15, 23, 42, 0.6)";
          navRef.current.style.borderBottom =
            "1px solid rgba(255, 255, 255, 0.05)";
        }
      }
    };
    window.addEventListener("scroll", handleScroll);

    // 3D Tilt effect for hero image
    const container = containerRef.current;
    const card = cardRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (!container || !card) return;
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.transition = "none";
    };

    const handleMouseLeave = () => {
      if (!card) return;
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
      card.style.transition = "transform 0.5s ease";
    };

    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("scroll", reveal);
      window.removeEventListener("scroll", handleScroll);
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md overflow-x-hidden selection:bg-primary/30 selection:text-primary">
      {/* TopNavBar */}
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-50 glass-nav h-20 transition-all duration-300"
      >
        <div className="flex justify-between items-center max-w-container-max mx-auto px-gutter h-full">
          <div className="flex items-center gap-12">
            <Link
              href="/"
              className="font-display-lg text-[28px] font-extrabold tracking-tight text-white flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-primary text-3xl">
                hub
              </span>
              LogiPort
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link
                href="#features"
                className="font-label-sm text-label-sm text-primary uppercase tracking-widest border-b border-primary/50 pb-1 transition-all duration-300"
              >
                Features
              </Link>
              <Link
                href="#pricing"
                className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest hover:text-white transition-colors duration-300"
              >
                Pricing
              </Link>
              <Link
                href="#support"
                className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest hover:text-white transition-colors duration-300"
              >
                Support
              </Link>
              <Link
                href="#docs"
                className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest hover:text-white transition-colors duration-300"
              >
                Documentation
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="hidden md:inline font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest hover:text-white transition-colors cursor-pointer">
              Tài liệu HD
            </span>
            <Link href="/login">
              <button className="px-6 py-2.5 bg-white/10 border border-white/20 text-white font-label-sm text-label-sm uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-white/20 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-sm cursor-pointer">
                Login
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-section-padding-mobile md:pb-section-padding-desktop px-gutter overflow-hidden flex items-center">
        <div className="mesh-bg"></div>
        <div className="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full reveal">
          <div className="space-y-8 z-10 relative">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass-card text-primary font-label-sm text-label-sm uppercase tracking-widest neon-border">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span>LogiPort V2.0 System Online</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg md:text-display-lg leading-[1.1] text-white">
              Digitize{" "}
              <span className="text-transparent bg-clip-text hero-gradient neon-text">
                Truck Flows
              </span>{" "}
              <br />
              Eliminate Manual <br />
              Paperwork
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl font-light">
              Port Management V2.0 utilizes AI Smart Gates (ANPR) and intelligent
              TAS scheduling to optimize logistics. Experience seamless e-EIR
              documentation and eliminate congestion.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 pt-4">
              <button className="px-8 py-4 hero-gradient text-on-primary font-label-sm text-label-sm uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(87,223,254,0.3)] hover:shadow-[0_0_30px_rgba(87,223,254,0.5)] hover:scale-105 transition-all duration-300 cursor-pointer">
                Initialize System
              </button>
              <button className="px-8 py-4 glass-card text-white font-label-sm text-label-sm uppercase tracking-widest rounded-full hover:bg-white/10 transition-colors duration-300 flex items-center justify-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">
                  play_circle
                </span>
                View Simulation
              </button>
            </div>
          </div>
          <div
            ref={containerRef}
            className="relative z-10 perspective-1000"
          >
            <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-secondary/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div
              ref={cardRef}
              className="relative glass-card rounded-2xl p-2 shadow-[0_0_40px_rgba(0,0,0,0.5)] animate-float transform rotate-y-[-5deg] rotate-x-[5deg] neon-border"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent rounded-2xl pointer-events-none"></div>
              <img
                alt="High-tech futuristic port management dashboard"
                className="rounded-xl w-full h-auto object-cover relative z-10"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnghNi17Ndl_gcG0JWy8gweM5rfTpOmt_9DiTJRZtIo7bXnSyXk5o1tbmp638tI0TULxImf2y1oeYONsjFI0Sd9gZG9Xsr8xoA9KRJ--xZHfwqGKkWl_TchJeOjNel7dlfo9KJWIcEyAaUHdMjZB4ma5gChByf0co9XuslC0YlcsHjK-odp5LFvrJAVeVOhyzOHwyXE5CiuNPcpyGL7vL4ACrSu5Ayyrrm40k2sEISDqAi5naiE0Bd6UG2ygUOB1qpr1cRRsdlKLTE"
              />
              <div className="absolute -bottom-8 -left-8 glass-nav p-4 pr-6 rounded-2xl shadow-2xl flex items-center gap-4 border border-primary/30 z-20 backdrop-blur-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/50">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    radar
                  </span>
                </div>
                <div>
                  <p className="font-label-sm text-[10px] text-primary uppercase tracking-widest mb-1">
                    Live Tracking
                  </p>
                  <p className="font-headline-md text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    124 Active Units
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-section-padding-mobile md:py-section-padding-desktop bg-surface px-gutter relative border-t border-white/5"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-20 space-y-4 reveal">
            <h2 className="font-headline-lg text-headline-md md:text-[56px] text-white tracking-tight">
              Core{" "}
              <span className="text-transparent bg-clip-text hero-gradient">
                Capabilities
              </span>
            </h2>
            <p className="font-body-md text-body-lg text-on-surface-variant max-w-2xl mx-auto font-light">
              Next-generation automation technologies designed to streamline every
              aspect of port logistics.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-card p-10 rounded-3xl hover:-translate-y-4 transition-all duration-500 group reveal border-white/5 hover:border-primary/30 hover:shadow-[0_10px_40px_rgba(87,223,254,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110"></div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:border-primary/50 transition-colors">
                <span className="material-symbols-outlined text-primary text-3xl font-light">
                  schedule
                </span>
              </div>
              <h3 className="font-headline-md text-2xl mb-4 text-white tracking-tight group-hover:text-primary transition-colors">
                Intelligent TAS
              </h3>
              <p className="font-body-md text-on-surface-variant font-light leading-relaxed">
                Dynamic quota management and flow allocation to prevent peak hour
                congestion. Ensures continuous operational throughput.
              </p>
              <div className="mt-10 pt-6 border-t border-white/10">
                <Link
                  href="#tas"
                  className="text-primary font-label-sm uppercase tracking-widest flex items-center gap-2 group/link text-[11px]"
                >
                  Explore Module
                  <span className="material-symbols-outlined text-sm group-hover/link:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
            {/* Card 2 */}
            <div
              className="glass-card p-10 rounded-3xl hover:-translate-y-4 transition-all duration-500 group reveal border-white/5 hover:border-primary/30 hover:shadow-[0_10px_40px_rgba(87,223,254,0.1)] relative overflow-hidden"
              style={{ transitionDelay: "100ms" }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110"></div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:border-secondary/50 transition-colors">
                <span className="material-symbols-outlined text-secondary text-3xl font-light">
                  document_scanner
                </span>
              </div>
              <h3 className="font-headline-md text-2xl mb-4 text-white tracking-tight group-hover:text-secondary transition-colors">
                AI Smart Gate
              </h3>
              <p className="font-body-md text-on-surface-variant font-light leading-relaxed">
                Automated Number Plate Recognition (ANPR) triggers barriers
                instantly, reducing check-in latency from 5 minutes to under 30
                seconds.
              </p>
              <div className="mt-10 pt-6 border-t border-white/10">
                <Link
                  href="#anpr"
                  className="text-secondary font-label-sm uppercase tracking-widest flex items-center gap-2 group/link text-[11px]"
                >
                  Explore Module
                  <span className="material-symbols-outlined text-sm group-hover/link:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
            {/* Card 3 */}
            <div
              className="glass-card p-10 rounded-3xl hover:-translate-y-4 transition-all duration-500 group reveal border-white/5 hover:border-primary/30 hover:shadow-[0_10px_40px_rgba(87,223,254,0.1)] relative overflow-hidden"
              style={{ transitionDelay: "200ms" }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-bl-full transition-transform duration-500 group-hover:scale-110"></div>
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-8 border border-white/10 group-hover:border-teal-500/50 transition-colors">
                <span className="material-symbols-outlined text-teal-400 text-3xl font-light">
                  receipt_long
                </span>
              </div>
              <h3 className="font-headline-md text-2xl mb-4 text-white tracking-tight group-hover:text-teal-400 transition-colors">
                Digital e-EIR
              </h3>
              <p className="font-body-md text-on-surface-variant font-light leading-relaxed">
                Automated PDF receipt generation accessible via mobile. Completely
                eliminates the burden of physical document storage.
              </p>
              <div className="mt-10 pt-6 border-t border-white/10">
                <Link
                  href="#eeir"
                  className="text-teal-400 font-label-sm uppercase tracking-widest flex items-center gap-2 group/link text-[11px]"
                >
                  Explore Module
                  <span className="material-symbols-outlined text-sm group-hover/link:translate-x-2 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-section-padding-mobile md:py-section-padding-desktop bg-surface-container-lowest relative overflow-hidden border-y border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="absolute w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 mix-blend-screen"></div>
        <div className="max-w-container-max mx-auto px-gutter relative z-10 reveal">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div className="space-y-4 group">
              <p className="font-display-lg text-[72px] bg-gradient-to-b from-white to-primary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(87,223,254,0.3)] group-hover:scale-110 transition-transform duration-500">
                99.9%
              </p>
              <h4 className="font-label-sm text-sm uppercase tracking-widest text-primary">
                System Uptime
              </h4>
              <p className="text-on-surface-variant font-body-md font-light">
                Zero downtime during peak
              </p>
            </div>
            <div className="space-y-4 group">
              <p className="font-display-lg text-[72px] bg-gradient-to-b from-white to-secondary bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(14,165,233,0.3)] group-hover:scale-110 transition-transform duration-500">
                &lt;50ms
              </p>
              <h4 className="font-label-sm text-sm uppercase tracking-widest text-secondary">
                API Latency
              </h4>
              <p className="text-on-surface-variant font-body-md font-light">
                Hyper-speed data processing
              </p>
            </div>
            <div className="space-y-4 group">
              <p className="font-display-lg text-[72px] bg-gradient-to-b from-white to-teal-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(45,212,191,0.3)] group-hover:scale-110 transition-transform duration-500">
                &lt;1s
              </p>
              <h4 className="font-label-sm text-sm uppercase tracking-widest text-teal-400">
                AI Recognition
              </h4>
              <p className="text-on-surface-variant font-body-md font-light">
                Instant plate & container scanning
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full py-section-padding-mobile md:py-section-padding-desktop relative overflow-hidden">
        <div className="max-w-container-max mx-auto px-gutter relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24 reveal">
            <div className="space-y-8">
              <Link
                href="/"
                className="font-display-lg text-[24px] font-extrabold tracking-tight text-white flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-primary text-2xl">
                  hub
                </span>
                LogiPort
              </Link>
              <p className="font-body-md text-on-surface-variant font-light leading-relaxed">
                Elevating port transport management with comprehensive AI and
                cutting-edge automation.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-primary hover:text-background hover:shadow-[0_0_15px_rgba(87,223,254,0.5)] transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-sm">share</span>
                </div>
                <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-white hover:bg-primary hover:text-background hover:shadow-[0_0_15px_rgba(87,223,254,0.5)] transition-all cursor-pointer">
                  <span className="material-symbols-outlined text-sm">mail</span>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h5 className="font-label-sm text-xs text-white uppercase tracking-widest opacity-50">
                Products
              </h5>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#features"
                    className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href="#pricing"
                    className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="#support"
                    className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
                  >
                    Support
                  </Link>
                </li>
                <li>
                  <Link
                    href="#careers"
                    className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
                  >
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="font-label-sm text-xs text-white uppercase tracking-widest opacity-50">
                Legal
              </h5>
              <ul className="space-y-4">
                <li>
                  <Link
                    href="#terms"
                    className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#privacy"
                    className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="#contact"
                    className="font-body-md text-sm text-on-surface-variant hover:text-primary transition-colors duration-300"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h5 className="font-label-sm text-xs text-white uppercase tracking-widest opacity-50">
                HQ
              </h5>
              <p className="font-body-md text-sm text-on-surface-variant font-light leading-relaxed">
                Level 12, Innovation Tower,
                <br /> Hi-Tech Park, District 9,
                <br /> Ho Chi Minh City.
              </p>
              <p className="font-label-sm text-sm text-primary tracking-widest mt-4">
                SYS.HOTLINE: 1900 6868
              </p>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/5 text-center reveal">
            <p className="font-body-md text-xs text-on-surface-variant/50 uppercase tracking-widest">
              © 2024 LogiPort Solutions. All systems operational.
            </p>
          </div>
        </div>
      </footer>

      {/* FAB */}
      <div className="fixed bottom-8 right-8 z-40">
        <button className="w-14 h-14 rounded-full bg-surface-container-lowest border border-primary/30 text-primary shadow-[0_0_20px_rgba(87,223,254,0.2)] flex items-center justify-center hover:scale-110 hover:bg-primary hover:text-background transition-all duration-300 backdrop-blur-md cursor-pointer">
          <span className="material-symbols-outlined text-2xl font-light">
            terminal
          </span>
        </button>
      </div>
    </div>
  );
}
