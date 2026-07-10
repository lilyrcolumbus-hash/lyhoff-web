"use client";

import { motion } from "framer-motion";
import { Leaf } from "@/components/illustrations";

const leaves = [
  { top: "6%", left: "8%", size: 28, duration: 7, delay: 0, rotate: -18 },
  { top: "72%", left: "4%", size: 20, duration: 9, delay: 1.2, rotate: 12 },
  { top: "18%", left: "88%", size: 24, duration: 8, delay: 0.6, rotate: 20 },
  { top: "80%", left: "90%", size: 18, duration: 6.5, delay: 1.8, rotate: -10 },
];

/** Purely decorative — a few leaf icons drifting slowly in the background. */
export function FloatingLeaves({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      {leaves.map((leaf, i) => (
        <motion.div
          key={i}
          className="absolute text-forest-300/40"
          style={{ top: leaf.top, left: leaf.left, width: leaf.size, height: leaf.size }}
          animate={{
            y: [0, -16, 0],
            rotate: [leaf.rotate, leaf.rotate + 10, leaf.rotate],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Leaf className="h-full w-full" />
        </motion.div>
      ))}
    </div>
  );
}
