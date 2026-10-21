import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { formatDate, getProject } from "@/lib/api";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug); // same request as the page, so fetched only once
  if (!project || project === "not-found") return { title: "Project" };
  return { title: project.title, description: project.summary || undefined };
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
        <ArrowLeft size={16} /> All projects
      </Link>
      <Suspense fallback={<div className="mt-8 h-96 animate-pulse rounded-xl bg-slate-900" />}>
        <ProjectDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (project === "not-found") notFound();
  if (project === null) {
    return <p className="mt-10 text-slate-400">This project can&apos;t be loaded right now. Please try again soon.</p>;
  }

  const sections = [
    { title: "The problem at the genba", body: project.problem },
    { title: "What we built", body: project.solution },
    { title: "The result", body: project.result },
  ].filter((s) => s.body);

  return (
    <article className="mt-8">
      {project.industry && (
        <p className="text-sm font-semibold uppercase tracking-wider text-orange-400">{project.industry}</p>
      )}
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{project.title}</h1>
      {project.summary && <p className="mt-4 text-lg leading-relaxed text-slate-300">{project.summary}</p>}
      {project.completedOn && <p className="mt-3 text-sm text-slate-500">Completed {formatDate(project.completedOn)}</p>}

      {project.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.imageUrl} alt={project.title} className="mt-10 w-full rounded-xl border border-slate-800" />
      )}

      <div className="mt-12 space-y-10">
        {sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-300">{s.body}</p>
          </section>
        ))}
      </div>

      {project.technologies.length > 0 && (
        <div className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Technologies</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {project.technologies.map((t) => (
              <li key={t} className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">{t}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-16 rounded-xl border border-slate-800 bg-slate-900/50 p-8">
        <h2 className="text-xl font-semibold">Need something similar?</h2>
        <p className="mt-2 text-slate-400">Tell us about your process and we&apos;ll visit your shop floor.</p>
        <Link href="/contact" className="mt-5 inline-block rounded-lg bg-orange-500 px-5 py-2.5 font-semibold text-slate-950 hover:bg-orange-400">
          Request a Quote
        </Link>
      </div>
    </article>
  );
}
