"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

// ── Reusable: Material Symbol ─────────────────────────────────────────────
function Icon({
  name,
  className = "",
  fill = false,
}: {
  name: string;
  className?: string;
  fill?: boolean;
}) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={
        fill
          ? { fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }
          : undefined
      }
    >
      {name}
    </span>
  );
}

// ── Feature data ──────────────────────────────────────────────────────────
const features = [
  {
    icon: "schedule",
    color: "#38bdf8",
    colorClass: "text-[#38bdf8]",
    hoverBorderClass: "group-hover:border-[#38bdf8]/40",
    hoverGlowClass: "group-hover:shadow-[0_0_20px_rgba(56,189,248,0.2)]",
    hoverTitleClass: "group-hover:text-[#38bdf8]",
    linkClass: "text-[#38bdf8]",
    cornerClass: "bg-[#38bdf8]/5",
    title: "Intelligent TAS",
    desc: "Dynamic quota management and flow allocation to prevent peak-hour congestion. Ensures continuous operational throughput with zero bottlenecks.",
    href: "#tas",
    delay: 0,
  },
  {
    icon: "document_scanner",
    color: "#0ea5e9",
    colorClass: "text-[#0ea5e9]",
    hoverBorderClass: "group-hover:border-[#0ea5e9]/40",
    hoverGlowClass: "group-hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]",
    hoverTitleClass: "group-hover:text-[#0ea5e9]",
    linkClass: "text-[#0ea5e9]",
    cornerClass: "bg-[#0ea5e9]/5",
    title: "AI Smart Gate",
    desc: "Automated Number Plate Recognition (ANPR) triggers barriers instantly, reducing check-in latency from 5 minutes to under 30 seconds.",
    href: "#anpr",
    delay: 100,
  },
  {
    icon: "receipt_long",
    color: "#2dd4bf",
    colorClass: "text-teal-400",
    hoverBorderClass: "group-hover:border-teal-400/40",
    hoverGlowClass: "group-hover:shadow-[0_0_20px_rgba(45,212,191,0.2)]",
    hoverTitleClass: "group-hover:text-teal-400",
    linkClass: "text-teal-400",
    cornerClass: "bg-teal-500/5",
    title: "Digital e-EIR",
    desc: "Automated PDF receipt generation accessible via mobile. Completely eliminates the burden of physical document storage and manual paperwork.",
    href: "#eeir",
    delay: 200,
  },
];

// ── Stats data ────────────────────────────────────────────────────────────
const stats = [
  {
    value: "99.9%",
    label: "System Uptime",
    sub: "Zero downtime during peak hours",
    colorClass: "text-[#38bdf8]",
    fromColor: "from-white",
    toColor: "to-[#38bdf8]",
    glowColor: "rgba(56,189,248,0.3)",
    shadowColor: "rgba(56,189,248,0.08)",
  },
  {
    value: "<50ms",
    label: "API Latency",
    sub: "Hyper-speed data processing",
    colorClass: "text-[#0ea5e9]",
    fromColor: "from-white",
    toColor: "to-[#0ea5e9]",
    glowColor: "rgba(14,165,233,0.3)",
    shadowColor: "rgba(14,165,233,0.08)",
  },
  {
    value: "<1s",
    label: "AI Recognition",
    sub: "Instant plate & container scan",
    colorClass: "text-teal-400",
    fromColor: "from-white",
    toColor: "to-teal-400",
    glowColor: "rgba(45,212,191,0.3)",
    shadowColor: "rgba(45,212,191,0.08)",
  },
];

// ── Timeline steps ────────────────────────────────────────────────────────
const steps = [
  {
    num: "01",
    icon: "login",
    title: "Đặt lịch TAS",
    desc: "Nhà xe đăng nhập và đặt khung giờ vào cảng qua hệ thống TAS thông minh, không cần xếp hàng chờ.",
    color: "#38bdf8",
  },
  {
    num: "02",
    icon: "local_shipping",
    title: "Xe Tiếp Cận Cổng",
    desc: "AI-Camera nhận diện biển số (ANPR) tức thì, barie tự động mở trong vòng 3 giây.",
    color: "#0ea5e9",
  },
  {
    num: "03",
    icon: "fact_check",
    title: "Kiểm Tra & Xếp Dỡ",
    desc: "Hệ thống chỉ định vị trí bãi tối ưu, tài xế nhận hướng dẫn trực tiếp trên mobile.",
    color: "#2dd4bf",
  },
  {
    num: "04",
    icon: "receipt_long",
    title: "Nhận e-EIR",
    desc: "Chứng từ điện tử tự động gửi về mobile và email, hoàn tất toàn bộ thủ công giấy tờ.",
    color: "#818cf8",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
export default function Home() {
  const navRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // ── Scroll reveal ──
    const revealAll = () => {
      document
        .querySelectorAll(".reveal, .reveal-left, .reveal-right")
        .forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight - 80) {
            el.classList.add("active");
          }
        });
    };
    window.addEventListener("scroll", revealAll, { passive: true });
    revealAll();

    // ── Nav background ──
    const onScroll = () => {
      if (!navRef.current) return;
      if (window.scrollY > 30) {
        navRef.current.style.background = "rgba(2, 8, 23, 0.92)";
        navRef.current.style.borderBottomColor = "rgba(56, 189, 248, 0.12)";
      } else {
        navRef.current.style.background = "rgba(2, 8, 23, 0.65)";
        navRef.current.style.borderBottomColor = "rgba(56, 189, 248, 0.06)";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ── 3D tilt ──
    const cont = containerRef.current;
    const card = cardRef.current;
    const onMove = (e: MouseEvent) => {
      if (!cont || !card) return;
      const r = cont.getBoundingClientRect();
      const rx = ((e.clientY - r.top - r.height / 2) / r.height) * -12;
      const ry = ((e.clientX - r.left - r.width / 2) / r.width) * 12;
      card.style.transform = `perspective(1200px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02,1.02,1.02)`;
      card.style.transition = "none";
    };
    const onLeave = () => {
      if (!card) return;
      card.style.transform =
        "perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
      card.style.transition = "transform 0.6s cubic-bezier(0.16,1,0.3,1)";
    };
    cont?.addEventListener("mousemove", onMove);
    cont?.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("scroll", revealAll);
      window.removeEventListener("scroll", onScroll);
      cont?.removeEventListener("mousemove", onMove);
      cont?.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-on-surface overflow-x-hidden">
      {/* ══════════════════════ NAV ══════════════════════ */}
      <nav
        ref={navRef}
        className="fixed top-0 w-full z-50 glass-nav h-[72px] transition-all duration-500"
      >
        <div
          className="flex items-center justify-between h-full mx-auto px-6"
          style={{ maxWidth: "var(--spacing-container-max)" }}
        >
          {/* Logo + Links */}
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-full blur-md group-hover:blur-lg transition-all" />
                <Icon
                  name="hub"
                  className="text-[#38bdf8] text-2xl relative z-10"
                  fill
                />
              </div>
              <span
                className="font-display text-[22px] text-white"
                style={{
                  fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                }}
              >
                LogiPort
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              {["Features", "Pricing", "Support", "Documentation"].map(
                (item, i) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className={`font-label text-[11px] transition-all duration-300 ${
                      i === 0
                        ? "text-[#38bdf8] border-b border-[#38bdf8]/50 pb-0.5"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {item}
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <span className="hidden md:block font-label text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer">
              Tài liệu HD
            </span>
            <Link href="/login">
              <button className="btn-ghost text-xs py-2.5 px-5 cursor-pointer">
                <Icon name="login" className="text-base" />
                Login
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-[72px] overflow-hidden">
        {/* Background mesh */}
        <div className="mesh-bg" />

        {/* Large orb behind hero image */}
        <div className="absolute top-1/4 right-[5%] w-[600px] h-[600px] rounded-full bg-gradient-radial from-sky-500/10 via-sky-800/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-[10%] w-[400px] h-[400px] rounded-full bg-gradient-radial from-teal-500/8 to-transparent blur-3xl pointer-events-none" />

        <div
          className="relative z-10 w-full mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
          style={{ maxWidth: "var(--spacing-container-max)" }}
        >
          {/* ── Left content ── */}
          <div className="space-y-8 reveal-left">
            {/* Badge */}
            <div className="tag-badge w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38bdf8] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38bdf8]" />
              </span>
              LogiPort V2.0 — System Online
            </div>

            {/* Headline */}
            <h1
              className="font-display text-[clamp(2.8rem,6vw,5rem)] text-white"
            >
              Digitize{" "}
              <span className="text-gradient-primary neon-primary">
                Truck Flows
              </span>
              <br />
              Eliminate Manual
              <br />
              <span className="text-white/80">Paperwork</span>
            </h1>

            {/* Sub */}
            <p className="font-body text-[1.05rem] text-slate-400 max-w-lg leading-[1.8]">
              Port Management V2.0 utilizes{" "}
              <span className="text-slate-300">AI Smart Gates (ANPR)</span> and
              intelligent{" "}
              <span className="text-slate-300">TAS scheduling</span> to optimize
              logistics. Experience seamless e-EIR documentation and eliminate
              congestion.
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button className="btn-primary cursor-pointer">
                Initialize System
              </button>
              <button className="btn-ghost cursor-pointer">
                <Icon name="play_circle" className="text-[18px]" />
                View Simulation
              </button>
            </div>

            {/* Micro stats row */}
            <div className="flex gap-8 pt-4 border-t border-white/5">
              {[
                { num: "120+", lab: "Ports connected" },
                { num: "4.2M+", lab: "Trips managed" },
                { num: "99.9%", lab: "Uptime SLA" },
              ].map((s) => (
                <div key={s.lab}>
                  <p
                    className="text-[1.3rem] font-bold text-white"
                    style={{
                      fontFamily:
                        "var(--font-plus-jakarta-sans), sans-serif",
                    }}
                  >
                    {s.num}
                  </p>
                  <p className="font-label text-[10px] text-slate-500 mt-0.5">
                    {s.lab}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Hero image card ── */}
          <div
            ref={containerRef}
            className="relative z-10 perspective-1200 reveal-right"
          >
            {/* Orbit rings decoration */}
            <div
              className="orbit-ring absolute inset-[-40px]"
              style={{ animation: "orbit 20s linear infinite" }}
            />
            <div
              className="orbit-ring absolute inset-[-80px]"
              style={{
                animation: "orbit 35s linear infinite reverse",
                opacity: 0.5,
              }}
            />

            {/* Main card */}
            <div
              ref={cardRef}
              className="relative rounded-2xl p-[3px] animate-float-slow"
              style={{
                background:
                  "linear-gradient(135deg, rgba(56,189,248,0.5) 0%, rgba(56,189,248,0) 40%, rgba(45,212,191,0.3) 100%)",
                boxShadow:
                  "0 0 80px rgba(56,189,248,0.12), 0 24px 80px rgba(0,0,0,0.5)",
              }}
            >
              <div className="rounded-[14px] overflow-hidden relative bg-[#0c1526]">
                {/* Scan line effect */}
                <div className="scan-line" />
                <img
                  alt="High-tech futuristic port management dashboard"
                  className="w-full h-auto object-cover block"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnghNi17Ndl_gcG0JWy8gweM5rfTpOmt_9DiTJRZtIo7bXnSyXk5o1tbmp638tI0TULxImf2y1oeYONsjFI0Sd9gZG9Xsr8xoA9KRJ--xZHfwqGKkWl_TchJeOjNel7dlfo9KJWIcEyAaUHdMjZB4ma5gChByf0co9XuslC0YlcsHjK-odp5LFvrJAVeVOhyzOHwyXE5CiuNPcpyGL7vL4ACrSu5Ayyrrm40k2sEISDqAi5naiE0Bd6UG2ygUOB1qpr1cRRsdlKLTE"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020817]/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating badge: Live tracking */}
              <div
                className="absolute -bottom-5 -left-5 flex items-center gap-3 px-4 py-3 rounded-xl backdrop-blur-xl border border-[#38bdf8]/25 z-20"
                style={{
                  background: "rgba(2, 8, 23, 0.85)",
                  boxShadow:
                    "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.15)",
                }}
              >
                <div className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-[#38bdf8]/10 border border-[#38bdf8]/30">
                  <span className="pulse-ring absolute inset-1 rounded-full" />
                  <Icon name="radar" className="text-[#38bdf8] text-xl" fill />
                </div>
                <div>
                  <p className="font-label text-[9px] text-[#38bdf8] mb-0.5">
                    Live Tracking
                  </p>
                  <p
                    className="text-[15px] font-bold text-white flex items-center gap-1.5"
                    style={{
                      fontFamily:
                        "var(--font-plus-jakarta-sans), sans-serif",
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                    124 Active Units
                  </p>
                </div>
              </div>

              {/* Floating badge: AI Status */}
              <div
                className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-xl border border-teal-400/20 z-20"
                style={{
                  background: "rgba(2, 8, 23, 0.85)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span className="font-label text-[9px] text-teal-400">
                  ANPR Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10">
          <span className="font-label text-[9px] text-slate-600 tracking-widest">
            Scroll to explore
          </span>
          <div className="w-px h-10 bg-gradient-to-b from-[#38bdf8]/40 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section
        id="features"
        className="relative py-28 md:py-36 overflow-hidden"
        style={{ background: "var(--color-surface)" }}
      >
        {/* Top separator glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/40 to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-8 bg-[#38bdf8]/5 blur-xl" />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,189,248,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div
          className="relative z-10 mx-auto px-6"
          style={{ maxWidth: "var(--spacing-container-max)" }}
        >
          {/* Heading */}
          <div className="text-center mb-20 space-y-5 reveal">
            <div className="tag-badge mx-auto w-fit">
              <Icon name="auto_awesome" className="text-sm" />
              Core Capabilities
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-white">
              Automation at Every
              <br />
              <span className="text-gradient-primary">Touchpoint</span>
            </h2>
            <p className="font-body text-slate-400 max-w-xl mx-auto">
              Next-generation technologies designed to streamline every aspect
              of port logistics operations.
            </p>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className={`feature-card group reveal`}
                style={{ transitionDelay: `${f.delay}ms` }}
              >
                {/* Corner decoration */}
                <div
                  className={`absolute top-0 right-0 w-28 h-28 ${f.cornerClass} rounded-bl-full transition-transform duration-500 group-hover:scale-125`}
                />

                {/* Icon */}
                <div
                  className={`card-icon ${f.hoverBorderClass} ${f.hoverGlowClass}`}
                >
                  <Icon name={f.icon} className={`${f.colorClass} text-2xl`} />
                </div>

                <h3
                  className={`font-headline text-xl mb-3 text-white tracking-tight ${f.hoverTitleClass} transition-colors duration-300 relative z-10`}
                >
                  {f.title}
                </h3>
                <p className="font-body text-sm text-slate-400 leading-relaxed relative z-10">
                  {f.desc}
                </p>

                <div className="mt-8 pt-5 border-t border-white/8 relative z-10">
                  <Link
                    href={f.href}
                    className={`${f.linkClass} font-label text-[10px] flex items-center gap-2 group/link w-fit`}
                  >
                    Explore Module
                    <Icon
                      name="arrow_forward"
                      className="text-sm group-hover/link:translate-x-2 transition-transform"
                    />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section className="relative py-28 md:py-36 overflow-hidden bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-3/4 bg-[#38bdf8]/4 blur-[120px] rounded-full" />
          <div className="absolute right-0 top-1/3 w-1/4 h-1/2 bg-teal-500/4 blur-[100px] rounded-full" />
        </div>

        <div
          className="relative z-10 mx-auto px-6"
          style={{ maxWidth: "var(--spacing-container-max)" }}
        >
          <div className="text-center mb-20 space-y-5 reveal">
            <div className="tag-badge mx-auto w-fit">
              <Icon name="route" className="text-sm" />
              Workflow
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-white">
              How{" "}
              <span className="text-gradient-primary">LogiPort</span> Works
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-[2.2rem] left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-[#38bdf8]/20 via-[#38bdf8]/50 to-teal-400/20" />

            {steps.map((step, i) => (
              <div
                key={step.num}
                className="relative text-center reveal"
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                {/* Circle */}
                <div
                  className="relative mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 border-2 z-10"
                  style={{
                    borderColor: `${step.color}40`,
                    background: `${step.color}10`,
                    boxShadow: `0 0 24px ${step.color}20`,
                  }}
                >
                  <Icon
                    name={step.icon}
                    className="text-xl"
                    style={{ color: step.color } as React.CSSProperties}
                  />
                  <span
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center font-label text-[8px] border"
                    style={{
                      background: step.color,
                      color: "#020817",
                      borderColor: step.color,
                    }}
                  >
                    {step.num}
                  </span>
                </div>
                <h4
                  className="font-headline text-[15px] text-white mb-2"
                >
                  {step.title}
                </h4>
                <p className="font-body text-[13px] text-slate-400 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ STATS ══════════════════════ */}
      <section className="relative py-28 md:py-36 overflow-hidden border-y border-white/5">
        {/* Deep dark bg */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(56,189,248,0.06) 0%, #010b18 70%)",
          }}
        />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(56,189,248,0.15) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div
          className="relative z-10 mx-auto px-6 reveal"
          style={{ maxWidth: "var(--spacing-container-max)" }}
        >
          <div className="text-center mb-16 space-y-3">
            <div className="tag-badge mx-auto w-fit">
              <Icon name="monitoring" className="text-sm" />
              Performance Metrics
            </div>
            <h2 className="font-display text-[clamp(1.8rem,3.5vw,3rem)] text-white">
              Built for{" "}
              <span className="text-gradient-primary">Enterprise Scale</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="stat-card reveal group"
                style={{
                  transitionDelay: `${i * 100}ms`,
                  borderColor: "rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[1.25rem]"
                  style={{
                    background: `radial-gradient(ellipse at center, ${s.shadowColor}, transparent 70%)`,
                  }}
                />
                <p
                  className={`font-display text-[4rem] md:text-[4.5rem] bg-gradient-to-b ${s.fromColor} ${s.toColor} bg-clip-text text-transparent relative z-10 transition-transform duration-500 group-hover:scale-105`}
                  style={{
                    filter: `drop-shadow(0 0 16px ${s.glowColor})`,
                  }}
                >
                  {s.value}
                </p>
                <h4 className={`font-label text-xs ${s.colorClass} mb-1 relative z-10`}>
                  {s.label}
                </h4>
                <p className="font-body text-sm text-slate-500 relative z-10">
                  {s.sub}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA BANNER ══════════════════════ */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-900/30 via-background to-teal-900/10" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(56,189,248,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div
          className="relative z-10 mx-auto px-6 text-center reveal"
          style={{ maxWidth: "800px" }}
        >
          <div className="tag-badge mx-auto w-fit mb-6">
            <Icon name="rocket_launch" className="text-sm" />
            Get Started Today
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3.5rem)] text-white mb-6">
            Ready to Transform
            <br />
            <span className="text-gradient-primary">Your Port Operations?</span>
          </h2>
          <p className="font-body text-slate-400 max-w-lg mx-auto mb-10">
            Join hundreds of logistics operators who have already digitized their
            workflow with LogiPort V2.0.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary cursor-pointer">
              Start Free Trial
            </button>
            <button className="btn-ghost cursor-pointer">
              <Icon name="calendar_month" className="text-base" />
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════ FOOTER ══════════════════════ */}
      <footer
        className="relative overflow-hidden border-t border-white/5 pt-20 pb-10"
        style={{ background: "var(--color-surface-container-lowest)" }}
      >
        {/* Top gradient accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-[#38bdf8]/30 to-transparent" />

        <div
          className="relative z-10 mx-auto px-6"
          style={{ maxWidth: "var(--spacing-container-max)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 reveal mb-16">
            {/* Brand col */}
            <div className="space-y-6 md:col-span-1">
              <Link href="/" className="flex items-center gap-2">
                <Icon name="hub" className="text-[#38bdf8] text-xl" fill />
                <span
                  className="text-xl font-bold text-white"
                  style={{
                    fontFamily: "var(--font-plus-jakarta-sans), sans-serif",
                  }}
                >
                  LogiPort
                </span>
              </Link>
              <p className="font-body text-sm text-slate-400 leading-relaxed">
                Elevating port transport management with comprehensive AI and
                cutting-edge automation.
              </p>
              <div className="flex gap-3">
                {["share", "mail", "rss_feed"].map((icon) => (
                  <button
                    key={icon}
                    className="w-9 h-9 rounded-full glass-card flex items-center justify-center text-slate-400 hover:text-[#38bdf8] hover:border-[#38bdf8]/30 hover:shadow-[0_0_12px_rgba(56,189,248,0.2)] transition-all duration-300 cursor-pointer"
                  >
                    <Icon name={icon} className="text-[15px]" />
                  </button>
                ))}
              </div>
            </div>

            {/* Products */}
            <div className="space-y-5">
              <h5 className="font-label text-[10px] text-white/40">Products</h5>
              <ul className="space-y-3">
                {["Features", "Pricing", "Support", "Careers"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`#${item.toLowerCase()}`}
                      className="font-body text-sm text-slate-400 hover:text-[#38bdf8] transition-colors duration-300"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-5">
              <h5 className="font-label text-[10px] text-white/40">Legal</h5>
              <ul className="space-y-3">
                {["Terms of Service", "Privacy Policy", "Contact"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="font-body text-sm text-slate-400 hover:text-[#38bdf8] transition-colors duration-300"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* HQ */}
            <div className="space-y-5">
              <h5 className="font-label text-[10px] text-white/40">HQ</h5>
              <p className="font-body text-sm text-slate-400 leading-relaxed">
                Level 12, Innovation Tower,
                <br />
                Hi-Tech Park, District 9,
                <br />
                Ho Chi Minh City.
              </p>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#38bdf8]/20 text-[#38bdf8] tech-line"
                style={{ background: "rgba(56,189,248,0.05)" }}
              >
                <Icon name="call" className="text-sm" />
                <span className="font-label text-[11px]">1900 6868</span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 reveal">
            <p className="font-label text-[10px] text-slate-600">
              © 2024 LogiPort Solutions. All systems operational.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="font-label text-[10px] text-slate-600">
                All services running
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* ══════════════════════ FAB ══════════════════════ */}
      <div className="fixed bottom-7 right-7 z-40">
        <button
          className="w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 group"
          style={{
            background: "rgba(2,8,23,0.9)",
            border: "1px solid rgba(56,189,248,0.25)",
            boxShadow:
              "0 0 20px rgba(56,189,248,0.15), 0 4px 16px rgba(0,0,0,0.4)",
            backdropFilter: "blur(12px)",
          }}
          onMouseEnter={(e) => {
            const t = e.currentTarget;
            t.style.background = "#38bdf8";
            t.style.borderColor = "#38bdf8";
            t.style.boxShadow = "0 0 30px rgba(56,189,248,0.5)";
          }}
          onMouseLeave={(e) => {
            const t = e.currentTarget;
            t.style.background = "rgba(2,8,23,0.9)";
            t.style.borderColor = "rgba(56,189,248,0.25)";
            t.style.boxShadow =
              "0 0 20px rgba(56,189,248,0.15), 0 4px 16px rgba(0,0,0,0.4)";
          }}
        >
          <Icon name="terminal" className="text-[#38bdf8] text-[18px] group-hover:text-[#020817] transition-colors" />
        </button>
      </div>
    </div>
  );
}
