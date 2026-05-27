"use client";

import { useEffect, useRef } from "react";
import { Icon } from "./Icon";

/**
 * Navbar — Fixed top navigation with glassmorphism.
 * Background opacity transitions on scroll.
 */
export function Navbar() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const nav = navRef.current;
      if (!nav) return;
      if (window.scrollY > 20) {
        nav.style.background = "rgba(2, 5, 10, 0.85)";
        nav.style.borderBottom = "1px solid rgba(0, 240, 255, 0.2)";
        nav.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.5)";
      } else {
        nav.style.background = "rgba(2, 5, 10, 0.5)";
        nav.style.borderBottom = "1px solid rgba(0, 240, 255, 0.05)";
        nav.style.boxShadow = "none";
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 w-full z-50 glass-nav h-20 transition-all duration-300"
    >
      <div className="flex justify-between items-center max-w-[1280px] mx-auto px-[24px] h-full">
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-12">
          <a
            className="font-display-lg text-[24px] font-extrabold tracking-tight text-white flex items-center gap-3 group"
            href="#"
          >
            <Icon
              name="change_history"
              className="text-primary text-3xl group-hover:rotate-180 transition-transform duration-700"
            />
            <span className="text-gradient font-bold">LogiPort</span>
          </a>

          <div className="hidden md:flex items-center gap-8">
            <a
              className="font-label-sm text-xs text-primary uppercase tracking-widest border-b border-primary pb-1 transition-all duration-300 neon-text-primary"
              href="#"
            >
              Features
            </a>
            <a
              className="font-label-sm text-xs text-slate-400 uppercase tracking-widest hover:text-white transition-all duration-300"
              href="#"
            >
              Pricing
            </a>
            <a
              className="font-label-sm text-xs text-slate-400 uppercase tracking-widest hover:text-white transition-all duration-300"
              href="#"
            >
              Support
            </a>
            <a
              className="font-label-sm text-xs text-slate-400 uppercase tracking-widest hover:text-white transition-all duration-300"
              href="#"
            >
              Documentation
            </a>
          </div>
        </div>

        {/* Login Button */}
        <div className="flex items-center gap-6">
          <button className="px-6 py-2.5 glass-heavy text-primary font-label-sm text-xs uppercase tracking-widest rounded-full transition-all duration-300 hover:bg-primary/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] flex items-center gap-2 magnetic">
            <Icon name="power_settings_new" className="text-[16px]" />
            Login
          </button>
        </div>
      </div>
    </nav>
  );
}
