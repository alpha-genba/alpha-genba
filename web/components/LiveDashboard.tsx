"use client";

import { Info, TriangleAlert } from "lucide-react";
import { percent, type MachineEvent, type MachineState, type MonitorSnapshot, type OEE } from "@/lib/api";
import { StatusLight, statusStyles } from "./StatusLight";
import { useMonitor } from "./useMonitor";

export function LiveDashboard() {
  const { data, error } = useMonitor();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">
            <span className="andon-pulse inline-block h-2 w-2 rounded-full bg-emerald-400" /> Alpha Genba · Live
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">Assembly Line 1</h1>
        </div>
        <p className="flex max-w-md items-start gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
          <Info size={18} className="mt-0.5 shrink-0 text-orange-400" />
          Demo with simulated machines. On a real installation, this data comes straight from the machines&apos; PLCs.
        </p>
      </div>

      {error && (
        <p className="mt-8 flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-3 text-red-300">
          <TriangleAlert size={18} /> Lost connection to the line. Retrying...
        </p>
      )}

      {data ? <Dashboard data={data} /> : !error && <p className="mt-16 text-center text-slate-500">Connecting to the line...</p>}
    </div>
  );
}

function Dashboard({ data }: { data: MonitorSnapshot }) {
  const stopped = data.machines.filter((m) => m.status !== "RUNNING");
  const total = data.goodParts + data.rejectedParts;

  return (
    <>
      {/* Andon banner: red the moment any machine faults */}
      <AndonBanner machines={stopped} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_2fr]">
        <OEEPanel oee={data.line} />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label="Good parts" value={data.goodParts.toLocaleString("en-IN")} />
          <Stat label="Rejected" value={data.rejectedParts.toLocaleString("en-IN")} tone="text-red-400" />
          <Stat label="Quality" value={total ? percent(data.goodParts / total) : "--"} />
          <Stat
            label="Running"
            value={`${data.machines.length - stopped.length}/${data.machines.length}`}
            tone={stopped.length ? "text-amber-400" : "text-emerald-400"}
          />
        </div>
      </div>

      <h2 className="mt-12 text-lg font-semibold">Machines</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {data.machines.map((m) => (
          <MachineCard key={m.id} machine={m} now={data.time} />
        ))}
      </div>

      <h2 className="mt-12 text-lg font-semibold">Andon log</h2>
      <EventLog events={data.events} />
    </>
  );
}

function AndonBanner({ machines }: { machines: MachineState[] }) {
  const faulted = machines.filter((m) => m.status === "FAULT");
  if (faulted.length > 0) {
    return (
      <div className="mt-8 rounded-xl border border-red-500/60 bg-red-500/15 px-5 py-4">
        <p className="flex items-center gap-3 font-semibold text-red-300">
          <span className="andon-pulse inline-block h-3 w-3 rounded-full bg-red-500" />
          ANDON: {faulted.map((m) => `${m.name} (${m.reason})`).join(" · ")}
        </p>
      </div>
    );
  }
  if (machines.length > 0) {
    return (
      <div className="mt-8 rounded-xl border border-amber-500/40 bg-amber-500/10 px-5 py-4 font-medium text-amber-200">
        {machines.length} machine{machines.length > 1 ? "s" : ""} idle: {machines.map((m) => m.name).join(", ")}
      </div>
    );
  }
  return (
    <div className="mt-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 font-medium text-emerald-300">
      All machines running
    </div>
  );
}

function OEEPanel({ oee }: { oee: OEE }) {
  const bars = [
    { label: "Availability", value: oee.availability },
    { label: "Performance", value: oee.performance },
    { label: "Quality", value: oee.quality },
  ];
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
      <p className="text-sm text-slate-400">Line OEE</p>
      <p className={`mt-1 text-6xl font-bold tabular-nums ${oeeTone(oee.oee)}`}>{percent(oee.oee)}</p>
      <p className="mt-1 text-xs text-slate-500">Availability × Performance × Quality</p>
      <div className="mt-6 space-y-4">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">{b.label}</span>
              <span className="tabular-nums">{percent(b.value)}</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full rounded-full bg-orange-500 transition-all duration-700" style={{ width: percent(b.value) }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// World-class OEE is usually quoted as 85%; around 60% is typical.
function oeeTone(v: number) {
  if (v >= 0.85) return "text-emerald-400";
  if (v >= 0.6) return "text-amber-300";
  return "text-red-400";
}

function Stat({ label, value, tone = "text-white" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex flex-col justify-center rounded-xl border border-slate-800 bg-slate-900/50 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${tone}`}>{value}</p>
    </div>
  );
}

function MachineCard({ machine: m, now }: { machine: MachineState; now: string }) {
  const s = statusStyles[m.status];
  return (
    <div className={`rounded-xl border bg-slate-900/60 p-5 transition-colors ${s.ring}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-slate-500">{m.id}</span>
        <span className={`flex items-center gap-2 text-xs font-semibold uppercase ${s.text}`}>
          <StatusLight status={m.status} /> {s.label}
        </span>
      </div>
      <h3 className="mt-3 font-semibold leading-snug">{m.name}</h3>
      <p className="text-xs text-slate-500">{m.kind}</p>
      <p className={`mt-3 min-h-10 text-xs ${m.reason ? s.text : "text-slate-500"}`}>
        {m.reason || "In production"} · {elapsed(m.statusSince, now)}
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-800 pt-4 text-sm">
        <div>
          <dt className="text-xs text-slate-500">OEE</dt>
          <dd className={`font-semibold tabular-nums ${oeeTone(m.oee.oee)}`}>{percent(m.oee.oee)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Parts</dt>
          <dd className="font-semibold tabular-nums">{m.goodParts.toLocaleString("en-IN")}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Cycle</dt>
          <dd className="tabular-nums">{m.lastCycleSec ? `${m.lastCycleSec.toFixed(1)}s` : "--"}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Ideal</dt>
          <dd className="tabular-nums text-slate-400">{m.idealCycleSec.toFixed(1)}s</dd>
        </div>
      </dl>
    </div>
  );
}

function EventLog({ events }: { events: MachineEvent[] }) {
  if (events.length === 0) {
    return <p className="mt-4 text-sm text-slate-500">No stops yet this shift.</p>;
  }
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-800">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-slate-900 text-left text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Time</th>
            <th className="px-4 py-3 font-medium">Machine</th>
            <th className="px-4 py-3 font-medium">Change</th>
            <th className="px-4 py-3 font-medium">Reason</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {events.slice(0, 12).map((e) => (
            <tr key={`${e.time}-${e.machineId}`} className="bg-slate-950/40">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-400">
                {new Date(e.time).toLocaleTimeString("en-IN", { hour12: false })}
              </td>
              <td className="px-4 py-3">{e.machineName}</td>
              <td className="whitespace-nowrap px-4 py-3">
                <span className={statusStyles[e.from].text}>{statusStyles[e.from].label}</span>
                <span className="text-slate-600"> → </span>
                <span className={statusStyles[e.to].text}>{statusStyles[e.to].label}</span>
              </td>
              <td className="px-4 py-3 text-slate-400">
                <span className="font-mono text-slate-500">{e.code}</span> {e.message}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function elapsed(since: string, now: string) {
  const secs = Math.max(0, Math.round((Date.parse(now) - Date.parse(since)) / 1000));
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}
