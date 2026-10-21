import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { company } from "@/lib/content";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Request a Quote",
  description: "Tell Alpha Automations about your automation requirement. We'll visit your shop floor and propose a solution.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-400">Request a quote</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">Tell us about your shop floor</h1>
        <p className="mt-5 text-lg leading-relaxed text-slate-400">
          Describe the process you want to automate or the problem you&apos;re facing. We&apos;ll get back to you and,
          where it helps, visit your genba to see it first-hand.
        </p>

        <ul className="mt-10 space-y-6">
          <li className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-400"><Phone size={20} /></span>
            <div>
              <p className="text-sm text-slate-500">Phone</p>
              <a href={company.phoneHref} className="font-medium hover:text-orange-300">{company.phone}</a>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-400"><Mail size={20} /></span>
            <div>
              <p className="text-sm text-slate-500">Email</p>
              <a href={`mailto:${company.email}`} className="break-all font-medium hover:text-orange-300">{company.email}</a>
            </div>
          </li>
          <li className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-orange-500/10 text-orange-400"><MapPin size={20} /></span>
            <div>
              <p className="text-sm text-slate-500">Address</p>
              <address className="font-medium not-italic leading-relaxed">
                {company.address.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </address>
            </div>
          </li>
        </ul>
      </div>

      <ContactForm />
    </div>
  );
}
