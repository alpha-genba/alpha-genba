"use client";

import { useCallback, useEffect, useState } from "react";
import { Mail, Phone } from "lucide-react";
import type { Enquiry, EnquiryStatus } from "@/lib/api";
import { api, ApiError } from "./api";

const statuses: { value: EnquiryStatus; label: string; style: string }[] = [
  { value: "new", label: "New", style: "bg-orange-500/15 text-orange-300" },
  { value: "contacted", label: "Contacted", style: "bg-sky-500/15 text-sky-300" },
  { value: "won", label: "Won", style: "bg-emerald-500/15 text-emerald-300" },
  { value: "lost", label: "Lost", style: "bg-slate-500/15 text-slate-400" },
  { value: "archived", label: "Archived", style: "bg-slate-500/10 text-slate-500" },
];

export function EnquiriesTab({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [enquiries, setEnquiries] = useState<Enquiry[] | null>(null);
  const [filter, setFilter] = useState<EnquiryStatus | "open">("open");
  const [error, setError] = useState("");

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onUnauthorized();
      else setError(err instanceof Error ? err.message : "Something went wrong");
    },
    [onUnauthorized],
  );

  useEffect(() => {
    api<Enquiry[]>("/admin/enquiries").then(setEnquiries).catch(handle);
  }, [handle]);

  async function setStatus(id: number, status: EnquiryStatus) {
    try {
      await api(`/admin/enquiries/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setEnquiries((list) => list?.map((e) => (e.id === id ? { ...e, status } : e)) ?? null);
    } catch (err) {
      handle(err);
    }
  }

  if (error) return <p className="text-red-400">{error}</p>;
  if (!enquiries) return <p className="text-slate-500">Loading enquiries...</p>;

  const visible = enquiries.filter((e) =>
    filter === "open" ? e.status === "new" || e.status === "contacted" : e.status === filter,
  );
  const count = (s: EnquiryStatus) => enquiries.filter((e) => e.status === s).length;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <FilterChip active={filter === "open"} onClick={() => setFilter("open")}>
          Open ({count("new") + count("contacted")})
        </FilterChip>
        {statuses.map((s) => (
          <FilterChip key={s.value} active={filter === s.value} onClick={() => setFilter(s.value)}>
            {s.label} ({count(s.value)})
          </FilterChip>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-10 text-center text-slate-500">No enquiries here.</p>
      ) : (
        <ul className="mt-6 space-y-4">
          {visible.map((e) => (
            <li key={e.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">
                    {e.name}
                    {e.company && <span className="font-normal text-slate-400"> · {e.company}</span>}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(e.createdAt).toLocaleString("en-IN")}
                    {e.industry && ` · ${e.industry}`}
                  </p>
                </div>
                <select
                  value={e.status}
                  onChange={(ev) => setStatus(e.id, ev.target.value as EnquiryStatus)}
                  className={`rounded-md border-0 px-3 py-1.5 text-sm font-medium ${statuses.find((s) => s.value === e.status)?.style}`}
                  aria-label={`Status for ${e.name}`}
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value} className="bg-slate-900 text-white">{s.label}</option>
                  ))}
                </select>
              </div>
              <p className="mt-4 whitespace-pre-line text-slate-300">{e.message}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                {e.email && (
                  <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 text-orange-300 hover:underline">
                    <Mail size={15} /> {e.email}
                  </a>
                )}
                {e.phone && (
                  <a href={`tel:${e.phone}`} className="flex items-center gap-1.5 text-orange-300 hover:underline">
                    <Phone size={15} /> {e.phone}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-sm transition ${
        active ? "bg-orange-500 font-medium text-slate-950" : "bg-slate-900 text-slate-400 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}
