"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type DataTableProps = {
  children: ReactNode;
};

export function DataTable({ children }: DataTableProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const dockScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);
  const [dockBounds, setDockBounds] = useState({ left: 0, width: 0 });
  const [isDockVisible, setIsDockVisible] = useState(false);

  useEffect(() => {
    const body = bodyScrollRef.current;
    const outer = outerRef.current;
    if (!body) return;

    const updateScrollMetrics = () => {
      const nextHasOverflow = body.scrollWidth > body.clientWidth + 1;
      const rect = outer?.getBoundingClientRect();
      const isInViewport = !!rect && rect.bottom > 0 && rect.top < window.innerHeight;
      const visibleLeft = rect ? Math.max(0, rect.left) : 0;
      const visibleRight = rect ? Math.min(window.innerWidth, rect.right) : 0;

      setScrollWidth(body.scrollWidth);
      setHasHorizontalOverflow(nextHasOverflow);
      setIsDockVisible(nextHasOverflow && isInViewport);
      setDockBounds({
        left: visibleLeft,
        width: Math.max(0, visibleRight - visibleLeft),
      });
    };

    updateScrollMetrics();

    const resizeObserver = new ResizeObserver(updateScrollMetrics);
    resizeObserver.observe(body);

    if (body.firstElementChild) {
      resizeObserver.observe(body.firstElementChild);
    }

    window.addEventListener("resize", updateScrollMetrics);
    window.addEventListener("scroll", updateScrollMetrics, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollMetrics);
      window.removeEventListener("scroll", updateScrollMetrics);
    };
  }, [children]);

  const syncScroll = (source: "top" | "body" | "dock") => {
    const top = topScrollRef.current;
    const body = bodyScrollRef.current;
    const dock = dockScrollRef.current;
    if (!body || isSyncingRef.current) return;

    isSyncingRef.current = true;
    const nextScrollLeft =
      source === "top" ? (top?.scrollLeft ?? 0) : source === "dock" ? (dock?.scrollLeft ?? 0) : body.scrollLeft;

    if (top && source !== "top") {
      top.scrollLeft = nextScrollLeft;
    }

    if (source !== "body") {
      body.scrollLeft = nextScrollLeft;
    }

    if (dock && source !== "dock") {
      dock.scrollLeft = nextScrollLeft;
    }

    window.requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  return (
    <div ref={outerRef} className="rounded-xl border border-border bg-bgSecondary">
      {hasHorizontalOverflow ? (
        <div
          ref={topScrollRef}
          className="table-scroll sticky top-0 z-20 overflow-x-auto border-b border-border bg-bgSecondary/95"
          onScroll={() => syncScroll("top")}
        >
          <div className="h-3" style={{ width: scrollWidth }} />
        </div>
      ) : null}
      <div ref={bodyScrollRef} className="table-scroll overflow-x-auto" onScroll={() => syncScroll("body")}>
        {children}
      </div>
      {isDockVisible ? (
        <div
          ref={dockScrollRef}
          className="table-scroll fixed bottom-0 z-50 overflow-x-auto border-t border-border bg-bgSecondary/95 shadow-[0_-12px_30px_rgba(0,0,0,0.35)]"
          style={{ left: dockBounds.left, width: dockBounds.width }}
          onScroll={() => syncScroll("dock")}
        >
          <div className="h-4" style={{ width: scrollWidth }} />
        </div>
      ) : null}
    </div>
  );
}
