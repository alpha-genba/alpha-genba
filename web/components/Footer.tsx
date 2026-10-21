import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { company } from "@/lib/content";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            Complete automated machines and PLC-controlled electrical control panels, built from the genba for
            consistency and maximum output.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Explore</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-400">
            <li><Link href="/#services" className="hover:text-white">Services</Link></li>
            <li><Link href="/#approach" className="hover:text-white">Our Approach</Link></li>
            <li><Link href="/projects" className="hover:text-white">Projects</Link></li>
            <li><Link href="/live" className="hover:text-white">Live Monitoring Demo</Link></li>
            <li><Link href="/contact" className="hover:text-white">Request a Quote</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            <li className="flex gap-3">
              <Phone size={16} className="mt-0.5 shrink-0 text-orange-400" />
              <a href={company.phoneHref} className="hover:text-white">{company.phone}</a>
            </li>
            <li className="flex gap-3">
              <Mail size={16} className="mt-0.5 shrink-0 text-orange-400" />
              <a href={`mailto:${company.email}`} className="break-all hover:text-white">{company.email}</a>
            </li>
            <li className="flex gap-3">
              <MapPin size={16} className="mt-0.5 shrink-0 text-orange-400" />
              <span>{company.address.join(", ")}</span>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800/70 py-5 text-center text-xs text-slate-500">
        © Alpha Automations · Bengaluru, India
      </div>
    </footer>
  );
}
