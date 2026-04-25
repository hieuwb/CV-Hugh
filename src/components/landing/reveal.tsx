"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;      // ms — để stagger
  className?: string;
  as?: "div" | "section" | "article" | "li" | "header";
};

// Wrapper dùng IntersectionObserver để thêm class `.is-visible` khi phần tử
// vào viewport — kích hoạt transition trong globals.css. Một observer dùng
// chung (module-level), rẻ hơn tạo mỗi instance.
let sharedObserver: IntersectionObserver | null = null;
const pending = new Map<Element, number>();

function getObserver() {
  if (typeof window === "undefined") return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const delay = pending.get(entry.target) ?? 0;
            setTimeout(() => entry.target.classList.add("is-visible"), delay);
            sharedObserver?.unobserve(entry.target);
            pending.delete(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
  }
  return sharedObserver;
}

export function Reveal({
  children,
  delay = 0,
  className = "",
  as = "div"
}: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    const obs = getObserver();
    if (!el || !obs) return;
    pending.set(el, delay);
    obs.observe(el);
    return () => {
      obs.unobserve(el);
      pending.delete(el);
    };
  }, [delay]);

  const Tag = as as "div";
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`landing-reveal ${className}`.trim()}
    >
      {children}
    </Tag>
  );
}
