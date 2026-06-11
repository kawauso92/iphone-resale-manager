"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

type DataTableProps = {
  children: ReactNode;
};

export function DataTable({ children }: DataTableProps) {
  const topScrollRef = useRef<HTMLDivElement>(null);
  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingRef = useRef(false);
  const [scrollWidth, setScrollWidth] = useState(0);
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(false);

  useEffect(() => {
    const body = bodyScrollRef.current;
    if (!body) return;

    const updateScrollMetrics = () => {
      setScrollWidth(body.scrollWidth);
      setHasHorizontalOverflow(body.scrollWidth > body.clientWidth + 1);
    };

    updateScrollMetrics();

    const resizeObserver = new ResizeObserver(updateScrollMetrics);
    resizeObserver.observe(body);

    if (body.firstElementChild) {
      resizeObserver.observe(body.firstElementChild);
    }

    window.addEventListener("resize", updateScrollMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateScrollMetrics);
    };
  }, [children]);

  const syncScroll = (source: "top" | "body") => {
    const top = topScrollRef.current;
    const body = bodyScrollRef.current;
    if (!top || !body || isSyncingRef.current) return;

    isSyncingRef.current = true;

    if (source === "top") {
      body.scrollLeft = top.scrollLeft;
    } else {
      top.scrollLeft = body.scrollLeft;
    }

    window.requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  };

  return (
    <div className="rounded-xl border border-border bg-bgSecondary">
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
    </div>
  );
}
