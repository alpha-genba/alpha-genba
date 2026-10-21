"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { percent } from "@/lib/api";
import { StatusLight, statusStyles } from "./StatusLight";
import { useMonitor } from "./useMonitor";

/** Small live line-status card for the home page hero. */
export function LivePreview() {
  const { data, error } = useMonitor(2000);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl shadow-orange-500/5 backdrop-blur">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span className="andon-pulse inline-block h-2 w-2 rounded-full bg-emerald-400" /> Live line · demo
        </p>
        <p className="text-xs text-slate-500">Simulated data</p>
      </div>

      <div className="mt-4 flex items-end gap-3">
        <p className="text-5xl font-bold tabular-nums">{data ? percent(data.line.oee) : "--"}</p>
        <p className="pb-1.5 text-sm text-slate-400">line OEE</p>
      </div>

      <ul className="mt-5 space-y-2">
        {data?.machines.map((m) => (
          <li key={m.id} className="flex items-center justify-between rounded-lg bg-slate-950/60 px-3 py-2 text-sm">
            <span className="flex items-center gap-2.5">
              <StatusLight status={m.status} />
              {m.name}
            </span>
            <span className={`text-xs font-medium ${statusStyles[m.status].text}`}>{statusStyles[m.status].label}</span>
          </li>
        ))}
        {!data && (
          <li className="rounded-lg bg-slate-950/60 px-3 py-6 text-center text-sm text-slate-500">
            {error ? "Live demo is offline right now." : "Connecting to the line..."}
          </li>
        )}
      </ul>

      <Link href="/live" className="mt-5 flex items-center gap-1.5 text-sm font-medium text-orange-400 hover:gap-2.5 transition-all">
        Open the live dashboard <ArrowRight size={16} />
      </Link>
    </div>
  );
}
