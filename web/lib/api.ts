// Types shared with the Go backend, plus helpers for calling it from the server.

export type Project = {
  id: number;
  slug: string;
  title: string;
  industry: string;
  summary: string;
  problem: string;
  solution: string;
  result: string;
  technologies: string[];
  imageUrl: string;
  completedOn: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EnquiryStatus = "new" | "contacted" | "won" | "lost" | "archived";

export type Enquiry = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  message: string;
  status: EnquiryStatus;
  createdAt: string;
};

export type MachineStatus = "RUNNING" | "IDLE" | "FAULT";

export type OEE = { availability: number; performance: number; quality: number; oee: number };

export type MachineState = {
  id: string;
  name: string;
  kind: string;
  status: MachineStatus;
  reason: string;
  statusSince: string;
  goodParts: number;
  rejectedParts: number;
  lastCycleSec: number;
  idealCycleSec: number;
  oee: OEE;
};

export type MachineEvent = {
  time: string;
  machineId: string;
  machineName: string;
  from: MachineStatus;
  to: MachineStatus;
  code: string;
  message: string;
};

export type MonitorSnapshot = {
  time: string;
  machines: MachineState[];
  line: OEE;
  goodParts: number;
  rejectedParts: number;
  events: MachineEvent[];
};

// Server components call the backend directly; the browser goes through the /api rewrite.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

/** Published projects, or null if the backend can't be reached. */
export async function getPublishedProjects(): Promise<Project[] | null> {
  try {
    const res = await fetch(`${backendUrl}/api/projects`);
    if (!res.ok) return null;
    return (await res.json()) as Project[];
  } catch {
    return null;
  }
}

/** One published project, "not-found", or null if the backend can't be reached. */
export async function getProject(slug: string): Promise<Project | "not-found" | null> {
  try {
    const res = await fetch(`${backendUrl}/api/projects/${encodeURIComponent(slug)}`);
    if (res.status === 404) return "not-found";
    if (!res.ok) return null;
    return (await res.json()) as Project;
  } catch {
    return null;
  }
}

export function formatDate(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
}

export function percent(x: number) {
  return `${Math.round(x * 100)}%`;
}
