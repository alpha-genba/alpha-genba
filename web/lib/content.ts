// Company details and website copy, kept in one place so they are easy to update.

export const company = {
  name: "Alpha Automations",
  tagline: "Moving forward",
  phone: "+91 99459 59359",
  phoneHref: "tel:+919945959359",
  email: "AlphaAutomations.ps@gmail.com",
  address: ["1948, 3rd Block, Sir M V Layout", "Kengeri, Bengaluru 560110", "Karnataka, India"],
};

export type ServiceIcon =
  | "factory"
  | "panel"
  | "cpu"
  | "zap"
  | "wind"
  | "shield"
  | "activity"
  | "monitor"
  | "wrench"
  | "scan";

export type Service = { title: string; description: string; icon: ServiceIcon };

export const services: Service[] = [
  {
    title: "Special Purpose Machines",
    description:
      "Complete automated and semi-automated machines, designed around your process for consistent quality and maximum output.",
    icon: "factory",
  },
  {
    title: "Electrical Control Panels",
    description:
      "PLC-controlled electrical control panels, designed, wired and tested in-house to industrial standards.",
    icon: "panel",
  },
  {
    title: "Mitsubishi PLC Solutions",
    description:
      "Programming and integration with Mitsubishi Q-Series and FX-Series PLCs, servo drives and VFDs.",
    icon: "cpu",
  },
  {
    title: "Siemens PLC & Drives",
    description: "Automation built on Siemens PLCs and drives, from new machines to upgrades of existing lines.",
    icon: "zap",
  },
  {
    title: "Pneumatic Logic & Circuits",
    description: "Pneumatic logic and circuit solutions for clamping, pressing, handling and actuation.",
    icon: "wind",
  },
  {
    title: "Panel Wiring & Poka-Yoke",
    description:
      "Control panel wiring and Poka-Yoke (error-proofing) systems that stop defects before they happen.",
    icon: "shield",
  },
  {
    title: "Production Monitoring (Andon)",
    description:
      "Andon systems for production control and monitoring, so problems on the line are seen and fixed fast.",
    icon: "activity",
  },
  {
    title: "HMI & Industrial Communication",
    description: "Operator HMI interfaces and machine communication over industrial networks such as FL-net and Profibus.",
    icon: "monitor",
  },
  {
    title: "Screwing Solutions",
    description: "Automated screwing stations for accurate, repeatable fastening with every part.",
    icon: "wrench",
  },
  {
    title: "Vision, Scanning & Printing",
    description: "Vision inspection systems, barcode scanners and printing solutions for quality and traceability.",
    icon: "scan",
  },
];

export const approachSteps = [
  {
    title: "Go to the genba",
    description:
      "We visit your shop floor and study the actual issue: the process, the operators, the bottlenecks and the defects.",
  },
  {
    title: "Design the solution",
    description:
      "Mechanical, electrical, pneumatic and PLC design, built around the exact problem we saw, not a generic catalogue machine.",
  },
  {
    title: "Build and test",
    description: "We manufacture the machine and control panel, then test it thoroughly before it leaves our facility.",
  },
  {
    title: "Install and support",
    description: "We install and commission at your site, and stay with you until the machine runs the way it should.",
  },
];

export const strengths = [
  {
    title: "Consistency",
    description: "Every part made the same way, every shift. Automation removes the variation that manual work brings.",
  },
  {
    title: "Maximum output",
    description: "Machines designed around your cycle time and process, to get the most from every hour of production.",
  },
  {
    title: "Error-proofing built in",
    description: "Poka-Yoke and vision checks catch mistakes at the machine, before a defective part moves on.",
  },
  {
    title: "One team, start to finish",
    description: "Design, panel building, programming, manufacturing and installation, all handled by one experienced team.",
  },
];
