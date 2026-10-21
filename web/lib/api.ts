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
  gallery: string[];
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
  adminNote: string;
  createdAt: string;
};

export type Media = { kind: "image" | "video"; url: string };

export type ProjectUpdate = {
  id: number;
  projectId: number;
  title: string;
  message: string;
  progress: number;
  stage: string;
  media: Media[];
  createdAt: string;
};

export type OngoingProject = {
  id: number;
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  stage: string;
  progress: number;
  expectedCompletion: string;
  coverUrl: string;
  visibility: "public" | "private";
  shareToken?: string; // only present for the admin
  createdAt: string;
  updatedAt: string;
  updates?: ProjectUpdate[];
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

/** Public ongoing projects, or null if the backend can't be reached. */
export async function getPublicOngoing(): Promise<OngoingProject[] | null> {
  try {
    const res = await fetch(`${backendUrl}/api/ongoing`);
    if (!res.ok) return null;
    return (await res.json()) as OngoingProject[];
  } catch {
    return null;
  }
}

/** One ongoing project with its updates, by public slug or by private tracking token. */
export async function getOngoing(by: "slug" | "token", value: string): Promise<OngoingProject | "not-found" | null> {
  const path = by === "slug" ? `ongoing/${encodeURIComponent(value)}` : `track/${encodeURIComponent(value)}`;
  try {
    const res = await fetch(`${backendUrl}/api/${path}`);
    if (res.status === 404) return "not-found";
    if (!res.ok) return null;
    return (await res.json()) as OngoingProject;
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
