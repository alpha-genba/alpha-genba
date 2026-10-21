import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/track/", "/api/"], // team pages and clients' private links stay out of search
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
