import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPublishedProjects } from "@/lib/api";
import { Page } from "@/components/Page";
import { ProjectCard } from "@/components/ProjectCard";
import { PageHeader } from "@/components/Section";

export const metadata: Metadata = {
  title: "Projects",
  description: "Automated machines and control panels Alpha Automations has designed, built and installed.",
};

export default function ProjectsPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Our projects"
        title="Machines we've built"
        intro="Every project starts at the client's genba. Here is the problem we found, the machine we built, and what changed."
      />
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Suspense fallback={<Skeleton />}>
          <ProjectList />
        </Suspense>
      </section>
    </Page>
  );
}

async function ProjectList() {
  const projects = await getPublishedProjects();

  if (projects === null) {
    return <p className="text-lg text-slate-500">Project records can&apos;t be loaded right now. Please try again soon.</p>;
  }
  if (projects.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 p-14 text-center text-lg text-slate-500">
        Our project records are being added.{" "}
        <Link href="/contact" className="font-semibold text-sky-700 hover:underline">Contact us</Link> to hear about our past work.
      </div>
    );
  }
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-96 animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  );
}
