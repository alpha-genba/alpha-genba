import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getOngoing } from "@/lib/api";
import { Page } from "@/components/Page";
import { OngoingDetail } from "@/components/ongoing/OngoingDetail";

// A client's private project page. The link is shared by the Alpha Automations team.
export const metadata: Metadata = {
  title: "Your project",
  robots: { index: false, follow: false }, // private links must never appear in Google
};

export default function TrackPage({ params }: PageProps<"/track/[token]">) {
  return (
    <Page>
      <Suspense fallback={<div className="mx-auto mt-8 h-[32rem] max-w-6xl animate-pulse rounded-md bg-slate-100" />}>
        <Detail params={params} />
      </Suspense>
    </Page>
  );
}

async function Detail({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const project = await getOngoing("token", token);
  if (project === "not-found") notFound();
  if (project === null) {
    return <p className="mx-auto max-w-6xl px-5 py-16 text-lg text-slate-500 sm:px-8">Your project can&apos;t be loaded right now. Please try again soon.</p>;
  }
  return <OngoingDetail project={project} isPrivateLink />;
}
