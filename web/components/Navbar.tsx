"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const links = [
  { href: "/#services", label: "Services" },
  { href: "/#approach", label: "Our Approach" },
  { href: "/projects", label: "Projects" },
  { href: "/live", label: "Live Demo" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <div className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-sm text-slate-300 transition hover:text-white">
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-orange-400"
          >
            Request a Quote
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-slate-300 hover:bg-slate-800 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-slate-800 bg-slate-950 px-4 pb-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block border-b border-slate-800/70 py-3 text-slate-200"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-4 block rounded-md bg-orange-500 py-3 text-center font-semibold text-slate-950"
          >
            Request a Quote
          </Link>
        </div>
      )}
    </header>
  );
}
