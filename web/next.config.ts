import type { NextConfig } from "next";

// Where the Go backend runs. The website forwards every /api request to it,
// so the browser only ever talks to one address.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
    // Uploads pass through the /api forwarding below, which holds at most 10 MB by default.
    // Admins upload videos up to 300 MB (the backend's limit), so allow a little more than that.
    proxyClientMaxBodySize: "320mb",
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }];
  },
};

export default nextConfig;
