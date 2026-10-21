import type { Metadata } from "next";
import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import { company } from "@/lib/content";
import { Page } from "@/components/Page";
import { ContactForm } from "@/components/ContactForm";
import { PageHeader } from "@/components/Section";

export const metadata: Metadata = {
  title: "Contact",
  description: "Call, email or send Alpha Automations your requirement. We'll get back to you and visit your shop floor.",
};

export default function ContactPage() {
  const ways = [
    { icon: Phone, label: "Call us", value: company.phone, href: company.phoneHref },
    { icon: Mail, label: "Email us", value: company.email, href: `mailto:${company.email}` },
  ];

  return (
    <Page>
      <PageHeader
        eyebrow="Contact"
        title="Let's talk about your shop floor"
        intro="Leave your details and tell us what you want to automate. Our team will call you back and, where it helps, visit your genba to see it first-hand."
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 md:py-20 lg:grid-cols-[1fr_1.5fr]">
        <aside className="space-y-5">
          {ways.map(({ icon: Icon, label, value, href }) => (
            <a key={label} href={href} className="flex items-center gap-5 rounded-md border border-slate-200 bg-white p-6 hover:border-sky-300">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-sky-600 text-white">
                <Icon size={26} />
              </span>
              <span className="min-w-0">
                <span className="block text-slate-500">{label}</span>
                <span className="block break-all text-lg font-semibold text-slate-900">{value}</span>
              </span>
            </a>
          ))}

          <div className="rounded-md border border-slate-200 bg-white p-6">
            <div className="flex items-start gap-5">
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-md bg-sky-600 text-white">
                <MapPin size={26} />
              </span>
              <div>
                <p className="text-slate-500">Visit us</p>
                <address className="text-lg font-semibold not-italic leading-relaxed text-slate-900">
                  {company.address.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </address>
                <a
                  href={company.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 font-medium text-sky-700 hover:underline"
                >
                  Open in Google Maps <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </div>

          <p className="flex items-center gap-3 rounded-md bg-sky-50 p-6 text-slate-600">
            <Clock size={22} className="shrink-0 text-sky-500" />
            Every enquiry goes straight to our team, and we reply as soon as we can.
          </p>
        </aside>

        <ContactForm />
      </div>
    </Page>
  );
}
