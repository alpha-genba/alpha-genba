// Company details and website copy, kept in one place so they are easy to update.
// Everything here comes from the Alpha Automations catalogue. Please have the team review it before launch.

export const company = {
  name: "Alpha Automations",
  tagline: "Moving forward",
  phone: "+91 99459 59359",
  phoneHref: "tel:+919945959359",
  email: "AlphaAutomations.ps@gmail.com",
  address: ["1948, 3rd Block, Sir M V Layout", "Kengeri, Bengaluru 560110", "Karnataka, India"],
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Sir+M+V+Layout+Kengeri+Bengaluru+560110",
  intro:
    "Alpha Automations is an engineering house formed to provide complete solutions for the industrial automation requirements of every industry. We work in automation and electrical control panels, with a strong, experienced team in the engineering, design and implementation of electrical, automation and software applications.",
};

/**
 * Photos used around the website. Until a path is set, a neat placeholder shows instead.
 * To add one: copy the photo into web/public/images/ and write its path here, e.g. hero: "/images/hero.jpg".
 * Wide landscape photos (at least 1600 px wide) look best.
 */
export const photos = {
  hero: "", // a finished machine or the shop floor, the first thing visitors see
  about: "", // the team at work, or the workshop
  panels: "", // an open electrical control panel with neat wiring
  workshop: "", // machine assembly in progress
};

/**
 * The people behind Alpha Automations, shown on the home page.
 * The section stays hidden until at least one person is added, for example:
 *   { name: "Full name", role: "Founder & Lead Engineer", bio: "One or two lines about their experience." },
 */
export const team: { name: string; role: string; bio: string }[] = [];

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

export type Service = {
  slug: string;
  title: string;
  description: string; // one line, used on cards
  details: string; // what it is, in plain words
  youGet: string[]; // what the client receives
  usedFor: string[]; // typical applications
  icon: ServiceIcon;
};

export const services: Service[] = [
  {
    slug: "special-purpose-machines",
    title: "Automated & Semi-Automated Machines",
    description: "Complete machines designed around your process, for consistent quality and maximum output.",
    details:
      "We design and manufacture complete automated and semi-automated machines (also called special purpose machines) built for one job on your line: assembling, pressing, fastening, inspecting, marking or testing. Each machine is designed after studying your actual process at the genba.",
    youGet: ["Mechanical, electrical and pneumatic design", "Manufactured and assembled machine", "PLC program and operator HMI", "Trial runs, installation and handover"],
    usedFor: ["Assembly stations", "Pressing and fitting", "Testing and inspection rigs", "Part handling and transfer"],
    icon: "factory",
  },
  {
    slug: "control-panels",
    title: "Electrical Control Panels",
    description: "PLC-controlled electrical control panels, designed, wired and tested in-house.",
    details:
      "The control panel is the brain and nervous system of a machine. We design and build PLC-controlled electrical control panels, from new panels for new machines to upgrades of older panels that have become unreliable.",
    youGet: ["Panel design and wiring drawings", "Neat, labelled panel wiring", "PLC, drives, HMI and safety devices fitted", "Tested before dispatch"],
    usedFor: ["New machines", "Upgrading old relay-based panels", "Line and conveyor control", "Utility and process control"],
    icon: "panel",
  },
  {
    slug: "mitsubishi-plc",
    title: "Mitsubishi PLC, Servo & VFD",
    description: "Mitsubishi Q-Series and FX-Series PLCs, servo drives and VFDs.",
    details:
      "We program and integrate Mitsubishi Q-Series and FX-Series PLCs together with servo drives for precise motion and VFDs (variable frequency drives) for smooth, energy-saving motor speed control.",
    youGet: ["PLC programming", "Servo motion set-up", "VFD selection and tuning", "Documentation of the program"],
    usedFor: ["Precise positioning", "Pick-and-place motion", "Conveyor speed control", "Indexing tables"],
    icon: "cpu",
  },
  {
    slug: "siemens-plc",
    title: "Siemens PLC & Drives",
    description: "Automation built on Siemens PLCs and drives, for new machines and upgrades.",
    details:
      "For plants that standardise on Siemens, we build automation on Siemens PLCs and drives, both for new machines and for modifying existing ones.",
    youGet: ["Siemens PLC programming", "Drive configuration", "Integration with existing equipment", "Commissioning on site"],
    usedFor: ["New machine control", "Machine modifications", "Drive retrofits", "Process control"],
    icon: "zap",
  },
  {
    slug: "pneumatics",
    title: "Pneumatic Logic & Circuits",
    description: "Pneumatic logic and circuit solutions for clamping, pressing and actuation.",
    details:
      "Compressed air powers a lot of factory movement: clamps, cylinders, grippers and presses. We design pneumatic logic and circuits that move reliably, safely and at the right speed.",
    youGet: ["Pneumatic circuit design", "Valve and cylinder selection", "Fitting and piping", "Speed and pressure adjustment"],
    usedFor: ["Clamping fixtures", "Pneumatic presses", "Grippers and pushers", "Air-operated tooling"],
    icon: "wind",
  },
  {
    slug: "poka-yoke",
    title: "Panel Wiring & Poka-Yoke",
    description: "Control panel wiring and Poka-Yoke (error-proofing) that stops defects before they happen.",
    details:
      "Poka-Yoke is a Japanese term for error-proofing: designing a process so a mistake either can't happen or is caught immediately. We add sensors and logic that check every part (is it present, the right way round, the right model) before the machine continues.",
    youGet: ["Error-proofing study of your process", "Sensors and interlocks", "PLC logic that blocks bad parts", "Clear alarms for operators"],
    usedFor: ["Missing-part detection", "Wrong-orientation checks", "Model mix-up prevention", "Sequence enforcement"],
    icon: "shield",
  },
  {
    slug: "andon",
    title: "Production Monitoring (Andon)",
    description: "Andon systems for production control, so problems on the line are seen and fixed fast.",
    details:
      "Andon is a visual signal (lights, a board or a screen) that shows the status of the line. When a machine stops, everyone can see where and why, so the right person reacts quickly. We build Andon and production monitoring systems connected to your machines.",
    youGet: ["Andon lights or display boards", "Machine status connected from the PLC", "Production counts and targets", "Downtime visibility"],
    usedFor: ["Assembly lines", "Machine shops", "Shift production tracking", "Supervisor alerts"],
    icon: "activity",
  },
  {
    slug: "hmi-communication",
    title: "HMI & Industrial Communication",
    description: "Operator HMI screens and machine networking over FL-net and Profibus.",
    details:
      "The HMI (Human-Machine Interface) is the touch screen operators use to run a machine. We design clear HMI screens and connect machines and PLCs together over industrial networks such as FL-net and Profibus.",
    youGet: ["HMI screen design", "Recipes, alarms and counters on screen", "PLC-to-PLC communication", "Network set-up and testing"],
    usedFor: ["Operator panels", "Line-level data sharing", "Connecting machines from different makers", "Central monitoring"],
    icon: "monitor",
  },
  {
    slug: "screwing",
    title: "Screwing Solutions",
    description: "Automated screwing stations for accurate, repeatable fastening.",
    details:
      "Manual screwing leads to missed, loose or over-tightened screws. Our automated screwing solutions fasten every screw in the right place, in the right sequence and to the right tightness.",
    youGet: ["Screwing station design", "Screw feeding and positioning", "Missed-screw detection", "Sequence and count checks"],
    usedFor: ["Electrical and electronic assemblies", "Automotive components", "Appliance assembly", "Multi-screw products"],
    icon: "wrench",
  },
  {
    slug: "vision-scanning-printing",
    title: "Vision, Scanning & Printing",
    description: "Vision inspection, barcode scanning and printing for quality and traceability.",
    details:
      "Cameras can check what the human eye misses, every single time. We integrate vision inspection systems, barcode and QR scanners, and printing or marking so every part is checked and can be traced.",
    youGet: ["Camera and lighting selection", "Inspection set-up", "Scanner and printer integration", "Pass/fail linked to the machine"],
    usedFor: ["Presence and dimension checks", "Label and print verification", "Part traceability", "Final inspection"],
    icon: "scan",
  },
];

/** Why automate: the benefits clients can expect. */
export const benefits = [
  { title: "Consistency", description: "Every part made the same way, every shift. Machines don't get tired or distracted." },
  { title: "Maximum output", description: "Faster, steadier cycle times mean more good parts from every hour of production." },
  { title: "Fewer defects", description: "Poka-Yoke and vision checks stop mistakes at the machine, before they reach your customer." },
  { title: "Safer work", description: "Machines take over repetitive, heavy or risky tasks, with safety interlocks built in." },
  { title: "Traceability", description: "Scanning, printing and data logging let you trace every part back to when and how it was made." },
  { title: "Visibility", description: "Andon and monitoring show what's happening on the line right now, not at the end of the shift." },
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
    description: "We install and commission the machine at your site and hand it over to your team.",
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

/** Kinds of industries that commonly use these solutions (not a client list). */
export const industries = [
  "Automotive components",
  "Electrical & electronics",
  "Home appliances",
  "Engineering & fabrication",
  "Packaging",
  "Plastics & moulding",
  "Pharma & healthcare",
  "Consumer goods",
];

export const faqs = [
  {
    q: "Do you only work with large factories?",
    a: "No. We work with companies of every size. A single semi-automated station can make a big difference on a small line, and the same approach scales to complete lines.",
  },
  {
    q: "Can you upgrade our existing machine instead of building a new one?",
    a: "Often, yes. We can add Poka-Yoke checks, replace old control panels, add a PLC or HMI, or connect a machine to Andon monitoring.",
  },
  {
    q: "Which PLC brands do you work with?",
    a: "We work with Mitsubishi (Q-Series and FX-Series) and Siemens PLCs and drives, along with servo drives, VFDs and HMIs.",
  },
  {
    q: "How does a project start?",
    a: "Send us a quote request or call us. We'll discuss your requirement, visit your shop floor to see the process first-hand, and then propose a solution.",
  },
  {
    q: "Can we follow the progress of our machine while it's being built?",
    a: "Yes. Every ongoing project gets updates with photos, videos and a progress percentage. We send you a private link to follow your own project.",
  },
];

/** Stages an ongoing project moves through, with labels for the website. */
export const stages = [
  { value: "design", label: "Design" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "assembly", label: "Assembly" },
  { value: "testing", label: "Testing" },
  { value: "installation", label: "Installation" },
  { value: "completed", label: "Completed" },
] as const;

export type Stage = (typeof stages)[number]["value"];

export function stageLabel(value: string) {
  return stages.find((s) => s.value === value)?.label ?? value;
}
