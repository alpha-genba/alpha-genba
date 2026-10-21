import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { company, photoCredits, services } from "@/lib/content";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
        <div>
          <Logo light />
          <p className="mt-6 max-w-sm leading-relaxed text-slate-400">
            An engineering house for industrial automation: complete automated machines and PLC-controlled electrical
            control panels, built from the genba.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white">Company</h2>
          <ul className="mt-5 space-y-3">
            <li><Link href="/" className="transition hover:text-white">Home</Link></li>
            <li><Link href="/projects" className="transition hover:text-white">Projects</Link></li>
            <li><Link href="/ongoing" className="transition hover:text-white">Ongoing projects</Link></li>
            <li><Link href="/contact" className="transition hover:text-white">Contact</Link></li>
            <li><Link href="/admin" className="transition hover:text-white">Owner login</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white">Services</h2>
          <ul className="mt-5 space-y-3">
            {services.slice(0, 6).map((s) => (
              <li key={s.slug}>
                <Link href={`/services#${s.slug}`} className="transition hover:text-white">{s.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white">Contact</h2>
          <ul className="mt-5 space-y-4">
            <li className="flex gap-3">
              <MapPin size={20} className="mt-0.5 shrink-0 text-sky-400" />
              <address className="not-italic leading-relaxed">{company.address.join(", ")}</address>
            </li>
            <li className="flex gap-3">
              <Phone size={20} className="mt-0.5 shrink-0 text-sky-400" />
              <a href={company.phoneHref} className="transition hover:text-white">{company.phone}</a>
            </li>
            <li className="flex gap-3">
              <Mail size={20} className="mt-0.5 shrink-0 text-sky-400" />
              <a href={`mailto:${company.email}`} className="break-all transition hover:text-white">{company.email}</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-slate-500 sm:flex-row sm:justify-between sm:px-8">
          <span>© Alpha Automations, Bengaluru, India</span>
          <span>Industrial automation · Special purpose machines · Control panels</span>
        </div>
        {photoCredits.length > 0 && (
          <p className="mx-auto max-w-7xl px-5 pb-6 text-xs text-slate-600 sm:px-8">
            Illustrative photos from Unsplash by{" "}
            {photoCredits.map((c, i) => (
              <span key={c.url}>
                {i > 0 && (i === photoCredits.length - 1 ? " and " : ", ")}
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-slate-400 hover:underline">
                  {c.name}
                </a>
              </span>
            ))}
            .
          </p>
        )}
      </div>
    </footer>
  );
}
