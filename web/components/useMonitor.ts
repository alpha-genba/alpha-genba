"use client";

import { useEffect, useState } from "react";
import type { MonitorSnapshot } from "@/lib/api";

/** Polls the live monitoring API every second. */
export function useMonitor(intervalMs = 1000) {
  const [data, setData] = useState<MonitorSnapshot | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/monitor", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const snapshot = (await res.json()) as MonitorSnapshot;
        if (!cancelled) {
          setData(snapshot);
          setError(false);
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    const id = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { data, error };
}
