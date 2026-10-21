import type { Metadata } from "next";
import { LiveDashboard } from "@/components/LiveDashboard";

export const metadata: Metadata = {
  title: "Live Monitoring Demo",
  description: "Alpha Genba live monitoring: machine status, digital Andon alerts and OEE, updated every second.",
};

export default function LivePage() {
  return <LiveDashboard />;
}
