import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import { formatDate, type Project } from "@/lib/api";
import { Photo } from "./Photo";

export function ProjectCard({ project }: { project: Project }) {
  const photoCount = (project.imageUrl ? 1 : 0) + project.gallery.length;
  return (
    <Link href={`/projects/${project.slug}`} className="group flex h-full flex-col border border-slate-200 bg-white transition-colors duration-300 hover:border-sky-600">
      <Photo src={project.imageUrl || undefined} alt={project.title} label="project" className="aspect-[16/10]">
        {photoCount > 1 && (
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-sm bg-slate-900/80 px-2.5 py-1 text-sm text-white">
            <Images size={15} /> {photoCount}
          </span>
        )}
      </Photo>
      <div className="flex flex-1 flex-col p-7">
        {project.industry && <p className="text-sm font-semibold uppercase tracking-wider text-sky-700">{project.industry}</p>}
        <h3 className="mt-2 text-xl font-semibold text-slate-900">{project.title}</h3>
        {project.summary && <p className="mt-2 line-clamp-3 leading-relaxed text-slate-600">{project.summary}</p>}
        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between border-t border-slate-100 pt-5">
            <span className="text-sm text-slate-500">{project.completedOn ? `Completed ${formatDate(project.completedOn)}` : "Completed project"}</span>
            <ArrowRight size={20} className="text-sky-700 transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
