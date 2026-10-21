import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Alpha Automations home">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-orange-500 text-lg font-black text-slate-950">
        α
      </span>
      <span className="leading-tight">
        <span className="block font-bold tracking-tight">Alpha Automations</span>
        <span className="block text-[11px] uppercase tracking-[0.2em] text-slate-400">Moving forward</span>
      </span>
    </Link>
  );
}
