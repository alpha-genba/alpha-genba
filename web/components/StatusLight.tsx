import type { MachineStatus } from "@/lib/api";

export const statusStyles: Record<MachineStatus, { dot: string; text: string; ring: string; label: string }> = {
  RUNNING: { dot: "bg-emerald-400", text: "text-emerald-400", ring: "border-emerald-500/40", label: "Running" },
  IDLE: { dot: "bg-amber-400", text: "text-amber-400", ring: "border-amber-500/40", label: "Idle" },
  FAULT: { dot: "bg-red-500", text: "text-red-400", ring: "border-red-500/60", label: "Fault" },
};

export function StatusLight({ status, size = "h-2.5 w-2.5" }: { status: MachineStatus; size?: string }) {
  const s = statusStyles[status];
  return <span className={`inline-block rounded-full ${size} ${s.dot} ${status !== "RUNNING" ? "andon-pulse" : ""}`} />;
}
