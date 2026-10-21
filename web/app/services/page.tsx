import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { approachSteps, benefits, faqs, industries, photos, services } from "@/lib/content";
import { Page } from "@/components/Page";
import { Reveal } from "@/components/Reveal";
import { PageHeader, SectionHeading } from "@/components/Section";
import { serviceIcons } from "@/components/ServiceCard";

export const metadata: Metadata = {
  title: "Services",
  description:
    "What industrial automation does for your factory, and everything Alpha Automations provides: automated machines, PLC control panels, Poka-Yoke, Andon, vision systems and more.",
};

export default function ServicesPage() {
  return (
    <Page>
      <PageHeader
        eyebrow="Services"
        title="What automation does for your factory"
        intro="Automation means letting machines do the repetitive, precise or risky work: the same way, every time. Here is what that means for you, and everything we provide."
        photo={{ src: photos.panels, alt: "Electrical control panel with servo drives and neat wiring" }}
      />

      {/* Quick jump links to each service */}
      <nav aria-label="Services on this page" className="sticky top-20 z-40 border-b border-slate-200 bg-white/95 backdrop-blur md:top-[7.5rem]">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 sm:px-8 [scrollbar-width:none]">
          {services.map((s) => (
            <a
              key={s.slug}
              href={`#${s.slug}`}
              className="shrink-0 rounded-md bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100"
            >
              {s.title}
            </a>
          ))}
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-28">
        <Reveal>
          <SectionHeading center eyebrow="Why automate" title="What you gain" />
        </Reveal>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={(i % 3) * 100} className="h-full">
              <div className="h-full rounded-md bg-sky-50 p-8">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-sky-600 text-white">
                  <Check size={24} />
                </span>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{b.title}</h3>
                <p className="mt-2 text-lg leading-relaxed text-slate-600">{b.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-gradient-to-b from-sky-50/60 to-white">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-28">
          <Reveal>
            <SectionHeading eyebrow="What we provide" title="Our services, explained" intro="For each service: what it is, what you receive from us, and where it's typically used." />
          </Reveal>
          <div className="mt-14 space-y-8">
            {services.map((s, i) => {
              const Icon = serviceIcons[s.icon];
              return (
                <Reveal key={s.slug}>
                  <article id={s.slug} className="scroll-mt-40 rounded-md border border-slate-200 bg-white p-7 shadow-sm md:p-10">
                    <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
                      <div>
                        <div className="flex items-center gap-4">
                          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-sky-600 text-white">
                            <Icon size={28} />
                          </span>
                          <span className="font-mono text-lg text-sky-300">{String(i + 1).padStart(2, "0")}</span>
                        </div>
                        <h3 className="mt-5 text-2xl font-bold text-slate-900 md:text-3xl">{s.title}</h3>
                        <p className="mt-4 text-lg leading-relaxed text-slate-600">{s.details}</p>
                      </div>
                      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                        <div className="rounded-md bg-sky-50 p-6">
                          <h4 className="font-semibold text-slate-900">What you get</h4>
                          <ul className="mt-3 space-y-2.5">
                            {s.youGet.map((item) => (
                              <li key={item} className="flex gap-2.5 text-slate-700">
                                <Check size={20} className="mt-0.5 shrink-0 text-sky-500" /> {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="rounded-md border border-slate-200 p-6">
                          <h4 className="font-semibold text-slate-900">Typically used for</h4>
                          <ul className="mt-3 flex flex-wrap gap-2">
                            {s.usedFor.map((u) => (
                              <li key={u} className="rounded-md bg-white px-3.5 py-1.5 text-sm text-slate-700 ring-1 ring-sky-200">{u}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-28">
        <Reveal>
          <SectionHeading eyebrow="How we work" title="From your first call to a running machine" />
        </Reveal>
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {approachSteps.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={i * 120} className="h-full">
                <div className="relative h-full rounded-md border border-slate-200 bg-white p-8">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-sky-100 text-lg font-bold text-sky-700">{i + 1}</span>
                  <h3 className="mt-5 text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-slate-600">{step.description}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-sky-50">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-28">
          <Reveal>
            <SectionHeading
              eyebrow="Industries"
              title="Automation for every industry"
              intro="We don't limit ourselves to one sector. These are some of the industries where our kind of machines and panels make a big difference."
            />
          </Reveal>
          <ul className="mt-12 flex flex-wrap gap-3">
            {industries.map((name, i) => (
              <li key={name}>
                <Reveal delay={i * 50}>
                  <span className="block rounded-md bg-white px-6 py-3 text-lg font-medium text-slate-700 shadow-sm ring-1 ring-sky-100">{name}</span>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-24 sm:px-8 md:py-28">
        <Reveal>
          <SectionHeading center eyebrow="Questions" title="Frequently asked questions" />
        </Reveal>
        <div className="mt-12 space-y-4">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-md border border-slate-200 bg-white p-6 transition open:border-sky-300 open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold text-slate-900">
                {f.q}
                <ChevronDown size={22} className="shrink-0 text-sky-500 transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-lg leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-14 text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-sky-700"
          >
            Discuss your requirement <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </Page>
  );
}
