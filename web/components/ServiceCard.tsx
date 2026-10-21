import Link from "next/link";
import { Activity, ArrowRight, Cpu, Factory, MonitorSmartphone, PanelsTopLeft, ScanLine, ShieldCheck, Wind, Wrench, Zap } from "lucide-react";
import type { Service, ServiceIcon } from "@/lib/content";

export const serviceIcons: Record<ServiceIcon, typeof Factory> = {
  factory: Factory,
  panel: PanelsTopLeft,
  cpu: Cpu,
  zap: Zap,
  wind: Wind,
  shield: ShieldCheck,
  activity: Activity,
  monitor: MonitorSmartphone,
  wrench: Wrench,
  scan: ScanLine,
};

export function ServiceCard({ service, index }: { service: Service; index: number }) {
  const Icon = serviceIcons[service.icon];
  return (
    <Link
      href={`/services#${service.slug}`}
      className="group relative flex h-full flex-col border border-slate-200 bg-white p-7 transition-colors duration-300 hover:border-sky-600"
    >
      <span className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 bg-sky-600 transition-transform duration-300 group-hover:scale-x-100" aria-hidden="true" />
      <div className="flex items-start justify-between">
        <Icon size={34} strokeWidth={1.6} className="text-sky-700" />
        <span className="font-mono text-sm text-slate-400">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="mt-6 text-xl font-semibold text-slate-900">{service.title}</h3>
      <p className="mt-2 flex-1 leading-relaxed text-slate-600">{service.description}</p>
      <span className="mt-6 flex items-center gap-2 font-semibold text-sky-700">
        Learn more <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
