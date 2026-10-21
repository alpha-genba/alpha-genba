import { Check } from "lucide-react";
import { stages } from "@/lib/content";

export function ProgressBar({ value, size = "md" }: { value: number; size?: "md" | "lg" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={`overflow-hidden rounded-sm bg-slate-200 ${size === "lg" ? "h-3.5" : "h-2"}`}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progress-fill h-full bg-sky-600" style={{ width: `${pct}%` }} />
    </div>
  );
}

/** Shows Design → Manufacturing → ... → Completed, with the current stage highlighted. */
export function StageTracker({ stage }: { stage: string }) {
  const current = Math.max(0, stages.findIndex((s) => s.value === stage));
  return (
    <ol className="grid grid-cols-3 gap-y-6 sm:grid-cols-6">
      {stages.map((s, i) => {
        const done = i < current || stage === "completed";
        const active = i === current && stage !== "completed";
        return (
          <li key={s.value} className="relative flex flex-col items-center text-center">
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-5 hidden h-0.5 w-full -translate-y-1/2 sm:block ${i <= current ? "bg-sky-600" : "bg-slate-200"}`}
                aria-hidden="true"
              />
            )}
            <span
              className={`relative grid h-10 w-10 place-items-center rounded-full border-2 text-sm font-bold ${
                done
                  ? "border-sky-600 bg-sky-600 text-white"
                  : active
                    ? "border-sky-600 bg-white text-sky-700 ring-4 ring-sky-100"
                    : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              {done ? <Check size={20} /> : i + 1}
            </span>
            <span className={`mt-2 text-sm font-medium ${active ? "text-sky-700" : done ? "text-slate-800" : "text-slate-400"}`}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
