"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LockKeyhole, Mail, MapPin, Menu, Phone, X } from "lucide-react";
import { company } from "@/lib/content";
import { Logo } from "./Logo";

const links = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/services", label: "Services" },
  { href: "/ongoing", label: "Ongoing Projects" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  // Reading the URL can wait for request time on some pages, so the bar first renders without a highlighted link.
  return (
    <Suspense fallback={<NavbarView pathname={null} />}>
      <NavbarWithPath />
    </Suspense>
  );
}

function NavbarWithPath() {
  return <NavbarView pathname={usePathname()} />;
}

function NavbarView({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => pathname !== null && (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header style={{ viewTransitionName: "site-header" }} className="sticky top-0 z-50">
      {/* Contact strip, like most industrial company sites. Hidden on phones to save space. */}
      <div className="hidden bg-slate-900 text-sm text-slate-300 md:block">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-5 sm:px-8">
          <span className="flex items-center gap-2">
            <MapPin size={15} className="text-sky-400" /> Kengeri, Bengaluru, Karnataka
          </span>
          <div className="flex items-center gap-6">
            <a href={company.phoneHref} className="flex items-center gap-2 transition hover:text-white">
              <Phone size={15} className="text-sky-400" /> {company.phone}
            </a>
            <a href={`mailto:${company.email}`} className="flex items-center gap-2 transition hover:text-white">
              <Mail size={15} className="text-sky-400" /> {company.email}
            </a>
          </div>
        </div>
      </div>

      <div className={`border-b border-slate-200 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md shadow-slate-900/5" : ""}`}>
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Logo />

          <div className="hidden h-full items-center lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex h-full items-center px-3.5 font-medium transition-colors xl:px-4 ${
                  isActive(l.href) ? "text-sky-700" : "text-slate-700 hover:text-sky-700"
                }`}
              >
                {l.label}
                <span
                  className={`absolute inset-x-3.5 bottom-0 h-[3px] bg-sky-600 transition-transform duration-300 xl:inset-x-4 ${isActive(l.href) ? "scale-x-100" : "scale-x-0"}`}
                />
              </Link>
            ))}
            <div className="ml-3 flex items-center gap-3 border-l border-slate-200 pl-5">
              <Link
                href="/admin"
                className={`flex items-center gap-2 rounded-md border px-4 py-2.5 font-medium transition ${
                  isActive("/admin") ? "border-sky-600 text-sky-700" : "border-slate-300 text-slate-700 hover:border-sky-600 hover:text-sky-700"
                }`}
              >
                <LockKeyhole size={17} /> Owner login
              </Link>
              <Link href="/contact" className="rounded-md bg-sky-600 px-5 py-2.5 font-semibold text-white transition hover:bg-sky-700">
                Get a quote
              </Link>
            </div>
          </div>

          <button
            type="button"
            className="rounded-md p-2.5 text-slate-800 transition hover:bg-slate-100 lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>

        <div className={`grid overflow-hidden transition-all duration-300 ease-out lg:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="min-h-0">
            <div className="border-t border-slate-200 px-5 pb-6 pt-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-slate-100 py-4 text-lg font-medium ${isActive(l.href) ? "text-sky-700" : "text-slate-800"}`}
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center justify-center gap-2 rounded-md border border-slate-300 py-3.5 font-medium text-slate-800">
                  <LockKeyhole size={18} /> Owner login
                </Link>
                <Link href="/contact" onClick={() => setOpen(false)} className="rounded-md bg-sky-600 py-3.5 text-center font-semibold text-white">
                  Get a quote
                </Link>
              </div>
              <a href={company.phoneHref} className="mt-4 flex items-center justify-center gap-2 py-2 font-medium text-sky-700">
                <Phone size={18} /> {company.phone}
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
