"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

export function Counter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1600, bounce: 0 });
  const [display, setDisplay] = useState(0);

  useEffect(() => { if (inView) mv.set(value); }, [inView, value, mv]);
  useEffect(() => spring.on("change", (v) => setDisplay(Math.round(v))), [spring]);

  return <span ref={ref}>{display.toLocaleString()}{suffix}</span>;
}
