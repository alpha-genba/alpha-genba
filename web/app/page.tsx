import Link from "next/link";
import { Suspense } from "react";
import { Activity, ArrowRight, BellRing, Gauge, Phone } from "lucide-react";
import { approachSteps, company, services, strengths } from "@/lib/content";
import { getPublishedProjects } from "@/lib/api";
import { SectionHeading } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { ProjectCard } from "@/components/ProjectCard";
import { LivePreview } from "@/components/LivePreview";

export default function Home() {
  return (
    <>
      <Hero />
      <Services />
      <Approach />
      <Strengths />
      <RecentProjects />
      <LiveMonitoring />
      <CallToAction />
    </>
  );
}

function Hero() {
  return (
    <section className="blueprint-grid relative overflow-hidden border-b border-slate-800">
      <div className="pointer-events-none absolute -top-40 right-0 h-[32rem] w-[32rem] rounded-full bg-orange-500/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-300">
            Industrial automation · Bengaluru
          </p>
          <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight md:text-6xl">
            Automated machines, <span className="text-orange-400">built from the genba.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
            We go to your shop floor, study the real problem, and build complete automated machines and PLC control
            panels for consistency and maximum output.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-orange-400"
            >
              Request a Quote <ArrowRight size={18} />
            </Link>
            <Link
              href="/#services"
              className="flex items-center justify-center rounded-lg border border-slate-700 px-6 py-3 font-semibold transition hover:bg-slate-900"
            >
              Our Services
            </Link>
          </div>
          <p className="mt-10 text-sm text-slate-500">
            Works with <span className="text-slate-300">Mitsubishi</span> and <span className="text-slate-300">Siemens</span>{" "}
            PLCs · Servo drives · VFDs · HMI · FL-net · Profibus
          </p>
        </div>
        <LivePreview />
      </div>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading
        eyebrow="What we do"
        title="Complete industrial automation, under one roof"
        intro="From a single control panel to a fully automated machine, we design, build and install automation for every industry."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <ServiceCard key={s.title} service={s} />
        ))}
      </div>
    </section>
  );
}

function Approach() {
  return (
    <section id="approach" className="border-y border-slate-800 bg-slate-900/30">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionHeading
          eyebrow="The genba approach"
          title="We don't design machines from a desk"
          intro={
            <>
              <em>Genba (現場)</em> is a Japanese manufacturing word for &ldquo;the actual place&rdquo;, the shop floor
              where real work happens. Every machine we build starts there.
            </>
          }
        />
        <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {approachSteps.map((step, i) => (
            <li key={step.title} className="relative rounded-xl border border-slate-800 bg-slate-950 p-6">
              <span className="font-mono text-sm text-orange-400">0{i + 1}</span>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Strengths() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading eyebrow="Why Alpha Automations" title="Built for the way your factory actually runs" />
      <div className="mt-12 grid gap-x-10 gap-y-8 md:grid-cols-2">
        {strengths.map((s) => (
          <div key={s.title} className="border-l-2 border-orange-500 pl-5">
            <h3 className="text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 leading-relaxed text-slate-400">{s.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentProjects() {
  return (
    <section className="border-t border-slate-800">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading eyebrow="Our work" title="Recent projects" />
          <Link href="/projects" className="flex items-center gap-1.5 font-medium text-orange-400 hover:gap-2.5 transition-all">
            All projects <ArrowRight size={18} />
          </Link>
        </div>
        <Suspense fallback={<ProjectsSkeleton />}>
          <RecentProjectList />
        </Suspense>
      </div>
    </section>
  );
}

async function RecentProjectList() {
  const projects = await getPublishedProjects();
  if (!projects || projects.length === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-slate-700 p-10 text-center text-slate-400">
        We&apos;re adding our project records here soon.{" "}
        <Link href="/contact" className="text-orange-400 hover:underline">Ask us about our past work.</Link>
      </div>
    );
  }
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {projects.slice(0, 3).map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="mt-10 grid gap-6 md:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-72 animate-pulse rounded-xl bg-slate-900" />
      ))}
    </div>
  );
}

function LiveMonitoring() {
  const features = [
    { icon: Activity, title: "Live machine status", text: "Running, idle or faulted, for every machine on the line." },
    { icon: BellRing, title: "Digital Andon", text: "The moment a machine stops, the right people know why." },
    { icon: Gauge, title: "OEE tracking", text: "Availability × Performance × Quality, calculated live." },
  ];
  return (
    <section className="border-t border-slate-800 bg-gradient-to-b from-slate-900/60 to-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <SectionHeading
          eyebrow="Alpha Genba · Live monitoring"
          title="See your genba live, from anywhere"
          intro="Our machines can connect to Alpha Genba, a monitoring platform that reads data from the PLC and shows what's happening on your shop floor in real time."
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-xl border border-slate-800 bg-slate-950/70 p-6">
              <Icon className="text-orange-400" size={24} />
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
            </div>
          ))}
        </div>
        <Link
          href="/live"
          className="mt-10 inline-flex items-center gap-2 rounded-lg border border-orange-500/50 px-6 py-3 font-semibold text-orange-300 transition hover:bg-orange-500 hover:text-slate-950"
        >
          Try the live demo <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <div className="flex flex-col items-start justify-between gap-8 rounded-2xl bg-orange-500 p-10 text-slate-950 md:flex-row md:items-center md:p-14">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Have a problem on your shop floor?</h2>
          <p className="mt-3 max-w-xl text-lg text-slate-900/80">
            Tell us about it. We&apos;ll visit your genba and propose the right machine for the job.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/contact" className="rounded-lg bg-slate-950 px-6 py-3 text-center font-semibold text-white hover:bg-slate-800">
            Request a Quote
          </Link>
          <a href={company.phoneHref} className="flex items-center justify-center gap-2 rounded-lg border border-slate-950/30 px-6 py-3 font-semibold hover:bg-orange-400">
            <Phone size={18} /> Call us
          </a>
        </div>
      </div>
    </section>
  );
}
