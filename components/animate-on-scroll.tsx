"use client";

import { useEffect, useRef } from "react";

interface AnimateOnScrollProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section";
  id?: string;
}

export function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
  as = "div",
  id,
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced) {
      el.classList.add("aos-visible");
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => el.classList.add("aos-visible"), delay);
          } else {
            el.classList.add("aos-visible");
          }
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const props = {
    ref,
    id,
    className: `aos-hidden ${className}`,
  };

  if (as === "section") {
    return <section {...props}>{children}</section>;
  }
  return <div {...props}>{children}</div>;
}

interface StaggerChildrenProps {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
}

export function StaggerChildren({
  children,
  className = "",
  staggerMs = 100,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const items = el.querySelectorAll(":scope > .aos-stagger-item");

    if (prefersReduced) {
      items.forEach((item) => item.classList.add("aos-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((item, i) => {
            setTimeout(() => item.classList.add("aos-visible"), i * staggerMs);
          });
          observer.unobserve(el);
        }
      },
      { threshold: 0.01, rootMargin: "100px 0px 0px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [staggerMs]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
