"use client";

import { useEffect, useState } from "react";

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const listener = () => setReduced(media.matches);

    media.addEventListener?.("change", listener) ?? media.addListener(listener);

    return () =>
      media.removeEventListener?.("change", listener) ??
      media.removeListener(listener);
  }, []);

  return reduced;
}
