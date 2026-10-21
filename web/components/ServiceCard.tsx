import { Activity, Cpu, Factory, MonitorSmartphone, PanelsTopLeft, ScanLine, ShieldCheck, Wind, Wrench, Zap } from "lucide-react";
import type { Service, ServiceIcon } from "@/lib/content";

const icons: Record<ServiceIcon, typeof Factory> = {
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

export function ServiceCard({ service }: { service: Service }) {
  const Icon = icons[service.icon];
  return (
    <div className="group rounded-xl border border-slate-800 bg-slate-900/50 p-6 transition hover:border-orange-500/50 hover:bg-slate-900">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-orange-500/10 text-orange-400 transition group-hover:bg-orange-500 group-hover:text-slate-950">
        <Icon size={22} />
      </span>
      <h3 className="mt-5 font-semibold">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{service.description}</p>
    </div>
  );
}
