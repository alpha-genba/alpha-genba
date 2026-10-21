import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { getOngoing } from "@/lib/api";
import { Page } from "@/components/Page";
import { OngoingDetail } from "@/components/ongoing/OngoingDetail";

export async function generateMetadata({ params }: PageProps<"/ongoing/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = await getOngoing("slug", slug);
  if (!project || project === "not-found") return { title: "Ongoing project" };
  return { title: `${project.title} (${project.progress}%)`, description: project.summary || undefined };
}

export default function OngoingProjectPage({ params }: PageProps<"/ongoing/[slug]">) {
  return (
    <Page>
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <Link href="/ongoing" className="inline-flex items-center gap-2 font-medium text-sky-700 transition-all hover:gap-3">
          <ArrowLeft size={18} /> All ongoing projects
        </Link>
      </div>
      <Suspense fallback={<div className="mx-auto mt-8 h-[32rem] max-w-6xl animate-pulse rounded-md bg-slate-100" />}>
        <Detail params={params} />
      </Suspense>
    </Page>
  );
}

async function Detail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getOngoing("slug", slug);
  if (project === "not-found") notFound();
  if (project === null) {
    return <p className="mx-auto max-w-6xl px-5 py-16 text-lg text-slate-500 sm:px-8">This project can&apos;t be loaded right now.</p>;
  }
  return <OngoingDetail project={project} />;
}
