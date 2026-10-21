import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getPublicOngoing } from "@/lib/api";
import { Page } from "@/components/Page";
import { PageHeader } from "@/components/Section";
import { OngoingCard } from "@/components/ongoing/OngoingCard";

export const metadata: Metadata = {
  title: "Ongoing Projects",
  description: "Machines Alpha Automations is building right now, with live progress, photos and videos.",
};

export default function OngoingPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Ongoing projects"
        title="On our shop floor right now"
        intro="Follow the machines we're building today: progress, stage, photos and video recordings, updated by our team as the work moves forward."
      />
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <Suspense fallback={<Skeleton />}>
          <List />
        </Suspense>
      </section>
    </Page>
  );
}

async function List() {
  const list = await getPublicOngoing();
  if (list === null) {
    return <p className="text-lg text-slate-500">Ongoing projects can&apos;t be loaded right now. Please try again soon.</p>;
  }
  if (list.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 p-14 text-center text-lg text-slate-500">
        No public projects in progress right now.{" "}
        <Link href="/contact" className="font-semibold text-sky-700 hover:underline">Start yours with us.</Link>
      </div>
    );
  }
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((p) => (
        <OngoingCard key={p.id} project={p} />
      ))}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[30rem] animate-pulse rounded-md bg-slate-100" />
      ))}
    </div>
  );
}
