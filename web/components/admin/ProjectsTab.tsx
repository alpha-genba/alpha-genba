"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ExternalLink, Pencil, Plus, Trash } from "lucide-react";
import type { Project } from "@/lib/api";
import { api, ApiError } from "./api";

type Draft = Omit<Project, "id" | "createdAt" | "updatedAt">;

const emptyDraft: Draft = {
  slug: "",
  title: "",
  industry: "",
  summary: "",
  problem: "",
  solution: "",
  result: "",
  technologies: [],
  imageUrl: "",
  completedOn: "",
  published: false,
};

export function ProjectsTab({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [editing, setEditing] = useState<{ id: number | null; draft: Draft } | null>(null);
  const [error, setError] = useState("");

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onUnauthorized();
      else setError(err instanceof Error ? err.message : "Something went wrong");
    },
    [onUnauthorized],
  );

  const load = useCallback(() => {
    api<Project[]>("/admin/projects").then(setProjects).catch(handle);
  }, [handle]);

  useEffect(load, [load]);

  async function remove(p: Project) {
    if (!confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await api(`/admin/projects/${p.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      handle(err);
    }
  }

  if (editing) {
    return (
      <ProjectForm
        initial={editing.draft}
        projectId={editing.id}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          load();
        }}
        onUnauthorized={onUnauthorized}
      />
    );
  }

  if (error) return <p className="text-red-400">{error}</p>;
  if (!projects) return <p className="text-slate-500">Loading projects...</p>;

  return (
    <>
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">
          Projects marked <span className="text-emerald-300">Published</span> appear on the website.
        </p>
        <button
          onClick={() => setEditing({ id: null, draft: emptyDraft })}
          className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-orange-400"
        >
          <Plus size={16} /> New project
        </button>
      </div>

      {projects.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-500">
          No projects yet. Add the first machine Alpha Automations delivered.
        </p>
      ) : (
        <ul className="mt-6 divide-y divide-slate-800 rounded-xl border border-slate-800">
          {projects.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-medium">{p.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  /projects/{p.slug} {p.industry && `· ${p.industry}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    p.published ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {p.published ? "Published" : "Draft"}
                </span>
                {p.published && (
                  <Link href={`/projects/${p.slug}`} target="_blank" className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label="View on website">
                    <ExternalLink size={16} />
                  </Link>
                )}
                <button onClick={() => setEditing({ id: p.id, draft: p })} className="rounded-md p-2 text-slate-400 hover:bg-slate-800 hover:text-white" aria-label={`Edit ${p.title}`}>
                  <Pencil size={16} />
                </button>
                <button onClick={() => remove(p)} className="rounded-md p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400" aria-label={`Delete ${p.title}`}>
                  <Trash size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-slate-100 focus:border-orange-500 focus:outline-none";

function ProjectForm({
  initial,
  projectId,
  onCancel,
  onSaved,
  onUnauthorized,
}: {
  initial: Draft;
  projectId: number | null;
  onCancel: () => void;
  onSaved: () => void;
  onUnauthorized: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [techText, setTechText] = useState(initial.technologies.join(", "));
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFields({});
    setError("");
    // Send only the editable fields: the backend rejects unknown ones like id or createdAt.
    const body: Draft = {
      slug: draft.slug,
      title: draft.title,
      industry: draft.industry,
      summary: draft.summary,
      problem: draft.problem,
      solution: draft.solution,
      result: draft.result,
      technologies: techText.split(",").map((t) => t.trim()).filter(Boolean),
      imageUrl: draft.imageUrl,
      completedOn: draft.completedOn,
      published: draft.published,
    };
    try {
      await api(projectId ? `/admin/projects/${projectId}` : "/admin/projects", {
        method: projectId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return onUnauthorized();
      if (err instanceof ApiError) {
        setFields(err.fields);
        setError(err.message);
      } else setError("Could not reach the server.");
    } finally {
      setBusy(false);
    }
  }

  const text = (key: keyof Draft, label: string, hint?: string) => (
    <div>
      <label htmlFor={key} className="text-sm font-medium text-slate-300">{label}</label>
      <input id={key} value={draft[key] as string} onChange={(e) => set(key, e.target.value)} className={inputClass} />
      {fields[key] ? <p className="mt-1 text-sm text-red-400">{fields[key]}</p> : hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );

  const area = (key: "problem" | "solution" | "result", label: string, placeholder: string) => (
    <div>
      <label htmlFor={key} className="text-sm font-medium text-slate-300">{label}</label>
      <textarea id={key} rows={4} value={draft[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} className={inputClass} />
      {fields[key] && <p className="mt-1 text-sm text-red-400">{fields[key]}</p>}
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 sm:p-8">
      <h2 className="text-xl font-semibold">{projectId ? "Edit project" : "New project"}</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {text("title", "Title *")}
        {text("slug", "URL slug", "Leave empty to create it from the title.")}
        {text("industry", "Industry", "e.g. Automotive components")}
        <div>
          <label htmlFor="completedOn" className="text-sm font-medium text-slate-300">Completed on</label>
          <input id="completedOn" type="date" value={draft.completedOn} onChange={(e) => set("completedOn", e.target.value)} className={inputClass} />
          {fields.completedOn && <p className="mt-1 text-sm text-red-400">{fields.completedOn}</p>}
        </div>
      </div>
      {text("summary", "Short summary", "One or two sentences shown on the project card.")}
      {area("problem", "The problem at the genba", "What did the team see on the client's shop floor?")}
      {area("solution", "What we built", "The machine or panel, and how it works.")}
      {area("result", "The result", "What changed for the client? Use real numbers where you have them.")}
      <div>
        <label htmlFor="technologies" className="text-sm font-medium text-slate-300">Technologies</label>
        <input id="technologies" value={techText} onChange={(e) => setTechText(e.target.value)} className={inputClass} />
        <p className="mt-1 text-xs text-slate-500">Separate with commas, e.g. Mitsubishi FX5U, Servo drive, Vision camera</p>
      </div>
      {text("imageUrl", "Photo link", "A full image link (https://...) or a file in web/public, e.g. /images/machine.jpg")}
      <label className="flex items-center gap-3 text-sm">
        <input type="checkbox" checked={draft.published} onChange={(e) => set("published", e.target.checked)} className="h-4 w-4 accent-orange-500" />
        Published (show on the website)
      </label>

      {error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
      <div className="flex gap-3">
        <button disabled={busy} className="rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-orange-400 disabled:opacity-60">
          {busy ? "Saving..." : "Save project"}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-700 px-5 py-2.5 hover:bg-slate-800">
          Cancel
        </button>
      </div>
    </form>
  );
}
