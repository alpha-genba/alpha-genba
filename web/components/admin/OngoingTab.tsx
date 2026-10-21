"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy, ExternalLink, Eye, EyeOff, Factory, Megaphone, Pencil, Plus, Trash } from "lucide-react";
import { formatDate, type Media, type OngoingProject } from "@/lib/api";
import { stageLabel, stages } from "@/lib/content";
import { ProgressBar } from "@/components/ongoing/Progress";
import { MediaGallery } from "@/components/MediaGallery";
import { api, ApiError } from "./api";
import { MediaUpload } from "./MediaUpload";
import { ErrorBox, Field, inputClass, PrimaryButton, SecondaryButton } from "./ui";

type Draft = Pick<
  OngoingProject,
  "slug" | "title" | "client" | "industry" | "summary" | "stage" | "progress" | "expectedCompletion" | "coverUrl" | "visibility"
>;

const emptyDraft: Draft = {
  slug: "",
  title: "",
  client: "",
  industry: "",
  summary: "",
  stage: "design",
  progress: 0,
  expectedCompletion: "",
  coverUrl: "",
  visibility: "private",
};

type View = { kind: "list" } | { kind: "form"; id: number | null; draft: Draft } | { kind: "manage"; id: number };

export function OngoingTab({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [view, setView] = useState<View>({ kind: "list" });
  const [projects, setProjects] = useState<OngoingProject[] | null>(null);
  const [error, setError] = useState("");

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onUnauthorized();
      else setError(err instanceof Error ? err.message : "Something went wrong");
    },
    [onUnauthorized],
  );

  const load = useCallback(() => {
    api<OngoingProject[]>("/admin/ongoing").then(setProjects).catch(handle);
  }, [handle]);

  useEffect(load, [load]);

  if (view.kind === "form") {
    return (
      <OngoingForm
        initial={view.draft}
        projectId={view.id}
        onCancel={() => setView(view.id ? { kind: "manage", id: view.id } : { kind: "list" })}
        onSaved={(p) => {
          load();
          setView({ kind: "manage", id: p.id });
        }}
        onUnauthorized={onUnauthorized}
      />
    );
  }

  if (view.kind === "manage") {
    return (
      <ManageProject
        id={view.id}
        onBack={() => {
          load();
          setView({ kind: "list" });
        }}
        onEdit={(p) => setView({ kind: "form", id: p.id, draft: p })}
        onUnauthorized={onUnauthorized}
      />
    );
  }

  if (error) return <p className="text-red-600">{error}</p>;
  if (!projects) return <p className="text-slate-500">Loading ongoing projects...</p>;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg text-slate-600">Machines being built right now. Post updates so clients can follow the progress.</p>
        <PrimaryButton type="button" onClick={() => setView({ kind: "form", id: null, draft: emptyDraft })}>
          <Plus size={20} /> New ongoing project
        </PrimaryButton>
      </div>

      {projects.length === 0 ? (
        <p className="mt-10 rounded-md border-2 border-dashed border-sky-200 p-12 text-center text-lg text-slate-500">
          No ongoing projects yet. Add the machine you&apos;re building now.
        </p>
      ) : (
        <ul className="mt-8 grid gap-5 md:grid-cols-2">
          {projects.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => setView({ kind: "manage", id: p.id })}
                className="w-full rounded-md border border-slate-200 bg-white p-6 text-left shadow-sm hover:border-sky-300"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-sky-50">
                    {p.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-sky-300"><Factory size={26} /></div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-lg font-semibold text-slate-900">{p.title}</p>
                    <p className="truncate text-slate-500">{p.client || "No client name"}</p>
                  </div>
                  <VisibilityBadge visibility={p.visibility} />
                </div>
                <div className="mt-5 flex items-baseline justify-between">
                  <span className="font-medium text-sky-700">{stageLabel(p.stage)}</span>
                  <span className="text-2xl font-bold tabular-nums text-sky-700">{p.progress}%</span>
                </div>
                <div className="mt-2">
                  <ProgressBar value={p.progress} />
                </div>
                <p className="mt-3 text-sm text-slate-500">Last updated {formatDate(p.updatedAt)}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function VisibilityBadge({ visibility }: { visibility: "public" | "private" }) {
  return visibility === "public" ? (
    <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-800">
      <Eye size={15} /> Public
    </span>
  ) : (
    <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
      <EyeOff size={15} /> Private
    </span>
  );
}

/** One project: details, the client's private link, a form to post an update, and past updates. */
function ManageProject({
  id,
  onBack,
  onEdit,
  onUnauthorized,
}: {
  id: number;
  onBack: () => void;
  onEdit: (p: OngoingProject) => void;
  onUnauthorized: () => void;
}) {
  const [project, setProject] = useState<OngoingProject | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && err.status === 401) onUnauthorized();
      else setError(err instanceof Error ? err.message : "Something went wrong");
    },
    [onUnauthorized],
  );

  const load = useCallback(() => {
    api<OngoingProject>(`/admin/ongoing/${id}`).then(setProject).catch(handle);
  }, [id, handle]);

  useEffect(load, [load]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!project) return <p className="text-slate-500">Loading project...</p>;

  const trackUrl = `${window.location.origin}/track/${project.shareToken}`;

  async function copyLink() {
    await navigator.clipboard.writeText(trackUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function removeProject() {
    if (!project || !confirm(`Delete "${project.title}", all its updates, photos and videos? This cannot be undone.`)) return;
    try {
      await api(`/admin/ongoing/${project.id}`, { method: "DELETE" });
      onBack();
    } catch (err) {
      handle(err);
    }
  }

  async function removeUpdate(updateId: number) {
    if (!confirm("Delete this update and its photos and videos?")) return;
    try {
      await api(`/admin/updates/${updateId}`, { method: "DELETE" });
      load();
    } catch (err) {
      handle(err);
    }
  }

  return (
    <div className="space-y-8">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 font-medium text-sky-700 transition-all hover:gap-3">
        <ArrowLeft size={18} /> All ongoing projects
      </button>

      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-slate-500">{[project.client, project.industry].filter(Boolean).join(" · ") || "No client name"}</p>
            <h2 className="mt-1 text-3xl font-bold text-slate-900">{project.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <VisibilityBadge visibility={project.visibility} />
            {project.visibility === "public" && (
              <Link href={`/ongoing/${project.slug}`} target="_blank" className="rounded-full p-2.5 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700" aria-label="View on website">
                <ExternalLink size={20} />
              </Link>
            )}
            <button onClick={() => onEdit(project)} className="rounded-full p-2.5 text-slate-500 transition hover:bg-sky-50 hover:text-sky-700" aria-label="Edit project details">
              <Pencil size={20} />
            </button>
            <button onClick={removeProject} className="rounded-full p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600" aria-label="Delete project">
              <Trash size={20} />
            </button>
          </div>
        </div>
        <div className="mt-6 flex items-baseline justify-between">
          <span className="text-lg font-medium text-sky-700">{stageLabel(project.stage)}</span>
          <span className="text-4xl font-bold tabular-nums text-sky-700">{project.progress}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar value={project.progress} size="lg" />
        </div>

        <div className="mt-7 rounded-md bg-sky-50 p-5">
          <p className="font-semibold text-slate-900">Client&apos;s private link</p>
          <p className="mt-1 text-slate-600">
            Send this to the client. They can follow every update, even while the project is private.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={trackUrl} onFocus={(e) => e.target.select()} className="min-w-0 flex-1 rounded-md border-2 border-slate-200 bg-white px-4 py-2.5 font-mono text-sm text-slate-700" />
            <button
              type="button"
              onClick={copyLink}
              className="flex items-center justify-center gap-2 rounded-md bg-sky-600 px-5 py-2.5 font-semibold text-white transition hover:bg-sky-700"
            >
              {copied ? <Check size={18} /> : <Copy size={18} />} {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>

      <UpdateForm project={project} onPosted={load} onUnauthorized={onUnauthorized} />

      <div>
        <h3 className="text-2xl font-semibold text-slate-900">Posted updates ({project.updates?.length ?? 0})</h3>
        {(project.updates ?? []).length === 0 ? (
          <p className="mt-4 text-slate-500">No updates yet. Post the first one above.</p>
        ) : (
          <ul className="mt-5 space-y-5">
            {project.updates!.map((u) => (
              <li key={u.id} className="rounded-md border border-slate-200 bg-white p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">
                      {formatDate(u.createdAt)} · {stageLabel(u.stage)} · {u.progress}%
                    </p>
                    <p className="mt-1 text-xl font-semibold text-slate-900">{u.title}</p>
                  </div>
                  <button onClick={() => removeUpdate(u.id)} className="rounded-full p-2.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600" aria-label="Delete update">
                    <Trash size={20} />
                  </button>
                </div>
                {u.message && <p className="mt-3 whitespace-pre-line text-slate-600">{u.message}</p>}
                {u.media.length > 0 && (
                  <div className="mt-4">
                    <MediaGallery items={u.media} alt={u.title} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function UpdateForm({ project, onPosted, onUnauthorized }: { project: OngoingProject; onPosted: () => void; onUnauthorized: () => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(project.progress);
  const [stage, setStage] = useState(project.stage);
  const [media, setMedia] = useState<Media[]>([]);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [posted, setPosted] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFields({});
    setError("");
    try {
      await api(`/admin/ongoing/${project.id}/updates`, {
        method: "POST",
        body: JSON.stringify({ title, message, progress, stage, media }),
      });
      setTitle("");
      setMessage("");
      setMedia([]);
      setPosted(true);
      setTimeout(() => setPosted(false), 2500);
      onPosted();
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
    <form onSubmit={submit} className="space-y-6 rounded-md border-2 border-sky-200 bg-gradient-to-b from-sky-50 to-white p-6 sm:p-8">
      <h3 className="flex items-center gap-2.5 text-2xl font-semibold text-slate-900">
        <Megaphone size={26} className="text-sky-500" /> Post an update
      </h3>

      <Field label="What happened? *" error={fields.title}>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Machine frame welded and painted" className={inputClass} />
      </Field>
      <Field label="Details" error={fields.message}>
        <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Explain the progress for the client in simple words." className={inputClass} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={`Progress: ${progress}%`} error={fields.progress}>
          <input type="range" min={0} max={100} step={5} value={progress} onChange={(e) => setProgress(Number(e.target.value))} className="mt-4 w-full accent-sky-500" />
        </Field>
        <Field label="Stage" error={fields.stage}>
          <select value={stage} onChange={(e) => setStage(e.target.value)} className={inputClass}>
            {stages.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
      </div>

      <MediaUpload label="Photos and video recordings" value={media} setValue={setMedia} />
      {fields.media && <p className="text-red-600">{fields.media}</p>}

      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="flex items-center gap-4">
        <PrimaryButton disabled={busy}>{busy ? "Posting..." : "Post update"}</PrimaryButton>
        {posted && (
          <span className="flex items-center gap-1.5 font-medium text-emerald-700 animate-[fade-in_200ms_ease-out]">
            <Check size={18} /> Posted. The client can see it now.
          </span>
        )}
      </div>
    </form>
  );
}

function OngoingForm({
  initial,
  projectId,
  onCancel,
  onSaved,
  onUnauthorized,
}: {
  initial: Draft;
  projectId: number | null;
  onCancel: () => void;
  onSaved: (p: OngoingProject) => void;
  onUnauthorized: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [cover, setCover] = useState<Media[]>(initial.coverUrl ? [{ kind: "image", url: initial.coverUrl }] : []);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setFields({});
    setError("");
    // Send only the editable fields: the backend rejects unknown ones.
    const body: Draft = {
      slug: draft.slug,
      title: draft.title,
      client: draft.client,
      industry: draft.industry,
      summary: draft.summary,
      stage: draft.stage,
      progress: draft.progress,
      expectedCompletion: draft.expectedCompletion,
      coverUrl: cover[0]?.url ?? "",
      visibility: draft.visibility,
    };
    try {
      const saved = await api<OngoingProject>(projectId ? `/admin/ongoing/${projectId}` : "/admin/ongoing", {
        method: projectId ? "PUT" : "POST",
        body: JSON.stringify(body),
      });
      onSaved(saved);
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
      <h2 className="text-2xl font-bold text-slate-900">{projectId ? "Edit ongoing project" : "New ongoing project"}</h2>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Title *" hint="e.g. Auto Screwing Station for Line 2" error={fields.title}>
          <input value={draft.title} onChange={(e) => set("title", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Client name" hint="Shown on the page. Leave empty to keep the client anonymous." error={fields.client}>
          <input value={draft.client} onChange={(e) => set("client", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Industry" error={fields.industry}>
          <input value={draft.industry} onChange={(e) => set("industry", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Expected completion" error={fields.expectedCompletion}>
          <input type="date" value={draft.expectedCompletion} onChange={(e) => set("expectedCompletion", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Current stage" error={fields.stage}>
          <select value={draft.stage} onChange={(e) => set("stage", e.target.value)} className={inputClass}>
            {stages.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </Field>
        <Field label={`Progress: ${draft.progress}%`} error={fields.progress}>
          <input type="range" min={0} max={100} step={5} value={draft.progress} onChange={(e) => set("progress", Number(e.target.value))} className="mt-4 w-full accent-sky-500" />
        </Field>
      </div>

      <Field label="About this project" hint="What is being built, in simple words." error={fields.summary}>
        <textarea rows={3} value={draft.summary} onChange={(e) => set("summary", e.target.value)} className={inputClass} />
      </Field>

      <MediaUpload label="Cover photo" value={cover} setValue={setCover} allowVideo={false} multiple={false} />

      <fieldset>
        <legend className="font-medium text-slate-700">Who can see it?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {([
            { value: "private", title: "Private", text: "Only the client, through their private link.", icon: EyeOff },
            { value: "public", title: "Public", text: "Listed on the Ongoing Projects page for everyone.", icon: Eye },
          ] as const).map(({ value, title, text, icon: Icon }) => (
            <label
              key={value}
              className={`flex cursor-pointer gap-3 rounded-md border-2 p-4 transition ${
                draft.visibility === value ? "border-sky-400 bg-sky-50" : "border-slate-200 hover:border-sky-200"
              }`}
            >
              <input type="radio" name="visibility" value={value} checked={draft.visibility === value} onChange={() => set("visibility", value)} className="sr-only" />
              <Icon size={22} className="mt-0.5 shrink-0 text-sky-700" />
              <span>
                <span className="block font-semibold text-slate-900">{title}</span>
                <span className="block text-slate-600">{text}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="flex flex-wrap gap-3">
        <PrimaryButton disabled={busy}>{busy ? "Saving..." : projectId ? "Save changes" : "Create project"}</PrimaryButton>
        <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
      </div>
    </form>
  );
}
