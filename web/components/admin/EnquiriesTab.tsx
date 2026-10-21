"use client";

import { useCallback, useEffect, useState } from "react";
import { Building2, Check, Mail, Phone, StickyNote } from "lucide-react";
import type { Enquiry, EnquiryStatus } from "@/lib/api";
import { api, ApiError } from "./api";

const statuses: { value: EnquiryStatus; label: string; style: string }[] = [
  { value: "new", label: "New", style: "bg-sky-100 text-sky-800" },
  { value: "contacted", label: "Contacted", style: "bg-violet-100 text-violet-800" },
  { value: "won", label: "Won", style: "bg-emerald-100 text-emerald-800" },
  { value: "lost", label: "Lost", style: "bg-slate-100 text-slate-600" },
  { value: "archived", label: "Archived", style: "bg-slate-100 text-slate-500" },
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

  async function change(id: number, patch: { status?: EnquiryStatus; adminNote?: string }) {
    try {
      await api(`/admin/enquiries/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      setEnquiries((list) => list?.map((e) => (e.id === id ? { ...e, ...patch } : e)) ?? null);
      return true;
    } catch (err) {
      handle(err);
      return false;
    }
  }

  if (error) return <p className="text-red-600">{error}</p>;
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
        <p className="mt-10 rounded-md border-2 border-dashed border-sky-200 p-12 text-center text-lg text-slate-500">No enquiries here.</p>
      ) : (
        <ul className="mt-8 space-y-5">
          {visible.map((e) => (
            <li key={e.id} className="rounded-md border border-slate-200 bg-white p-6 shadow-sm md:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-semibold text-slate-900">{e.name}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-500">
                    {e.company && (
                      <span className="flex items-center gap-1.5">
                        <Building2 size={16} /> {e.company}
                      </span>
                    )}
                    <span>{new Date(e.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                    {e.industry && <span>· {e.industry}</span>}
                  </p>
                </div>
                <select
                  value={e.status}
                  onChange={(ev) => change(e.id, { status: ev.target.value as EnquiryStatus })}
                  className={`cursor-pointer rounded-md border-0 px-4 py-2 font-semibold ${statuses.find((s) => s.value === e.status)?.style}`}
                  aria-label={`Status for ${e.name}`}
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value} className="bg-white text-slate-900">{s.label}</option>
                  ))}
                </select>
              </div>

              <p className="mt-5 whitespace-pre-line text-lg leading-relaxed text-slate-700">{e.message}</p>

              <div className="mt-5 flex flex-wrap gap-3">
                {e.phone && (
                  <a href={`tel:${e.phone}`} className="flex items-center gap-2 rounded-md bg-sky-600 px-5 py-2.5 font-semibold text-white transition hover:bg-sky-700">
                    <Phone size={18} /> {e.phone}
                  </a>
                )}
                {e.email && (
                  <a href={`mailto:${e.email}`} className="flex max-w-full items-center gap-2 break-all rounded-md border-2 border-slate-200 px-5 py-2.5 font-medium text-sky-700 transition hover:border-sky-300">
                    <Mail size={18} /> {e.email}
                  </a>
                )}
              </div>

              <NoteEditor initial={e.adminNote} onSave={(note) => change(e.id, { adminNote: note })} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/** Private team note. It saves when you click away from the box. */
function NoteEditor({ initial, onSave }: { initial: string; onSave: (note: string) => Promise<boolean> }) {
  const [note, setNote] = useState(initial);
  const [saved, setSaved] = useState(false);

  async function save() {
    if (note === initial) return;
    if (await onSave(note)) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  }

  return (
    <div className="mt-6 rounded-md bg-amber-50/60 p-4">
      <label className="flex items-center justify-between text-sm font-medium text-amber-900">
        <span className="flex items-center gap-1.5">
          <StickyNote size={16} /> Team note (only visible to the team)
        </span>
        {saved && (
          <span className="flex items-center gap-1 text-emerald-700">
            <Check size={16} /> Saved
          </span>
        )}
      </label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={save}
        rows={2}
        placeholder="e.g. Called on Monday, visiting their plant next week"
        className="mt-2 w-full resize-y rounded-md border border-amber-100 bg-white px-4 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-amber-300 focus:outline-none"
      />
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-md px-4 py-2 font-medium transition ${
        active ? "bg-sky-600 text-white" : "bg-sky-50 text-slate-600 hover:bg-sky-100"
      }`}
    >
      {children}
    </button>
  );
}
