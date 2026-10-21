import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

// The main pages Google should know about. Individual project pages are found through links on these pages.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" }[] = [
    { path: "", priority: 1, changeFrequency: "monthly" },
    { path: "/projects", priority: 0.9, changeFrequency: "weekly" },
    { path: "/services", priority: 0.9, changeFrequency: "monthly" },
    { path: "/ongoing", priority: 0.7, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  ];
  return pages.map((p) => ({ url: `${siteUrl}${p.path}`, priority: p.priority, changeFrequency: p.changeFrequency }));
}
