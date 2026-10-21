import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatDate, getProject, type Media } from "@/lib/api";
import { Page } from "@/components/Page";
import { MediaGallery } from "@/components/MediaGallery";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug); // same request as the page, so fetched only once
  if (!project || project === "not-found") return { title: "Project" };
  return { title: project.title, description: project.summary || undefined };
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Page>
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 md:py-16">
        <Link href="/projects" className="inline-flex items-center gap-2 font-medium text-sky-700 transition-all hover:gap-3">
          <ArrowLeft size={18} /> All projects
        </Link>
        <Suspense fallback={<div className="mt-8 h-[28rem] animate-pulse rounded-md bg-slate-100" />}>
          <ProjectDetail params={params} />
        </Suspense>
      </div>
    </Page>
  );
}

async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (project === "not-found") notFound();
  if (project === null) {
    return <p className="mt-10 text-lg text-slate-500">This project can&apos;t be loaded right now. Please try again soon.</p>;
  }

  const sections = [
    { title: "The problem at the genba", body: project.problem },
    { title: "What we built", body: project.solution },
    { title: "The result", body: project.result },
  ].filter((s) => s.body);

  const gallery: Media[] = project.gallery.map((url) => ({ kind: "image", url }));

  return (
    <article className="mt-8">
      {project.industry && <p className="font-semibold uppercase tracking-[0.18em] text-sky-700">{project.industry}</p>}
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl md:leading-[1.1]">{project.title}</h1>
      {project.summary && <p className="mt-5 text-xl leading-relaxed text-slate-600">{project.summary}</p>}
      {project.completedOn && <p className="mt-3 text-slate-500">Completed {formatDate(project.completedOn)}</p>}

      {project.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={project.imageUrl} alt={project.title} className="mt-10 w-full rounded-md border border-slate-200" />
      )}

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {sections.map((s, i) => (
          <section key={s.title} className={`rounded-md p-7 ${i === 1 ? "bg-sky-600 text-white" : "bg-sky-50"}`}>
            <h2 className={`text-xl font-semibold ${i === 1 ? "text-white" : "text-slate-900"}`}>{s.title}</h2>
            <p className={`mt-3 whitespace-pre-line text-lg leading-relaxed ${i === 1 ? "text-sky-50" : "text-slate-600"}`}>{s.body}</p>
          </section>
        ))}
      </div>

      {gallery.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-slate-900">Photos</h2>
          <div className="mt-6">
            <MediaGallery items={gallery} alt={project.title} />
          </div>
        </section>
      )}

      {project.technologies.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-slate-900">Technologies used</h2>
          <ul className="mt-5 flex flex-wrap gap-2.5">
            {project.technologies.map((t) => (
              <li key={t} className="rounded-md bg-sky-50 px-4 py-2 font-medium text-sky-700 ring-1 ring-sky-200">{t}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-16 flex flex-col items-start justify-between gap-6 rounded-md bg-sky-50 p-8 md:flex-row md:items-center md:p-10">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Need something similar?</h2>
          <p className="mt-2 text-lg text-slate-600">Tell us about your process and we&apos;ll visit your shop floor.</p>
        </div>
        <Link href="/contact" className="flex items-center gap-2 rounded-md bg-sky-600 px-7 py-3.5 text-lg font-semibold text-white transition hover:bg-sky-700">
          Request a Quote <ArrowRight size={20} />
        </Link>
      </div>
    </article>
  );
}
