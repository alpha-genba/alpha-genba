import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatDate, type OngoingProject } from "@/lib/api";
import { stageLabel } from "@/lib/content";
import { Photo } from "@/components/Photo";
import { ProgressBar } from "./Progress";

export function OngoingCard({ project }: { project: OngoingProject }) {
  return (
    <Link href={`/ongoing/${project.slug}`} className="group flex h-full flex-col border border-slate-200 bg-white transition-colors duration-300 hover:border-sky-600">
      <Photo src={project.coverUrl || undefined} alt={project.title} label="machine in progress" className="aspect-[16/10]">
        <span className="absolute left-0 top-4 flex items-center gap-2 bg-sky-600 px-3.5 py-1.5 text-sm font-semibold text-white">
          <span className="status-pulse inline-block h-2 w-2 rounded-full bg-white" />
          {stageLabel(project.stage)}
        </span>
      </Photo>
      <div className="flex flex-1 flex-col p-7">
        {(project.client || project.industry) && (
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">{[project.client, project.industry].filter(Boolean).join(" · ")}</p>
        )}
        <h3 className="mt-2 text-xl font-semibold text-slate-900">{project.title}</h3>
        {project.summary && <p className="mt-2 line-clamp-2 leading-relaxed text-slate-600">{project.summary}</p>}

        <div className="mt-auto pt-6">
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium uppercase tracking-wider text-slate-500">Progress</span>
            <span className="font-mono text-2xl font-semibold text-slate-900">{project.progress}%</span>
          </div>
          <ProgressBar value={project.progress} />
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
            <span className="text-slate-500">Updated {formatDate(project.updatedAt)}</span>
            <span className="flex items-center gap-1.5 font-semibold text-sky-700">
              Follow <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
