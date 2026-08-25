"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Scroll-linked root that draws itself down the left margin as the page is
 * read, complete at the bottom.
 *
 * It's a reading-progress indicator — a familiar, useful thing — wearing the
 * shape of what this brand actually does ("Real roots. Nothing to hide."). A
 * hairline in the margin can't be mistaken for a broken element, which is the
 * failure mode of showier scroll effects on a calm site.
 *
 * Technique: scroll position is mapped to 0–1 and drives `stroke-dashoffset`,
 * coalesced to one write per animation frame. Hidden entirely for
 * `prefers-reduced-motion`, on narrow screens where there is no margin to
 * spare, and on pages too short to have meaningful progress.
 */
export function RootProgress() {
  const pathRef = useRef<SVGPathElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMotion.matches) return;

    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;

    let frame = 0;

    const apply = () => {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      // A page with barely anything below the fold would only ever show a stub
      // of root, which reads as an unfinished graphic rather than progress.
      if (scrollable < 400) {
        setEnabled(false);
        return;
      }
      setEnabled(true);
      const progress = Math.min(1, Math.max(0, window.scrollY / scrollable));
      path.style.strokeDashoffset = `${length * (1 - progress)}`;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(apply);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Page height changes as images and video load, and on navigation.
    const observer = new ResizeObserver(onScroll);
    observer.observe(document.body);
    apply();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-5 top-0 z-30 hidden h-screen w-8 xl:block"
      style={{ opacity: enabled ? 1 : 0, transition: "opacity 400ms ease" }}
    >
      <svg
        viewBox="0 0 40 1000"
        preserveAspectRatio="none"
        className="h-full w-full text-earth-500"
        fill="none"
      >
        {/* Main root, with the drift of something that grew rather than was
            drawn. vector-effect keeps the hairline even width despite the
            viewBox being stretched to the viewport height. */}
        <path
          ref={pathRef}
          d="M20 0 C 20 90, 13 150, 16 240 C 19 330, 27 380, 23 470 C 19 560, 12 610, 15 700 C 18 790, 25 840, 21 930 L 20 1000"
          stroke="currentColor"
          strokeWidth="1.1"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
