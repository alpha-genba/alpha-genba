import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPublishedProjects } from "@/lib/api";
import { ProjectCard } from "@/components/ProjectCard";
import { SectionHeading } from "@/components/Section";

export const metadata: Metadata = {
  title: "Projects",
  description: "Automated machines and control panels Alpha Automations has designed, built and installed.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <SectionHeading
        eyebrow="Project records"
        title="Machines we've built"
        intro="Every project starts at the client's genba. Here is the problem we found, the machine we built, and what changed."
      />
      <Suspense fallback={<div className="mt-12 h-72 animate-pulse rounded-xl bg-slate-900" />}>
        <ProjectList />
      </Suspense>
    </div>
  );
}

async function ProjectList() {
  const projects = await getPublishedProjects();

  if (projects === null) {
    return <p className="mt-12 text-slate-400">Project records can&apos;t be loaded right now. Please try again soon.</p>;
  }
  if (projects.length === 0) {
    return (
      <div className="mt-12 rounded-xl border border-dashed border-slate-700 p-12 text-center text-slate-400">
        Our project records are being added.{" "}
        <Link href="/contact" className="text-orange-400 hover:underline">Contact us</Link> to hear about our past work.
      </div>
    );
  }
  return (
    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
