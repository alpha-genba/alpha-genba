"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ExternalLink, Factory, Pencil, Plus, Trash } from "lucide-react";
import type { Media, Project } from "@/lib/api";
import { api, ApiError } from "./api";
import { MediaUpload } from "./MediaUpload";
import { ErrorBox, Field, inputClass, PrimaryButton, SecondaryButton } from "./ui";

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
  gallery: [],
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
    if (!confirm(`Delete "${p.title}" and its photos? This cannot be undone.`)) return;
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

  if (error) return <p className="text-red-600">{error}</p>;
  if (!projects) return <p className="text-slate-500">Loading projects...</p>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg text-slate-600">
          Machines you&apos;ve delivered. Projects marked <span className="font-semibold text-emerald-700">Published</span> appear on the website.
        </p>
        <PrimaryButton type="button" onClick={() => setEditing({ id: null, draft: emptyDraft })}>
          <Plus size={20} /> New project
        </PrimaryButton>
      </div>

      {projects.length === 0 ? (
        <p className="mt-10 rounded-md border-2 border-dashed border-sky-200 p-12 text-center text-lg text-slate-500">
          No projects yet. Add the first machine Alpha Automations delivered.
        </p>
      ) : (
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id} className="flex items-center gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
              <div className="h-20 w-24 shrink-0 overflow-hidden rounded-md bg-sky-50">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-sky-300"><Factory size={28} /></div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-slate-900">{p.title}</p>
                <p className="truncate text-sm text-slate-500">
                  {p.industry || "No industry"} · {p.gallery.length + (p.imageUrl ? 1 : 0)} photos
                </p>
                <span className={`mt-1.5 inline-block rounded-md px-3 py-0.5 text-sm font-semibold ${p.published ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                  {p.published ? "Published" : "Draft"}
                </span>
              </div>
              <div className="flex shrink-0 flex-col gap-1 sm:flex-row">
                {p.published && (
                  <Link href={`/projects/${p.slug}`} target="_blank" className="rounded-full p-2.5 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700" aria-label="View on website">
                    <ExternalLink size={20} />
                  </Link>
                )}
                <button onClick={() => setEditing({ id: p.id, draft: p })} className="rounded-full p-2.5 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700" aria-label={`Edit ${p.title}`}>
                  <Pencil size={20} />
                </button>
                <button onClick={() => remove(p)} className="rounded-full p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${p.title}`}>
                  <Trash size={20} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

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
  const [cover, setCover] = useState<Media[]>(initial.imageUrl ? [{ kind: "image", url: initial.imageUrl }] : []);
  const [gallery, setGallery] = useState<Media[]>(initial.gallery.map((url) => ({ kind: "image", url })));
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
      imageUrl: cover[0]?.url ?? "",
      gallery: gallery.map((g) => g.url),
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

  return (
    <form onSubmit={submit} className="space-y-7 rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
      <h2 className="text-2xl font-bold text-slate-900">{projectId ? "Edit completed project" : "New completed project"}</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Title *" error={fields.title}>
          <input value={draft.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Industry" hint="e.g. Automotive components" error={fields.industry}>
          <input value={draft.industry} onChange={(e) => set("industry", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Completed on" error={fields.completedOn}>
          <input type="date" value={draft.completedOn} onChange={(e) => set("completedOn", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Web address (slug)" hint="Leave empty to create it from the title." error={fields.slug}>
          <input value={draft.slug} onChange={(e) => set("slug", e.target.value)} className={inputClass} />
        </Field>
      </div>

      <Field label="Short summary" hint="One or two sentences shown on the project card." error={fields.summary}>
        <input value={draft.summary} onChange={(e) => set("summary", e.target.value)} className={inputClass} />
      </Field>

      <MediaUpload label="Main photo" value={cover} setValue={setCover} allowVideo={false} multiple={false} />

      <div className="grid gap-6 md:grid-cols-3">
        <Field label="The problem at the genba" error={fields.problem}>
          <textarea rows={5} value={draft.problem} onChange={(e) => set("problem", e.target.value)} placeholder="What did the team see on the client's shop floor?" className={inputClass} />
        </Field>
        <Field label="What we built" error={fields.solution}>
          <textarea rows={5} value={draft.solution} onChange={(e) => set("solution", e.target.value)} placeholder="The machine or panel, and how it works." className={inputClass} />
        </Field>
        <Field label="The result" error={fields.result}>
          <textarea rows={5} value={draft.result} onChange={(e) => set("result", e.target.value)} placeholder="What changed for the client? Real numbers help." className={inputClass} />
        </Field>
      </div>

      <MediaUpload label="More photos (gallery)" value={gallery} setValue={setGallery} allowVideo={false} />
      {fields.gallery && <p className="text-red-600">{fields.gallery}</p>}

      <Field label="Technologies" hint="Separate with commas, e.g. Mitsubishi FX5U, Servo drive, Vision camera">
        <input value={techText} onChange={(e) => setTechText(e.target.value)} className={inputClass} />
      </Field>

      <label className="flex cursor-pointer items-center gap-3 rounded-md bg-sky-50 p-4 text-lg">
        <input type="checkbox" checked={draft.published} onChange={(e) => set("published", e.target.checked)} className="h-5 w-5 accent-sky-500" />
        Published (show this project on the website)
      </label>

      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="flex flex-wrap gap-3">
        <PrimaryButton disabled={busy}>{busy ? "Saving..." : "Save project"}</PrimaryButton>
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
      </div>
    </form>
  );
}
