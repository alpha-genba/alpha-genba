// The website's public address. Set SITE_URL when the site goes online, e.g. SITE_URL=https://alphaautomations.in
// Google uses it for the sitemap, page links and the company details on the home page.
export const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
