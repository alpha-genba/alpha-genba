import Link from "next/link";
import { ArrowRight, Factory } from "lucide-react";
import { formatDate, type Project } from "@/lib/api";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 transition hover:border-orange-500/50"
    >
      <div className="aspect-[16/9] bg-slate-900">
        {project.imageUrl ? (
          // Project photos can come from any host the admin links to, so a plain <img> is used.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.imageUrl} alt={project.title} className="h-full w-full object-cover" />
        ) : (
          <div className="blueprint-grid grid h-full place-items-center text-slate-700">
            <Factory size={48} />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {project.industry && (
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-400">{project.industry}</p>
        )}
        <h3 className="mt-2 text-lg font-semibold">{project.title}</h3>
        {project.summary && <p className="mt-2 text-sm leading-relaxed text-slate-400">{project.summary}</p>}
        <div className="mt-auto flex items-center justify-between pt-5 text-sm">
          <span className="text-slate-500">{formatDate(project.completedOn)}</span>
          <span className="flex items-center gap-1 text-orange-400 group-hover:gap-2 transition-all">
            Read more <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}
