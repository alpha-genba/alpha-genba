import type { ReactNode } from "react";
import { Photo } from "./Photo";

/** Small label above a section title, with the short accent line used across the site. */
export function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p className={`flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.18em] ${light ? "text-sky-300" : "text-sky-700"}`}>
      <span className={`h-[3px] w-8 ${light ? "bg-sky-400" : "bg-sky-600"}`} aria-hidden="true" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  center?: boolean;
}) {
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center [&>p:first-child]:justify-center" : ""}`}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 md:text-[2.6rem] md:leading-tight">{title}</h2>
      {intro && <p className="mt-5 text-lg leading-relaxed text-slate-600">{intro}</p>}
    </div>
  );
}

/** Title band at the top of inner pages, optionally with a photo on the right. */
export function PageHeader({
  eyebrow,
  title,
  intro,
  photo,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  photo?: { src: string; alt: string };
  children?: ReactNode;
}) {
  const text = (
    <div className="rise-in">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-slate-900 md:text-[3.25rem] md:leading-[1.1]">{title}</h1>
      {intro && <p className="mt-6 max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">{intro}</p>}
      {children}
    </div>
  );

  if (!photo) {
    return (
      <section className="border-b border-slate-200 bg-sky-50">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">{text}</div>
      </section>
    );
  }
  return (
    <section className="border-b border-slate-200 bg-sky-50">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[1.2fr_1fr]">
        <div className="flex items-center px-5 py-16 sm:px-8 md:py-20">{text}</div>
        <Photo src={photo.src} alt={photo.alt} className="rise-in min-h-64 lg:min-h-full" />
      </div>
    </section>
  );
}
