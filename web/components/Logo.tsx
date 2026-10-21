import Link from "next/link";

export function LogoMark({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect width="64" height="64" rx="10" fill="#0284c7" />
      <path d="M47 19 C 42 33, 37 45, 26.5 45 C 18.5 45, 14.5 38.5, 14.5 32 C 14.5 25, 19.5 19, 27 19 C 36.5 19, 41 35, 49.5 45" fill="none" stroke="#ffffff" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Alpha Automations home">
      <LogoMark className="h-10 w-10 shrink-0 sm:h-11 sm:w-11" />
      <span className="leading-none">
        <span className={`block whitespace-nowrap text-lg font-bold tracking-tight sm:text-xl ${light ? "text-white" : "text-slate-900"}`}>
          ALPHA <span className="font-medium">AUTOMATIONS</span>
        </span>
        <span className={`mt-1.5 block text-[0.7rem] font-medium uppercase tracking-[0.28em] ${light ? "text-sky-200" : "text-sky-700"}`}>
          Moving forward
        </span>
      </span>
    </Link>
  );
}
