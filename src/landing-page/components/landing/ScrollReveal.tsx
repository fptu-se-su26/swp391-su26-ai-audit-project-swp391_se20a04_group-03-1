"use client";

import { useEffect } from "react";

/**
 * ScrollReveal — Activates `.reveal` elements on scroll using an
 * IntersectionObserver for performance.
 */
export function ScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

    // Initial trigger for elements already in viewport
    setTimeout(() => {
      document.querySelectorAll(".reveal").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight - 100) {
          el.classList.add("active");
        }
      });
    }, 100);

    return () => observer.disconnect();
  }, []);

  return null;
}
