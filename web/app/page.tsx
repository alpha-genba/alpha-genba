import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Check, Cpu, Factory, PanelsTopLeft, Phone, ShieldCheck } from "lucide-react";
import { approachSteps, company, photos, services, strengths, team } from "@/lib/content";
import { getPublicOngoing, getPublishedProjects } from "@/lib/api";
import { siteUrl } from "@/lib/site";
import { Page } from "@/components/Page";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { Eyebrow, SectionHeading } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { ProjectCard } from "@/components/ProjectCard";
import { OngoingCard } from "@/components/ongoing/OngoingCard";

export default function Home() {
  return (
    <Page>
      <CompanyDetailsForGoogle />
      <Hero />
      <Capabilities />
      <About />
      <ServicesPreview />
      <Approach />
      <RecentProjects />
      <OngoingPreview />
      <Strengths />
      <Technologies />
      <CallToAction />
    </Page>
  );
}

/**
 * Structured company details that Google reads to show the business name, address and phone.
 * Only fixed text from lib/content.ts goes in here, never anything a visitor typed.
 */
function CompanyDetailsForGoogle() {
  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: company.name,
    description: company.intro,
    url: siteUrl,
    logo: `${siteUrl}/icon.svg`,
    telephone: company.phone,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "1948, 3rd Block, Sir M V Layout, Kengeri",
      addressLocality: "Bengaluru",
      postalCode: "560110",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

function Hero() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="rise-in flex flex-col justify-center px-5 py-16 sm:px-8 md:py-24 lg:pr-14">
          <Eyebrow>Industrial automation · Bengaluru</Eyebrow>
          <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.08] tracking-tight text-slate-900 md:text-6xl">
            Automated machines and control panels, engineered for your shop floor.
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-relaxed text-slate-600">
            Alpha Automations designs and builds complete automated and semi-automated machines and PLC-controlled
            electrical panels, for consistent quality and maximum output.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link href="/contact" className="flex items-center justify-center gap-2 rounded-md bg-sky-600 px-7 py-4 text-lg font-semibold text-white transition hover:bg-sky-700">
              Get a quote <ArrowRight size={20} />
            </Link>
            <Link href="/projects" className="flex items-center justify-center rounded-md border border-slate-300 px-7 py-4 text-lg font-semibold text-slate-800 transition hover:border-sky-600 hover:text-sky-700">
              View our projects
            </Link>
          </div>
        </div>
        <Photo src={photos.hero || undefined} alt="Alpha Automations machine on the shop floor" label="hero machine" className="rise-in min-h-[22rem] lg:min-h-[38rem]" />
      </div>
    </section>
  );
}

function Capabilities() {
  const items = [
    { icon: Factory, title: "Special purpose machines", text: "Automated and semi-automated" },
    { icon: PanelsTopLeft, title: "Electrical control panels", text: "PLC-controlled, built in-house" },
    { icon: Cpu, title: "Mitsubishi & Siemens", text: "PLCs, servo drives, VFDs, HMI" },
    { icon: ShieldCheck, title: "Poka-Yoke & vision", text: "Error-proofing and inspection" },
  ];
  return (
    <section className="bg-slate-900">
      <div className="mx-auto grid max-w-7xl sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className={`flex items-center gap-4 px-5 py-7 sm:px-8 ${i > 0 ? "border-t border-slate-800 sm:border-t-0 sm:border-l" : ""}`}>
            <Icon size={34} strokeWidth={1.5} className="shrink-0 text-sky-400" />
            <div>
              <p className="font-semibold text-white">{title}</p>
              <p className="text-slate-400">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function About() {
  const pillars = [
    { title: "Engineering", text: "We understand the process, cycle time and quality target before anything is designed." },
    { title: "Design", text: "Mechanical, electrical, pneumatic and PLC design, done together by one team." },
    { title: "Implementation", text: "Manufacturing, panel building, programming, installation and commissioning at your site." },
  ];
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-28">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <Photo src={photos.about || undefined} alt="The Alpha Automations team at work" label="team at work" className="aspect-[4/3]" />
        </Reveal>
        <Reveal>
          <SectionHeading eyebrow="About us" title="An engineering house for industrial automation" />
          <p className="mt-6 text-lg leading-relaxed text-slate-600">{company.intro}</p>
          <ul className="mt-8 divide-y divide-slate-200 border-y border-slate-200">
            {pillars.map((p) => (
              <li key={p.title} className="flex gap-4 py-5">
                <Check size={22} className="mt-1 shrink-0 text-sky-600" />
                <div>
                  <p className="font-semibold text-slate-900">{p.title}</p>
                  <p className="mt-1 leading-relaxed text-slate-600">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {team.length > 0 && (
        <div className="mt-24">
          <Reveal>
            <SectionHeading eyebrow="Our team" title="The people behind the machines" />
          </Reveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <Reveal key={m.name}>
                <div className="h-full border border-slate-200 p-7">
                  <p className="text-xl font-semibold text-slate-900">{m.name}</p>
                  <p className="font-medium text-sky-700">{m.role}</p>
                  <p className="mt-3 leading-relaxed text-slate-600">{m.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function ServicesPreview() {
  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading eyebrow="What we do" title="Complete industrial automation, under one roof" />
          </Reveal>
          <Link href="/services" className="group flex shrink-0 items-center gap-2 text-lg font-semibold text-sky-700">
            All services <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="mt-12 grid gap-px bg-slate-200 sm:grid-cols-2 lg:grid-cols-3 [&>*]:bg-white">
          {services.slice(0, 6).map((s, i) => (
            <ServiceCard key={s.slug} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Approach() {
  return (
    <section className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-28">
        <Reveal>
          <div className="max-w-3xl">
            <Eyebrow light>The genba approach</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-[2.6rem] md:leading-tight">We don&apos;t design machines from a desk.</h2>
            <p className="mt-5 text-lg leading-relaxed text-slate-300">
              <em>Genba (現場)</em> is the Japanese manufacturing word for &ldquo;the actual place&rdquo;, the shop floor where
              real work happens. Every machine we build starts there.
            </p>
          </div>
        </Reveal>
        <ol className="mt-14 grid gap-px bg-slate-700 md:grid-cols-2 lg:grid-cols-4">
          {approachSteps.map((step, i) => (
            <li key={step.title} className="bg-slate-900 p-8">
              <span className="font-mono text-4xl font-medium text-sky-400">0{i + 1}</span>
              <h3 className="mt-5 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-slate-400">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function RecentProjects() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-28">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <Reveal>
          <SectionHeading eyebrow="Our projects" title="Machines we've delivered" />
        </Reveal>
        <Link href="/projects" className="group flex shrink-0 items-center gap-2 text-lg font-semibold text-sky-700">
          All projects <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
      <Suspense fallback={<CardsSkeleton />}>
        <RecentProjectList />
      </Suspense>
    </section>
  );
}

async function RecentProjectList() {
  const projects = await getPublishedProjects();
  if (!projects || projects.length === 0) {
    return (
      <EmptyNote>
        Our project records are being added.{" "}
        <Link href="/contact" className="font-semibold text-sky-700 hover:underline">Ask us about our past work.</Link>
      </EmptyNote>
    );
  }
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.slice(0, 3).map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}

function OngoingPreview() {
  return (
    <section className="border-t border-slate-200 bg-sky-50">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-28">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <Reveal>
            <SectionHeading eyebrow="In progress" title="Currently on our shop floor" intro="Follow machines being built: progress, stage, photos and videos, updated by our team." />
          </Reveal>
          <Link href="/ongoing" className="group flex shrink-0 items-center gap-2 text-lg font-semibold text-sky-700">
            All ongoing projects <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <Suspense fallback={<CardsSkeleton />}>
          <OngoingList />
        </Suspense>
      </div>
    </section>
  );
}

async function OngoingList() {
  const list = await getPublicOngoing();
  if (!list || list.length === 0) {
    return <EmptyNote>Updates from projects in progress will appear here.</EmptyNote>;
  }
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {list.slice(0, 3).map((p) => (
        <OngoingCard key={p.id} project={p} />
      ))}
    </div>
  );
}

function Strengths() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-28">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr]">
        <Reveal>
          <SectionHeading eyebrow="Why Alpha Automations" title="Built for the way your factory actually runs" />
        </Reveal>
        <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
          {strengths.map((s) => (
            <div key={s.title} className="bg-white p-7">
              <h3 className="text-xl font-semibold text-slate-900">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-slate-600">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Technologies() {
  const tech = ["Mitsubishi Q-Series PLC", "Mitsubishi FX-Series PLC", "Siemens PLC & drives", "Servo drives", "VFDs", "HMI", "FL-net", "Profibus", "Pneumatics", "Vision systems", "Barcode scanners & printers"];
  return (
    <section className="border-y border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-12 sm:px-8 lg:flex-row lg:items-center">
        <p className="shrink-0 font-semibold uppercase tracking-[0.15em] text-slate-500 lg:w-56">Technologies we work with</p>
        <ul className="flex flex-wrap gap-2.5">
          {tech.map((t) => (
            <li key={t} className="rounded-sm border border-slate-200 bg-white px-4 py-2 font-medium text-slate-700">{t}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CallToAction() {
  return (
    <section className="bg-sky-700 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-5 py-16 sm:px-8 md:flex-row md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Have a problem on your shop floor?</h2>
          <p className="mt-3 max-w-xl text-lg text-sky-100">Tell us about it. We&apos;ll visit your genba and propose the right machine for the job.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/contact" className="rounded-md bg-white px-7 py-4 text-center text-lg font-semibold text-sky-800 transition hover:bg-sky-50">
            Get a quote
          </Link>
          <a href={company.phoneHref} className="flex items-center justify-center gap-2 rounded-md border border-sky-300 px-7 py-4 text-lg font-semibold transition hover:bg-sky-600">
            <Phone size={20} /> {company.phone}
          </a>
        </div>
      </div>
    </section>
  );
}

function CardsSkeleton() {
  return (
    <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-96 animate-pulse bg-slate-100" />
      ))}
    </div>
  );
}

function EmptyNote({ children }: { children: React.ReactNode }) {
  return <div className="mt-12 border border-dashed border-slate-300 bg-white p-12 text-center text-lg text-slate-500">{children}</div>;
}
