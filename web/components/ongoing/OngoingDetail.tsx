import { CalendarClock, Clock, Lock } from "lucide-react";
import { formatDate, type OngoingProject } from "@/lib/api";
import { stageLabel } from "@/lib/content";
import { MediaGallery } from "@/components/MediaGallery";
import { ProgressBar, StageTracker } from "./Progress";

/** The full view of one ongoing project, used by the public page and the client's private link. */
export function OngoingDetail({ project, isPrivateLink = false }: { project: OngoingProject; isPrivateLink?: boolean }) {
  const updates = project.updates ?? [];

  return (
    <article>
      <section className="bg-sky-50 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 md:py-20">
          {isPrivateLink && (
            <p className="mb-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-sky-700 shadow-sm">
              <Lock size={16} /> Your private project page. Only people with this link can see it.
            </p>
          )}
          {(project.client || project.industry) && (
            <p className="font-semibold uppercase tracking-[0.18em] text-sky-700">
              {[project.client, project.industry].filter(Boolean).join(" · ")}
            </p>
          )}
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl md:leading-[1.1]">{project.title}</h1>
          {project.summary && <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">{project.summary}</p>}

          <div className="mt-10 rounded-md border border-slate-200 bg-white p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-slate-500">Overall progress</p>
                <p className="text-5xl font-bold tabular-nums text-sky-700 md:text-6xl">{project.progress}%</p>
              </div>
              <div className="space-y-1 text-slate-600 sm:text-right">
                <p className="flex items-center gap-2 sm:justify-end">
                  <Clock size={18} className="text-sky-500" /> Last updated {formatDate(project.updatedAt)}
                </p>
                {project.expectedCompletion && (
                  <p className="flex items-center gap-2 sm:justify-end">
                    <CalendarClock size={18} className="text-sky-500" /> Expected {formatDate(project.expectedCompletion)}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-5">
              <ProgressBar value={project.progress} size="lg" />
            </div>
            <div className="mt-10">
              <StageTracker stage={project.stage} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 md:py-20">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Project updates</h2>
        {updates.length === 0 ? (
          <p className="mt-6 rounded-md border border-dashed border-sky-200 p-10 text-center text-lg text-slate-500">
            The first update will appear here soon.
          </p>
        ) : (
          <ol className="relative mt-10 space-y-12 border-l-2 border-slate-200 pl-8 md:pl-10">
            {updates.map((u, i) => (
              <li key={u.id} className="relative">
                <span
                  className={`absolute -left-[2.8rem] top-1 grid h-6 w-6 place-items-center rounded-full border-4 border-white md:-left-[3.3rem] ${
                    i === 0 ? "bg-sky-600 ring-4 ring-sky-100" : "bg-sky-200"
                  }`}
                  aria-hidden="true"
                />
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <time className="font-medium text-slate-500">{formatDate(u.createdAt)}</time>
                  <span className="rounded-md bg-sky-100 px-3 py-1 font-semibold text-sky-700">{stageLabel(u.stage)}</span>
                  <span className="rounded-md bg-slate-100 px-3 py-1 font-semibold tabular-nums text-slate-700">{u.progress}%</span>
                  {i === 0 && <span className="rounded-md bg-emerald-100 px-3 py-1 font-semibold text-emerald-700">Latest</span>}
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-slate-900">{u.title}</h3>
                {u.message && <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-slate-600">{u.message}</p>}
                {u.media.length > 0 && (
                  <div className="mt-6">
                    <MediaGallery items={u.media} alt={u.title} />
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>
    </article>
  );
}
